// Bluebonnet builder: business owners make, save, and publish their own website.
// Run: node app/server.mjs  → http://localhost:4330   (no packages to install; needs Node 22.13+ for node:sqlite)
//
//   /              landing page          /build        the builder (works before signing up; draft kept in the browser)
//   /signup /login accounts              /s/<slug>/    a published business site
//   /api/...       JSON used by the builder (all writes require a JSON body, which plain cross-site forms can't send)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMockup } from '../mockup/render.mjs';
import { THEMES } from '../mockup/presets.mjs';
import * as db from './db.mjs';
import { landingPage, authPage, builderPage, notFoundPage } from './pages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4330;

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
  if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) return { error: 'That email address doesn’t look right.' };
  return missing.length ? { error: `Add your ${missing.join(' and ')} first.` } : { site };
}

// What the renderer gets: empty fields left out so it falls back to the trade's starter copy
export const toLead = (site, extra = {}) => Object.fromEntries(
  Object.entries({ ...site, ...extra }).filter(([, v]) => v !== '' && !(Array.isArray(v) && !v.length)),
);

// Credit line added to every published site's footer (also how other business owners find us)
const CREDIT = ' · <a href="/" style="color:inherit">Website made with Bluebonnet 🌼</a>';

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

const readJson = (req) => new Promise((resolve, reject) => {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) return reject(Object.assign(new Error('Expected JSON'), { status: 415 }));
  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 64_000) { reject(Object.assign(new Error('Too much data'), { status: 413 })); req.destroy(); }
  });
  req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(Object.assign(new Error('Bad JSON'), { status: 400 })); } });
  req.on('error', reject);
});

const publicSite = (s) => s && { slug: s.slug, data: s.data, published: s.published, updatedAt: s.updatedAt, url: `/s/${s.slug}/` };
const cleanEmail = (e) => str(e, 120).toLowerCase();

// ---- Routes
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const token = cookies(req).bb_session;
  const user = db.sessionUser(token);

  if (req.method === 'GET') {
    if (STATIC[path]) {
      const [file, type] = STATIC[path];
      return send(res, 200, await readFile(file), { 'content-type': type, 'cache-control': 'no-cache' });
    }
    if (path === '/') return html(res, 200, landingPage({ user }));
    if (path === '/build') return html(res, 200, builderPage({ user }));
    if (path === '/signup' || path === '/login') {
      if (user) return send(res, 302, '', { location: '/build' });
      return html(res, 200, authPage({ mode: path.slice(1) }));
    }
    if (path === '/api/me') return json(res, 200, { user, site: user ? publicSite(db.siteForUser(user.id)) : null });

    const m = path.match(/^\/s\/([a-z0-9-]+)\/?$/);
    if (m) {
      if (!path.endsWith('/')) return send(res, 301, '', { location: `${path}/` });
      const site = db.siteBySlug(m[1]);
      if (!site?.published) return html(res, 404, notFoundPage());
      const page = renderMockup(toLead(site.data, { url: `${isHttps(req) ? 'https' : 'http'}://${req.headers.host}/s/${site.slug}/` }), { final: true, quiet: true });
      return send(res, 200, page.replace('</div></footer>', `${CREDIT}</div></footer>`), { 'content-type': 'text/html; charset=utf-8' });
    }
    return html(res, 404, notFoundPage());
  }

  if (req.method !== 'POST' && req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });
  // Belt and braces with SameSite cookies: refuse writes that a browser says came from another site
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return json(res, 403, { error: 'Cross-site request refused' });
  const body = await readJson(req);

  if (path === '/api/signup') {
    const email = cleanEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Enter a valid email address.' });
    if (password.length < 8) return json(res, 400, { error: 'Use a password with at least 8 characters.' });
    if (password.length > 200) return json(res, 400, { error: 'That password is too long.' });
    const id = db.createUser(email, password);
    if (!id) return json(res, 409, { error: 'There’s already an account with that email. Log in instead.' });
    const s = db.createSession(id);
    return json(res, 201, { ok: true }, { 'set-cookie': sessionCookie(req, s.token, s.maxAge) });
  }
  if (path === '/api/login') {
    const id = db.verifyUser(cleanEmail(body.email), typeof body.password === 'string' ? body.password.slice(0, 200) : '');
    if (!id) return json(res, 401, { error: 'Wrong email or password.' });
    const s = db.createSession(id);
    return json(res, 200, { ok: true }, { 'set-cookie': sessionCookie(req, s.token, s.maxAge) });
  }
  if (path === '/api/logout') {
    if (token) db.endSession(token);
    return json(res, 200, { ok: true }, { 'set-cookie': sessionCookie(req, '', 0) });
  }

  if (!user) return json(res, 401, { error: 'Log in first.' });
  if (path === '/api/site' && req.method === 'PUT') {
    const { site, error } = cleanSite(body.data);
    if (error) return json(res, 400, { error });
    return json(res, 200, { site: publicSite(db.saveSite(user.id, site)) });
  }
  if (path === '/api/publish') {
    if (!db.siteForUser(user.id)) return json(res, 400, { error: 'Save your site before publishing.' });
    return json(res, 200, { site: publicSite(db.setPublished(user.id, body.published !== false)) });
  }
  return json(res, 404, { error: 'Not found' });
}

createServer((req, res) => {
  handle(req, res).catch((err) => {
    if (!err.status) console.error(err);
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong. Try again.' });
  });
}).listen(PORT, () => console.log(`Bluebonnet builder at http://localhost:${PORT}`));
