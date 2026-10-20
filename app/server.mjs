// Bluebonnet builder: business owners make, save, pay for, and publish their own website.
// Run: node app/server.mjs  → http://localhost:4330   (no packages to install; needs Node 22.13+ for node:sqlite)
// Settings come from environment variables (see config.mjs and LAUNCH.md). With none set, billing is off and
// published sites live at /s/<slug>/; with BASE_DOMAIN set, they live at <slug>.<BASE_DOMAIN>.
//
//   /                landing page             /build        the builder (works before signing up; draft kept in the browser)
//   /signup /login   accounts                 /forgot /reset password reset by email
//   /terms /privacy  legal pages              /api/...      JSON used by the builder
//   /api/stripe/webhook  Stripe tells us when subscriptions start, change, or end
// All writes except the webhook require a JSON body, which plain cross-site forms can't send.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMockup } from '../mockup/render.mjs';
import { THEMES } from '../mockup/presets.mjs';
import { CONFIG, PLAN_LABELS, billingEnabled, siteUrl } from './config.mjs';
import * as db from './db.mjs';
import * as stripe from './stripe.mjs';
import { sendEmail } from './email.mjs';
import { landingPage, authPage, builderPage, notFoundPage, legalPage } from './pages.mjs';

const here = dirname(fileURLToPath(import.meta.url));

// Files the browser needs. The builder imports the same renderer the server uses, so the preview matches the live site.
const STATIC = {
  '/lib/render.mjs': [join(here, '../mockup/render.mjs'), 'text/javascript'],
  '/lib/presets.mjs': [join(here, '../mockup/presets.mjs'), 'text/javascript'],
  '/assets/builder.js': [join(here, 'public/builder.js'), 'text/javascript'],
  '/assets/auth.js': [join(here, 'public/auth.js'), 'text/javascript'],
  '/assets/app.css': [join(here, 'public/app.css'), 'text/css'],
  '/favicon.svg': [join(here, '../src/static/favicon.svg'), 'image/svg+xml'],
};

const APP_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "frame-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
].join('; ');

// ---- Validating what the builder sends. Everything is length-capped; the renderer escapes it all on output.
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function cleanSite(input) {
  const d = input && typeof input === 'object' ? input : {};
  const site = {
    name: str(d.name, 80),
    trade: str(d.trade, 40).toLowerCase(),
    town: str(d.town, 40),
    areas: (Array.isArray(d.areas) ? d.areas : []).map((a) => str(a, 40)).filter(Boolean).slice(0, 12),
    phone: str(d.phone, 30),
    email: str(d.email, 120),
    texts: d.texts !== false,
    headline: str(d.headline, 100),
    intro: str(d.intro, 240),
    cta: str(d.cta, 40),
    about: str(d.about, 1000),
    theme: THEMES[d.theme] ? d.theme : '',
    services: (Array.isArray(d.services) ? d.services : [])
      .map((s) => ({ name: str(s?.name, 60), blurb: str(s?.blurb, 200) })).filter((s) => s.name).slice(0, 8),
  };
  const missing = [['name', 'business name'], ['trade', 'type of business'], ['town', 'main town']].filter(([k]) => !site[k]).map(([, label]) => label);
  if (site.email && !EMAIL_RE.test(site.email)) return { error: 'That email address doesn’t look right.' };
  return missing.length ? { error: `Add your ${missing.join(' and ')} first.` } : { site };
}

// What the renderer gets: empty fields left out so it falls back to the trade's starter copy
export const toLead = (site, extra = {}) => Object.fromEntries(
  Object.entries({ ...site, ...extra }).filter(([, v]) => v !== '' && !(Array.isArray(v) && !v.length)),
);

// A site is on the internet when its owner pressed Publish and (once billing is on) is paying
const isLive = (site) => !!site?.published && (!billingEnabled() || site.ownerPaying);

// Credit line added to every published site's footer (also how other business owners find us)
const CREDIT = ` · <a href="${CONFIG.appUrl}/" style="color:inherit">Website made with Bluebonnet 🌼</a>`;
const renderLiveSite = (site) => renderMockup(toLead(site.data, { url: siteUrl(site.slug) }), { final: true, quiet: true })
  .replace('</div></footer>', `${CREDIT}</div></footer>`);

// ---- Small helpers
const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map((c) => {
  const i = c.indexOf('=');
  return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
}));
const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https';
const sessionCookie = (req, token, maxAge) => `bb_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`;

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin', ...headers });
  res.end(body);
};
const html = (res, status, body) => send(res, status, body, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': APP_CSP });
const json = (res, status, obj, headers) => send(res, status, JSON.stringify(obj), { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers });
const siteHtml = (res, site) => send(res, 200, renderLiveSite(site), { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });

const readBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 64_000) { reject(Object.assign(new Error('Too much data'), { status: 413 })); req.destroy(); }
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});
const readJson = async (req) => {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw Object.assign(new Error('Expected JSON'), { status: 415 });
  try { return JSON.parse((await readBody(req)) || '{}'); } catch (e) { throw e.status ? e : Object.assign(new Error('Bad JSON'), { status: 400 }); }
};

