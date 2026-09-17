// Shared page shell and components. Pages export { path, title, description, main, ... } and build.mjs calls renderPage.
import { SITE, PLANS } from './site.mjs';
import { INDUSTRIES } from './industries.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const money = (n) => `$${n.toLocaleString('en-US')}`;

const CSS = `
:root{--bg:#faf7f0;--surface:#fff;--ink:#1b2a24;--muted:#5a6660;--line:#e4ded0;--accent:#3b5bdb;--accent-ink:#fff;--accent-soft:#e8edff;--good:#2f7d4f;--warn:#b4581b}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121815;--surface:#1a221e;--ink:#eef1ec;--muted:#a3ada7;--line:#2c3631;--accent:#8ea6ff;--accent-ink:#0f1633;--accent-soft:#232c4a;--good:#6fcf97;--warn:#f2a46b}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:Fraunces,Georgia,serif;line-height:1.15;margin:0 0 .5em;letter-spacing:-.01em}
h1{font-size:clamp(2.2rem,6vw,3.6rem)}
h2{font-size:clamp(1.7rem,4vw,2.4rem)}
h3{font-size:1.25rem}
p{margin:0 0 1em}
a{color:var(--accent)}
.wrap{max-width:1080px;margin:0 auto;padding:0 16px}
section{padding:72px 0;border-top:1px solid var(--line)}
section.tight{padding:48px 0}
.eyebrow{font-size:.8rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:.75rem}
.lede{font-size:1.15rem;color:var(--muted);max-width:40em}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:8px;z-index:20;background:var(--surface);padding:8px}
header{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:1.2rem;color:var(--ink);text-decoration:none;white-space:nowrap}
header nav a{color:var(--muted);text-decoration:none;margin-left:20px;font-size:.95rem}
header nav a:hover,header nav a[aria-current]{color:var(--ink)}
@media (max-width:760px){header nav a:not(.btn){display:none}}
.btn{display:inline-block;background:var(--accent);color:var(--accent-ink);padding:12px 20px;border-radius:10px;font-weight:600;text-decoration:none;border:0;font-size:1rem;cursor:pointer;font-family:inherit}
.btn:hover{filter:brightness(1.08)}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
header nav .btn{padding:8px 14px;font-size:.9rem;margin-left:20px;color:var(--accent-ink)}
.hero{padding:88px 0 72px;border-top:0}
.hero.sub{padding:64px 0 48px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.proof{margin-top:40px;display:flex;gap:28px;flex-wrap:wrap;color:var(--muted);font-size:.95rem}
.proof b{color:var(--ink);font-weight:600}
.crumbs{font-size:.9rem;color:var(--muted);margin-bottom:16px}
.crumbs a{color:var(--muted)}
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:32px}
.grid.small{grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px}
.card p{color:var(--muted);margin:0}
a.card{text-decoration:none;color:var(--ink);transition:border-color .15s}
a.card:hover{border-color:var(--accent)}
a.card.mini{padding:14px 18px;font-weight:600}
.price{display:flex;flex-direction:column}
.price .amt{font-family:Fraunces,Georgia,serif;font-size:2.4rem;font-weight:700;margin:4px 0 2px}
.price .amt small{font-size:1rem;font-family:Inter,sans-serif;color:var(--muted);font-weight:400}
.price ul{padding-left:1.1em;color:var(--muted);margin:16px 0 24px;flex:1}
.price li{margin-bottom:6px}
.price.featured{border:2px solid var(--accent)}
.tag{display:inline-block;align-self:flex-start;background:var(--accent-soft);color:var(--accent);font-size:.75rem;font-weight:600;padding:3px 10px;border-radius:99px;margin-bottom:8px}
.split{display:grid;gap:32px;grid-template-columns:1.1fr 1fr;align-items:center}
@media (max-width:800px){.split{grid-template-columns:1fr}}
.browser{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:0 20px 40px -24px rgba(0,0,0,.25)}
.browser .bar{display:flex;gap:6px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line);font-size:.8rem;color:var(--muted)}
.browser .dot{width:10px;height:10px;border-radius:50%;background:var(--line)}
.browser .url{margin-left:10px;background:var(--bg);padding:3px 10px;border-radius:6px;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.browser iframe{display:block;width:100%;height:420px;border:0;background:#fff}
.browser .body{padding:28px;background:linear-gradient(160deg,#0f3b4a,#16606e);color:#f2fbfa;min-height:220px}
.browser .body h3{color:#fff;font-size:1.5rem}
.browser .body p{color:#cfe8e6;font-size:.95rem}
.fake-btn{display:inline-block;background:#f4c542;color:#1b2a24;padding:8px 14px;border-radius:8px;font-weight:600;font-size:.9rem}
.checks{list-style:none;padding:0;margin:20px 0}
.checks li{padding-left:28px;position:relative;margin-bottom:10px}
.checks li::before{content:"✓";position:absolute;left:0;color:var(--good);font-weight:700}
.quiz{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:28px;margin-top:32px}
.q{display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--line);cursor:pointer;font-weight:400}
.q:last-of-type{border-bottom:0}
.q input{width:20px;height:20px;margin-top:3px;accent-color:var(--accent);flex-shrink:0}
.q small{display:block;color:var(--muted);font-size:.88rem}
.meter{height:10px;background:var(--line);border-radius:99px;overflow:hidden;margin:20px 0 10px}
.meter i{display:block;height:100%;width:0;background:var(--warn);transition:width .3s,background .3s}
.verdict{font-weight:600;min-height:1.6em}
.steps{counter-reset:s}
.steps .card{position:relative;padding-top:56px}
.steps .card::before{counter-increment:s;content:counter(s);position:absolute;top:20px;left:24px;width:28px;height:28px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-weight:700;display:grid;place-items:center;font-size:.9rem}
details{border-bottom:1px solid var(--line);padding:16px 0}
summary{font-weight:600;cursor:pointer}
details p{color:var(--muted);margin:10px 0 0}
.prose{max-width:42em}
.prose h2{font-size:1.5rem;margin-top:1.6em}
form.quote{display:grid;gap:14px;margin-top:28px;max-width:620px}
label{font-weight:500;font-size:.95rem;display:grid;gap:6px}
input[type=text],input[type=email],select,textarea{font:inherit;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);width:100%}
textarea{min-height:110px;resize:vertical}
.row{display:grid;gap:14px;grid-template-columns:1fr 1fr}
@media (max-width:560px){.row{grid-template-columns:1fr}}
.form-note{color:var(--muted);font-size:.9rem}
footer{border-top:1px solid var(--line);padding:40px 0;color:var(--muted);font-size:.9rem}
footer .cols{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
footer h4{color:var(--ink);margin:0 0 8px;font-size:.95rem}
footer ul{list-style:none;padding:0;margin:0}
footer li{margin-bottom:4px}
footer a{color:var(--muted);text-decoration:none}
footer a:hover{color:var(--ink)}
`.trim();

