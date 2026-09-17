// Renders a one-page small-business website from a lead object. Used by mockup.mjs and by build.mjs
// (for the sample sites linked from each industry page).
//
// Mockup mode (default): demo banner across the top, noindex, photo placeholders.
// Final mode ({ final: true }): no banner, indexable, meta description, LocalBusiness schema built only from
// fields you filled in, real photos (or no photo section), and a quote form if `formAction` is set.
import { PRESETS, DEFAULT_PRESET, THEMES } from './presets.mjs';

export const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderMockup(lead, { banner = `Free demo for ${lead.name}. Not live yet.`, final = false } = {}) {
  const tradeKey = lead.trade.toLowerCase();
  const preset = PRESETS[tradeKey] || DEFAULT_PRESET;
  if (!PRESETS[tradeKey]) console.warn(`! No preset for "${lead.trade}". Using generic copy; edit services in a JSON file.`);
  const theme = THEMES[lead.theme || preset.theme] || THEMES.slate;
  if (lead.theme && !THEMES[lead.theme]) console.warn(`! Unknown theme "${lead.theme}", using ${preset.theme}.`);

  const fill = (s) => s.replaceAll('{town}', lead.town);
  const services = (lead.services || preset.services).map((s) => (Array.isArray(s) ? { name: s[0], blurb: s[1] } : s));
  const areas = lead.areas?.length ? lead.areas : [lead.town];
  const headline = lead.headline || preset.headline;
  const intro = fill(lead.intro || preset.intro);
  const cta = lead.cta || preset.cta;
  const icon = lead.icon || preset.icon;
  const tel = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : '';
  const callLabel = lead.texts === false ? 'Call' : 'Call or text';
  const photos = (lead.photos || []).map((p) => (typeof p === 'string' ? { src: p } : p))
    .map((p) => ({ ...p, alt: p.alt || `${lead.trade} job by ${lead.name}` }));
  const tradeTitle = lead.trade.replace(/\b\w/g, (c) => c.toUpperCase());
  const description = lead.description || `${intro} ${services.slice(0, 3).map((s) => s.name).join(', ')}.`.slice(0, 160);
  const heroText = theme.lightHero ? theme.ink : '#ffffff';
  const heroMuted = theme.lightHero ? '#4a5568' : 'rgba(255,255,255,.82)';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: lead.name,
    description,
    ...(lead.url ? { url: lead.url } : {}),
    ...(lead.phone ? { telephone: lead.phone } : {}),
    ...(lead.email ? { email: lead.email } : {}),
    areaServed: areas.map((a) => ({ '@type': 'City', name: `${a}, TX` })),
    makesOffer: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.blurb } })),
  };

  const photoSection = photos.length
    ? `<section>
  <div class="wrap">
    <div class="kicker">Our work</div>
    <h2>Recent jobs</h2>
    <div class="photos">${photos.map((p) => `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy">`).join('')}</div>
  </div>
</section>`
    : final ? '' : `<section>
  <div class="wrap">
    <div class="kicker">Our work</div>
    <h2>Recent jobs</h2>
    <div class="photos"><div>Your photo here</div><div>Your photo here</div><div>Your photo here</div></div>
  </div>
</section>`;

  const form = lead.formAction ? `<form class="form" action="${esc(lead.formAction)}" method="POST">
      <div class="row">
        <label>Name<input name="name" required autocomplete="name"></label>
        <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
      </div>
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Address or neighborhood<input name="location" autocomplete="street-address"></label>
      <label>What do you need?<textarea name="message" required></textarea></label>
      <button class="btn" type="submit">Send request</button>
    </form>` : '';

  const contactButton = tel ? `<a class="btn" href="tel:${tel}">${callLabel} ${esc(lead.phone)}</a>`
    : lead.email ? `<a class="btn" href="mailto:${esc(lead.email)}">Email us</a>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${final ? `<meta name="description" content="${esc(description)}">${lead.url ? `\n<link rel="canonical" href="${esc(lead.url)}">` : ''}` : '<meta name="robots" content="noindex">'}