// Simple per-IP limit on the account endpoints, so nobody can guess passwords or spam reset emails.
// In memory: resets when the app restarts, which is fine at this size.
const hits = new Map();
const clientIp = (req) => req.headers['fly-client-ip'] || req.socket.remoteAddress || '';
function tooMany(req, bucket, max, windowMs = 15 * 60e3) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { count: 1, reset: now + windowMs }); return false; }
  return ++h.count > max;
}
setInterval(() => { const now = Date.now(); for (const [k, h] of hits) if (h.reset < now) hits.delete(k); }, 60e3).unref();

const publicSite = (s) => s && { slug: s.slug, data: s.data, published: s.published, live: isLive(s), updatedAt: s.updatedAt, url: siteUrl(s.slug) };
const publicUser = (u) => u && { email: u.email, paying: u.paying, hasBilling: !!u.stripeCustomerId };
const cleanEmail = (e) => str(e, 120).toLowerCase();
const validPassword = (p) => (typeof p !== 'string' || p.length < 8 ? 'Use a password with at least 8 characters.' : p.length > 200 ? 'That password is too long.' : '');
const loginWith = (req, res, status, userId) => {
  const s = db.createSession(userId);
  return json(res, status, { ok: true }, { 'set-cookie': sessionCookie(req, s.token, s.maxAge) });
};