const NAV = [['/work/', 'Work'], ['/websites-for/', 'Industries'], ['/pricing/', 'Pricing'], ['/website-check/', 'Free check']];

export function renderPage(page) {
  const canonical = SITE.url + page.path;
  const schema = [orgSchema(), ...(page.schema || [])];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta name="theme-color" content="#faf7f0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${CSS}</style>
${page.noindex ? '' : `<script type="application/ld+json">${JSON.stringify(schema.length === 1 ? schema[0] : schema)}</script>`}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>
  <div class="wrap">
    <a class="logo" href="/">${SITE.icon} ${esc(SITE.name)}</a>
    <nav aria-label="Main">
      ${NAV.map(([href, label]) => `<a href="${href}"${page.path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <a class="btn" href="/contact/">Get a quote</a>
    </nav>
  </div>
</header>
<main id="main">
${page.main}
</main>
<footer>
  <div class="wrap cols">
    <div>
      <h4>${SITE.icon} ${esc(SITE.name)}</h4>
      <p>Websites for small local businesses in and around ${esc(SITE.city)}, Texas.</p>
    </div>
    <div>
      <h4>Industries</h4>
      <ul>${INDUSTRIES.slice(0, 6).map((i) => `<li><a href="/websites-for/${i.slug}/">${esc(i.short)}</a></li>`).join('')}<li><a href="/websites-for/">All industries</a></li></ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul><li><a href="/work/">Our work</a></li><li><a href="/pricing/">Pricing</a></li><li><a href="/website-check/">Free website check</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy</a></li></ul>
    </div>
  </div>
  <div class="wrap" style="margin-top:24px">© <span data-year>${new Date().getFullYear()}</span> ${esc(SITE.name)} · ${esc(SITE.city)}, Texas</div>
</footer>
<script src="/main.js" defer></script>
</body>
</html>
`;
}

function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.summary,
    areaServed: SITE.serviceArea.map((name) => ({ '@type': 'City', name: `${name}, TX` })),
    ...(SITE.email ? { email: SITE.email } : {}),
    makesOffer: PLANS.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price,
      priceCurrency: 'USD',
      ...(p.per ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'USD', unitText: p.per.toUpperCase() } } : {}),
    })),
  };
}

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + path })),
});

