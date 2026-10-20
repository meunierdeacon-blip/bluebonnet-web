// HTML for the builder app's own pages. Business sites themselves come from mockup/render.mjs.
import { PRESETS } from '../mockup/presets.mjs';
import { CONFIG, PLAN_LABELS } from './config.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shell = ({ title, body, script = '', bodyClass = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/app.css">
${script ? `<script type="module" src="${script}"></script>` : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
</body>
</html>
`;

const logo = '<a class="logo" href="/">🌼 Bluebonnet</a>';

const accountLinks = (user) => (user
  ? `<span class="who">${esc(user.email)}</span><button class="link" type="button" data-logout>Log out</button>`
  : '<a class="link" href="/login">Log in</a>');

export const landingPage = ({ user }) => shell({
  title: 'Bluebonnet | Build your business website in minutes',
  script: '/assets/auth.js',
  body: `<header class="top"><div class="wrap">${logo}<nav>${accountLinks(user)}<a class="btn sm" href="/build">${user ? 'Open my site' : 'Start free'}</a></nav></div></header>
<main>
<section class="hero"><div class="wrap">
  <p class="eyebrow">For local service businesses in Texas</p>
  <h1>Your business website, live in five minutes.</h1>
  <p class="lede">Answer a few questions about your business and watch your site build itself. No designer, no code. Customers can find you on Google, see what you do, and call you in one tap.</p>
  <div class="actions"><a class="btn" href="/build">Build my site free</a>${user ? '' : '<a class="btn ghost" href="/login">I already have one</a>'}</div>
</div></section>
<section><div class="wrap">
  <h2>How it works</h2>
  <ol class="steps">
    <li><b>Tell us about your business.</b> Name, what you do, the towns you serve, and how customers reach you.</li>
    <li><b>Watch it build.</b> Your site updates as you type, on phone and desktop. Change the words, services, and colors.</li>
    <li><b>Publish.</b> Get a link to share on Google, Facebook, and your truck. Come back and edit anytime.</li>
  </ol>
</div></section>
<section><div class="wrap">
  <h2>Simple pricing</h2>
  <p class="lede">Building and previewing your site is free. Publish it for <b>${PLAN_LABELS.monthly.price} a ${PLAN_LABELS.monthly.per}</b>, or <b>${PLAN_LABELS.yearly.price} a ${PLAN_LABELS.yearly.per}</b> (${PLAN_LABELS.yearly.note}). Cancel anytime from your account.</p>
</div></section>
<section><div class="wrap">
  <h2>Pick your trade to start</h2>
  <div class="chips">${Object.entries(PRESETS).map(([trade, p]) => `<a class="chip" href="/build?trade=${encodeURIComponent(trade)}">${p.icon} ${esc(trade.replace(/\b\w/g, (c) => c.toUpperCase()))}</a>`).join('')}<a class="chip" href="/build">⭐ Something else</a></div>
</div></section>
</main>
${footer}`,
});

const footer = `<footer class="foot"><div class="wrap">© ${new Date().getFullYear()} Bluebonnet · Made in Austin, Texas · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="mailto:${esc(CONFIG.contactEmail)}">Contact</a></div></footer>`;

const AUTH = {
  signup: { title: 'Create your account', h1: 'Save your site', lede: 'Create a free account to save your site and publish it.', button: 'Create account' },
  login: { title: 'Log in', h1: 'Welcome back', lede: 'Log in to edit your site.', button: 'Log in' },
  forgot: { title: 'Reset your password', h1: 'Forgot your password?', lede: 'Enter your email and we’ll send you a link to choose a new one.', button: 'Send reset link' },
  reset: { title: 'Choose a new password', h1: 'Choose a new password', lede: 'After this you’ll be logged in, and logged out everywhere else.', button: 'Save new password' },
};

export const authPage = ({ mode }) => {
  const a = AUTH[mode];
  const email = mode !== 'reset' ? '<label>Email<input name="email" type="email" autocomplete="email" required></label>' : '';
  const password = mode !== 'forgot'
    ? `<label>${mode === 'reset' ? 'New password' : 'Password'}<input name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="8" required>${mode === 'login' ? '' : '<small>At least 8 characters.</small>'}</label>`
    : '';
  const below = {
    signup: 'Already have an account? <a href="/login">Log in</a>',
    login: 'New here? <a href="/signup">Create an account</a> · <a href="/forgot">Forgot password?</a>',
    forgot: 'Remembered it? <a href="/login">Log in</a>',
    reset: '<a href="/forgot">Need a new link?</a>',
  }[mode];
  return shell({
    title: `${a.title} | Bluebonnet`,
    script: '/assets/auth.js',
    bodyClass: 'center',
    body: `<main class="auth">
  ${logo}
  <h1>${a.h1}</h1>
  <p class="muted">${a.lede}</p>
  <form data-auth="${mode}" novalidate>
    ${email}
    ${password}
    <p class="error" role="alert" hidden></p>
    <p class="notice" role="status" hidden></p>
    <button class="btn" type="submit">${a.button}</button>
    ${mode === 'signup' ? '<p class="muted small">By creating an account you agree to the <a href="/terms" target="_blank">Terms</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.</p>' : ''}
  </form>
  <p class="muted small">${below}</p>
</main>`,
  });
};

const field = (label, name, { type = 'text', hint = '', attrs = '' } = {}) => `<label><span>${label}${hint ? ` <small>${hint}</small>` : ''}</span>${type === 'textarea'
  ? `<textarea name="${name}" ${attrs}></textarea>`
  : `<input name="${name}" type="${type}" ${attrs}>`}</label>`;

export const builderPage = ({ user }) => shell({
  title: 'Build your site | Bluebonnet',
  script: '/assets/builder.js',
  bodyClass: 'builder-page',
  body: `<header class="bar">
  ${logo}
  <span class="status" role="status" aria-live="polite"></span>
  <div class="device" role="group" aria-label="Preview size">
    <button type="button" data-device="phone" aria-pressed="true">Phone</button>
    <button type="button" data-device="desktop" aria-pressed="false">Desktop</button>
  </div>
  <a class="link live" target="_blank" rel="noopener" hidden>View live site ↗</a>
  <button class="link" type="button" data-billing hidden>Billing</button>
  <nav>${accountLinks(user)}</nav>
  <button class="btn sm" type="button" data-publish>${user ? 'Publish' : 'Save &amp; publish'}</button>
</header>
<div class="tabs" role="tablist">
  <button type="button" role="tab" data-tab="edit" aria-selected="true">Edit</button>
  <button type="button" role="tab" data-tab="preview" aria-selected="false">Preview</button>
</div>
<div class="builder" data-view="edit" data-logged-in="${user ? 'yes' : 'no'}">
  <form class="panel" autocomplete="off" novalidate>
    <fieldset>
      <legend>Your business</legend>
      ${field('Business name', 'name', { attrs: 'maxlength="80" placeholder="Juarez Lawn Service" required' })}
      <label>What do you do?<select name="trade"></select></label>
      <label data-other-trade hidden>Type of business<input name="otherTrade" maxlength="40" placeholder="Fence repair"></label>
      ${field('Main town', 'town', { attrs: 'maxlength="40" placeholder="Buda" required' })}
      ${field('Other towns you serve', 'areas', { hint: 'separate with commas', attrs: 'maxlength="300" placeholder="Kyle, San Marcos"' })}
    </fieldset>
    <fieldset>
      <legend>How customers reach you</legend>
      ${field('Phone', 'phone', { type: 'tel', attrs: 'maxlength="30" placeholder="(512) 555-0100"' })}
      <label class="check"><input type="checkbox" name="texts" checked> Customers can text this number</label>
      ${field('Email', 'email', { type: 'email', hint: 'optional', attrs: 'maxlength="120"' })}
    </fieldset>
    <fieldset>
      <legend>Your words</legend>
      <p class="muted small">Leave these blank to use the suggested text.</p>
      ${field('Headline', 'headline', { attrs: 'maxlength="100"' })}
      ${field('Short intro', 'intro', { type: 'textarea', attrs: 'maxlength="240" rows="2"' })}
      ${field('Button text', 'cta', { attrs: 'maxlength="40"' })}
      ${field('About you', 'about', { type: 'textarea', hint: 'optional', attrs: 'maxlength="1000" rows="4" placeholder="How long you’ve been in business, who you are, what makes you different."' })}
    </fieldset>
    <fieldset>
      <legend>Services</legend>
      <div class="services"></div>
      <button class="btn ghost sm" type="button" data-add-service>+ Add a service</button>
    </fieldset>
    <fieldset>
      <legend>Colors</legend>
      <div class="themes" role="radiogroup" aria-label="Color theme"></div>
    </fieldset>
  </form>
  <div class="stage">
    <div class="frame" data-device="phone"><iframe title="Preview of your website" sandbox="allow-same-origin"></iframe></div>
  </div>
</div>
<dialog class="plans">
  <h2>Pick a plan to publish</h2>
  <p class="muted">Your site goes live as soon as you pay. Cancel anytime from the Billing link.</p>
  <div class="plan-list">
    ${Object.entries(PLAN_LABELS).map(([id, p]) => `<button type="button" class="plan" data-plan="${id}"><b>${esc(p.name)}</b><span class="amt">${esc(p.price)}<small>/${esc(p.per)}</small></span>${p.note ? `<span class="tag">${esc(p.note)}</span>` : ''}</button>`).join('')}
  </div>
  <p class="error" role="alert" hidden></p>
  <p class="muted small">Payments are handled securely by Stripe. We never see your card number.</p>
  <div class="actions"><button class="btn ghost" type="button" data-close>Not yet</button></div>
</dialog>
<dialog class="published">
  <h2>Your site is live 🎉</h2>
  <p class="muted">Share this link on your Google listing, Facebook page, and business cards.</p>
  <p class="live-link"><a target="_blank" rel="noopener"></a></p>
  <div class="actions">
    <button class="btn" type="button" data-copy>Copy link</button>
    <button class="btn ghost" type="button" data-unpublish>Take it offline</button>
    <button class="btn ghost" type="button" data-close>Keep editing</button>
  </div>
</dialog>`,
});

const LEGAL = {
  terms: { title: 'Terms of Service', body: () => `
  <p>These terms are an agreement between you and Bluebonnet (“we”, “us”) for using the Bluebonnet website builder and the websites you publish with it. By creating an account, you agree to them.</p>
  <h2>Your account</h2>
  <p>You need an account to save and publish a site. Keep your password private; you’re responsible for what happens under your account. Tell us at ${esc(CONFIG.contactEmail)} if you think someone else is using it.</p>
  <h2>Your site and your content</h2>
  <p>You own everything you put on your site: your business name, words, and contact details. You give us permission to store it and show it on the internet so your site works. Only publish things that are true and that you have the right to use. Don’t use Bluebonnet for anything illegal, misleading, or harmful, or to pretend to be a business you don’t represent. We can take down a site that breaks these rules.</p>
  <h2>Plans and payment</h2>
  <p>Building and previewing a site is free. Publishing it needs a paid plan, billed monthly or yearly through Stripe until you cancel. You can cancel anytime from the Billing link in the builder; your site stays up until the end of the period you’ve paid for, then goes offline. Your work stays saved, so you can come back. We don’t give refunds for partial months or years, except where the law requires it. If we change prices, we’ll tell you by email at least 30 days before your next bill.</p>
  <h2>Availability</h2>
  <p>We work to keep sites online, but we can’t promise they’ll never go down. Bluebonnet is provided “as is”. To the extent the law allows, we aren’t liable for lost business or other indirect losses, and our total liability is limited to what you paid us in the last 12 months.</p>
  <h2>Ending your account</h2>
  <p>You can stop using Bluebonnet anytime. Email ${esc(CONFIG.contactEmail)} to have your account and site deleted. We can suspend or close accounts that break these terms.</p>
  <h2>Changes and contact</h2>
  <p>We may update these terms and will post the new version here. These terms are governed by the laws of Texas. Questions: <a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a>.</p>` },
  privacy: { title: 'Privacy Policy', body: () => `
  <p>This explains what Bluebonnet collects and what we do with it. Short version: we collect only what’s needed to run your site and your account, and we don’t sell it.</p>
  <h2>What we collect</h2>
  <ul>
    <li><b>Your account:</b> your email address and a scrambled (hashed) version of your password. We can’t see your actual password.</li>
    <li><b>Your site:</b> what you type into the builder. Anything you publish is public on your website, so only add contact details you want customers to see.</li>
    <li><b>Billing:</b> handled by Stripe. We never see or store your card number. We keep your Stripe customer ID and whether your plan is active.</li>
    <li><b>A login cookie:</b> one cookie that keeps you logged in. No advertising or tracking cookies.</li>
    <li><b>Basic server logs:</b> like most websites, our host may briefly keep IP addresses and requests for security and fixing problems.</li>
  </ul>
  <h2>Who we share it with</h2>
  <p>Only the services that run Bluebonnet: our hosting provider, Stripe for payments, and our email provider for password reset emails. We don’t sell your information or share it for advertising.</p>
  <h2>Your choices</h2>
  <p>You can edit your site anytime in the builder. To delete your account and site, or to ask what we have about you, email <a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a>.</p>
  <h2>Changes</h2>
  <p>If we change this policy, we’ll post the new version here.</p>` },
};

export const legalPage = (kind) => {
  const l = LEGAL[kind];
  return shell({
    title: `${l.title} | Bluebonnet`,
    body: `<header class="top"><div class="wrap">${logo}<nav><a class="btn sm" href="/build">Build my site</a></nav></div></header>
<main class="legal wrap">
  <h1>${l.title}</h1>
  <p class="muted small">Last updated October 20, 2026</p>
  ${l.body()}
</main>
${footer}`,
  });
};

export const notFoundPage = () => shell({
  title: 'Page not found | Bluebonnet',
  bodyClass: 'center',
  body: `<main class="auth">${logo}<h1>Page not found</h1><p class="muted">This site isn’t published, or the link is wrong.</p><a class="btn" href="/">Go to Bluebonnet</a></main>`,
});