<title>${esc(lead.name)} | ${esc(tradeTitle)} in ${esc(lead.town)}, TX</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>">
${final ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}
<style>
  :root { --ink:${theme.ink}; --accent:${theme.accent}; --accent-ink:${theme.accentInk}; --bg:${theme.bg}; --soft:${theme.soft}; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 400 17px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif; color: var(--ink); background: var(--bg); }
  h1, h2, h3 { line-height: 1.15; margin: 0 0 .5em; letter-spacing: -.02em; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 0 16px; }
  .demo { background: #111; color: #fff; text-align: center; font-size: 13px; padding: 6px 16px; }
  header { background: var(--bg); border-bottom: 1px solid rgba(0,0,0,.08); }
  header .wrap { display: flex; justify-content: space-between; align-items: center; min-height: 64px; gap: 12px; }
  .logo { font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 8px; }
  .btn { display: inline-block; background: var(--accent); color: var(--accent-ink); font-weight: 700; padding: 13px 22px; border-radius: 10px; text-decoration: none; border: 0; font-size: 1rem; font-family: inherit; cursor: pointer; }
  .btn.sm { padding: 9px 14px; font-size: .92rem; white-space: nowrap; }
  .btn.line { background: transparent; color: ${heroText}; border: 2px solid ${theme.lightHero ? 'var(--ink)' : 'rgba(255,255,255,.7)'}; }
  .hero { background: linear-gradient(150deg, ${theme.hero1}, ${theme.hero2}); color: ${heroText}; padding: 80px 0 88px; }
  .hero h1 { font-size: clamp(2.1rem, 6vw, 3.5rem); max-width: 14em; }
  .hero p { font-size: 1.2rem; color: ${heroMuted}; max-width: 34em; margin: 0 0 28px; }
  .hero .actions { display: flex; gap: 12px; flex-wrap: wrap; }
  section { padding: 64px 0; }
  .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); margin-top: 28px; }
  .card { background: #fff; border-radius: 14px; padding: 22px; box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 24px -16px rgba(0,0,0,.2); }
  .card p { margin: 0; color: #5b6470; }
  .kicker { color: var(--accent); font-weight: 700; font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; }
  .band { background: var(--soft); }
  .about { max-width: 42em; font-size: 1.1rem; }
  .areas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; padding: 0; list-style: none; }
  .areas li { background: #fff; border-radius: 99px; padding: 6px 14px; font-weight: 600; font-size: .95rem; }
  .photos { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 24px; }
  .photos div, .photos img { aspect-ratio: 4/3; border-radius: 12px; width: 100%; }
  .photos img { object-fit: cover; display: block; }
  .photos div { border: 2px dashed rgba(0,0,0,.18); display: grid; place-items: center; color: #8a929c; font-size: .9rem; text-align: center; padding: 8px; background: #fff; }
  @media (max-width: 640px) { .photos { grid-template-columns: 1fr 1fr; } .photos div:nth-child(3) { display: none; } }
  .contact { text-align: center; }
  .contact p { color: #5b6470; }
  .form { display: grid; gap: 12px; max-width: 560px; margin: 24px auto 0; text-align: left; }
  .form label { display: grid; gap: 4px; font-weight: 600; font-size: .95rem; }
  .form input, .form textarea { font: inherit; padding: 11px 13px; border-radius: 10px; border: 1px solid rgba(0,0,0,.18); background: #fff; width: 100%; }
  .form textarea { min-height: 100px; }
  .row { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { .row { grid-template-columns: 1fr; } }
  footer { padding: 28px 0; font-size: .9rem; color: #6b7280; border-top: 1px solid rgba(0,0,0,.08); }
  .callbar { display: none; }
  @media (max-width: 640px) {
    .callbar { display: block; position: fixed; left: 12px; right: 12px; bottom: 12px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
    footer { padding-bottom: 90px; }
    header .btn { display: none; }
  }
</style>
</head>
<body>
${final ? '' : `<div class="demo">${esc(banner)}</div>\n`}<header>
  <div class="wrap">
    <div class="logo"><span>${icon}</span>${esc(lead.name)}</div>
    ${tel ? `<a class="btn sm" href="tel:${tel}">Call ${esc(lead.phone)}</a>` : `<a class="btn sm" href="#contact">${esc(cta)}</a>`}
  </div>
</header>
<main>
<section class="hero">
  <div class="wrap">
    <h1>${esc(headline)}</h1>
    <p>${esc(intro)}</p>
    <div class="actions">
      <a class="btn" href="#contact">${esc(cta)}</a>
      ${tel ? `<a class="btn line" href="tel:${tel}">${callLabel}</a>` : ''}
    </div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="kicker">What we do</div>
    <h2>Services</h2>
    <div class="grid">
      ${services.map((s) => `<div class="card"><h3>${esc(s.name)}</h3><p>${esc(s.blurb)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
${lead.about ? `<section class="band">
  <div class="wrap">
    <div class="kicker">About</div>
    <h2>About ${esc(lead.name)}</h2>
    <p class="about">${esc(lead.about)}</p>
  </div>
</section>` : ''}
<section${lead.about ? '' : ' class="band"'}>
  <div class="wrap">
    <div class="kicker">Service area</div>
    <h2>Proudly serving ${esc(lead.town)} and nearby</h2>
    <ul class="areas">${areas.map((a) => `<li>📍 ${esc(a)}</li>`).join('')}</ul>
  </div>
</section>
${photoSection}
<section class="band contact" id="contact">
  <div class="wrap">
    <h2>${esc(cta)}</h2>
    <p>Tell us what you need and we’ll get back to you.</p>
    ${contactButton}
    ${lead.email && tel ? `<p style="margin-top:16px"><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></p>` : ''}
    ${form}
  </div>
</section>
</main>
<footer><div class="wrap">© ${new Date().getFullYear()} ${esc(lead.name)} · ${esc(lead.town)}, Texas</div></footer>
${tel ? `<a class="btn callbar" href="tel:${tel}">📞 Call ${esc(lead.phone)}</a>` : ''}
</body>
</html>
`;
}