export const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([name, path], i) =>
    i === items.length - 1 ? esc(name) : `<a href="${path}">${esc(name)}</a> › `).join('')}</nav>`;

export const pricingCards = () => `<div class="grid">
${PLANS.map((p) => `  <div class="card price${p.featured ? ' featured' : ''}">
    ${p.featured ? '<span class="tag">Most popular</span>' : ''}
    <h3>${esc(p.name)}</h3>
    <div class="amt">${money(p.price)}${p.per ? `<small> /${p.per}</small>` : ''}</div>
    <p>${esc(p.for)}</p>
    <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    <a class="btn${p.featured ? '' : ' ghost'}" href="/contact/?plan=${p.id}">Choose ${esc(p.name)}</a>
  </div>`).join('\n')}
</div>`;

export const faqList = (faqs) => faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');

export const CHECK_ITEMS = [
  ['It looks right on a phone without pinching or zooming', 'Most local searches happen on phones.'],
  ['A customer can call or request a quote in one tap', 'If it takes hunting, they’ll call the next result.'],
  ['It loads in about 3 seconds or less on cell data', 'Slow pages lose visitors before they ever see you.'],
  ['It clearly says what you do and which towns you serve', 'Google and customers both need this spelled out.'],
  ['It shows up when you Google your business name', 'If you can’t find yourself, neither can customers.'],
  ['It has real photos of your work', 'Photos build trust faster than any sentence.'],
  ['Prices, hours, and phone number are up to date', 'Wrong info means lost calls and frustrated customers.'],
  ['The address bar shows a lock (https)', 'Browsers warn people away from sites without it.'],
];

export const websiteCheck = () => `<div class="quiz" data-quiz>
${CHECK_ITEMS.map(([t, s]) => `  <label class="q"><input type="checkbox"><span>${esc(t)}<small>${esc(s)}</small></span></label>`).join('\n')}
  <div class="meter"><i></i></div>
  <div class="verdict" aria-live="polite">Tick the boxes that are true to see your score.</div>
</div>`;

export const quoteForm = ({ industry = '' } = {}) => `<form class="quote" data-email="${esc(SITE.email)}">
  <div class="row">
    <label>Your name<input type="text" name="name" required autocomplete="name"></label>
    <label>Business name<input type="text" name="business" required autocomplete="organization"></label>
  </div>
  <div class="row">
    <label>Email<input type="email" name="email" required autocomplete="email"></label>
    <label>Current website (if any)<input type="text" name="website" placeholder="none yet"></label>
  </div>
  <label>What are you interested in?
    <select name="plan">
      <option value="">Not sure yet</option>
      ${PLANS.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}
    </select>
  </label>
  <label>What does your business do, and where?<textarea name="details" required>${industry ? esc(`We're a ${industry} business in `) : ''}</textarea></label>
  <div><button class="btn" type="submit">Send</button></div>
  <p class="form-note" aria-live="polite"></p>
</form>`;

export const contactBand = (heading = 'Tell us about your business', opts) => `<section id="contact">
  <div class="wrap">
    <div class="eyebrow">Get a quote</div>
    <h2>${esc(heading)}</h2>
    <p class="lede">We’ll reply within a day with a flat price and a couple of ideas for your site.</p>
    ${quoteForm(opts)}
  </div>
</section>`;