// ---- Customer sites on their own subdomain: juarez-lawn.bluebonnetsites.com
function subdomainOf(req) {
  if (!CONFIG.baseDomain) return null;
  const host = (req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
  if (!host.endsWith(`.${CONFIG.baseDomain}`)) return null;
  return host.slice(0, -(CONFIG.baseDomain.length + 1));
}

// ---- Routes
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (path === '/healthz') return send(res, 200, 'ok', { 'content-type': 'text/plain' });

  const sub = subdomainOf(req);
  if (sub === 'www') return send(res, 301, '', { location: `https://${CONFIG.baseDomain}${req.url}` });
  if (sub) {
    const site = /^[a-z0-9-]+$/.test(sub) && db.siteBySlug(sub);
    if (req.method !== 'GET' || path !== '/' || !isLive(site)) return html(res, 404, notFoundPage());
    return siteHtml(res, site);
  }

  if (req.method === 'POST' && path === '/api/stripe/webhook') return stripeWebhook(req, res);

  const token = cookies(req).bb_session;
  const user = db.sessionUser(token);

  if (req.method === 'GET') {
    if (STATIC[path]) {
      const [file, type] = STATIC[path];
      return send(res, 200, await readFile(file), { 'content-type': type, 'cache-control': 'no-cache' });
    }
    if (path === '/') return html(res, 200, landingPage({ user }));
    if (path === '/build') return html(res, 200, builderPage({ user }));
    if (['/signup', '/login', '/forgot', '/reset'].includes(path)) {
      if (user && path !== '/reset') return send(res, 302, '', { location: '/build' });
      return html(res, 200, authPage({ mode: path.slice(1) }));
    }
    if (path === '/terms' || path === '/privacy') return html(res, 200, legalPage(path.slice(1)));
    if (path === '/api/me') {
      return json(res, 200, {
        user: publicUser(user),
        site: user ? publicSite(db.siteForUser(user.id)) : null,
        billing: { enabled: billingEnabled(), plans: PLAN_LABELS },
      });
    }

    const m = path.match(/^\/s\/([a-z0-9-]+)\/?$/);
    if (m) {
      if (CONFIG.baseDomain) return send(res, 301, '', { location: siteUrl(m[1]) });
      if (!path.endsWith('/')) return send(res, 301, '', { location: `${path}/` });
      const site = db.siteBySlug(m[1]);
      return isLive(site) ? siteHtml(res, site) : html(res, 404, notFoundPage());
    }
    return html(res, 404, notFoundPage());
  }

  if (req.method !== 'POST' && req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });
  // Belt and braces with SameSite cookies: refuse writes that a browser says came from another site
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return json(res, 403, { error: 'Cross-site request refused' });
  const body = await readJson(req);

  // -- Accounts
  if (['/api/signup', '/api/login', '/api/forgot', '/api/reset'].includes(path) && tooMany(req, path, path === '/api/forgot' ? 5 : 20)) {
    return json(res, 429, { error: 'Too many tries. Wait 15 minutes and try again.' });
  }
  if (path === '/api/signup') {
    const email = cleanEmail(body.email);
    if (!EMAIL_RE.test(email)) return json(res, 400, { error: 'Enter a valid email address.' });
    const bad = validPassword(body.password);
    if (bad) return json(res, 400, { error: bad });
    const id = db.createUser(email, body.password);
    if (!id) return json(res, 409, { error: 'There’s already an account with that email. Log in instead.' });
    return loginWith(req, res, 201, id);
  }
  if (path === '/api/login') {
    const id = db.verifyUser(cleanEmail(body.email), typeof body.password === 'string' ? body.password.slice(0, 200) : '');
    if (!id) return json(res, 401, { error: 'Wrong email or password.' });
    return loginWith(req, res, 200, id);
  }
  if (path === '/api/logout') {
    if (token) db.endSession(token);
    return json(res, 200, { ok: true }, { 'set-cookie': sessionCookie(req, '', 0) });
  }
  if (path === '/api/forgot') {
    // Same answer whether or not the account exists, so this can't be used to check who has one
    const found = db.userByEmail(cleanEmail(body.email));
    if (found) {
      const link = `${CONFIG.appUrl}/reset?token=${db.createResetToken(found.id)}`;
      await sendEmail({
        to: found.email,
        subject: 'Reset your Bluebonnet password',
        text: `Someone (hopefully you) asked to reset the password for your Bluebonnet account.\n\nChoose a new password here (the link works for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email. Your password won't change.\n\nQuestions? Reply to ${CONFIG.contactEmail}.`,
      });
    }
    return json(res, 200, { ok: true });
  }
  if (path === '/api/reset') {
    const bad = validPassword(body.password);
    if (bad) return json(res, 400, { error: bad });
    const id = db.useResetToken(body.token, body.password);
    if (!id) return json(res, 400, { error: 'This reset link has expired or was already used. Ask for a new one.' });
    return loginWith(req, res, 200, id);
  }

  // -- Everything below needs an account
  if (!user) return json(res, 401, { error: 'Log in first.' });
  if (path === '/api/site' && req.method === 'PUT') {
    const { site, error } = cleanSite(body.data);
    if (error) return json(res, 400, { error });
    return json(res, 200, { site: publicSite(db.saveSite(user.id, site)) });
  }
  if (path === '/api/publish') {
    if (!db.siteForUser(user.id)) return json(res, 400, { error: 'Save your site before publishing.' });
    const publish = body.published !== false;
    if (publish && billingEnabled() && !user.paying) return json(res, 402, { needsPayment: true, error: 'Choose a plan to publish your site.' });
    return json(res, 200, { site: publicSite(db.setPublished(user.id, publish)) });
  }
  if (path === '/api/billing/checkout') {
    if (!billingEnabled()) return json(res, 400, { error: 'Billing isn’t set up yet.' });
    if (user.paying) return json(res, 400, { error: 'You already have a plan.' });
    const plan = body.plan === 'yearly' ? 'yearly' : 'monthly';
    if (!CONFIG.stripe.prices[plan]) return json(res, 500, { error: 'That plan isn’t set up yet.' });
    const session = await stripe.createCheckout({ user, plan });
    return json(res, 200, { url: session.url });
  }
  if (path === '/api/billing/portal') {
    if (!billingEnabled() || !user.stripeCustomerId) return json(res, 400, { error: 'No billing to manage yet.' });
    const portal = await stripe.createPortal({ user });
    return json(res, 200, { url: portal.url });
  }
  return json(res, 404, { error: 'Not found' });
}

async function stripeWebhook(req, res) {
  const raw = await readBody(req);
  if (!stripe.verifyWebhook(raw, req.headers['stripe-signature'])) return json(res, 400, { error: 'Bad signature' });
  const event = JSON.parse(raw);
  const change = stripe.subscriptionChange(event);
  if (change) {
    if (change.userId && change.customerId) db.setStripeCustomer(change.userId, change.customerId);
    db.updateSubscription(change);
    console.log(`Stripe: ${event.type} → user ${change.userId || `(customer ${change.customerId})`} is ${change.status}`);
  }
  return json(res, 200, { received: true });
}

createServer((req, res) => {
  handle(req, res).catch((err) => {
    if (!err.status) console.error(err);
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong. Try again.' });
  });
}).listen(CONFIG.port, () => {
  console.log(`Bluebonnet builder at http://localhost:${CONFIG.port}`);
  console.log(`  billing: ${billingEnabled() ? 'ON (Stripe)' : 'off (publishing is free)'} · sites at: ${siteUrl('<slug>')} · email: ${CONFIG.email.resendKey ? 'Resend' : 'printed here'}`);
});
