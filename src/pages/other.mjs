import { SITE, WORK, PLANS } from '../site.mjs';
import { esc, money, crumbs, breadcrumbSchema, faqSchema, faqList, pricingCards, websiteCheck, contactBand, quoteForm } from '../layout.mjs';
import { HOME_FAQ } from './home.mjs';

const starter = PLANS.find((p) => p.id === 'starter');

const PRICING_FAQ = [
  ['Are there any other costs?', 'Your domain name, usually around $10–20 a year, which you pay directly so you own it. If you skip the Care Plan, you’ll also need your own hosting, though many small sites can be hosted free.'],
  ['What counts as a “change” on the Care Plan?', 'Updating text, photos, prices, hours, or adding a small section. Bigger additions, like a whole new set of pages, get a separate flat quote first.'],
  ['Can I upgrade from Starter later?', 'Yes. You only pay the difference between the two plans.'],
  ...HOME_FAQ.filter(([q]) => q.startsWith('How do payments')),
];

const pricing = {
  path: '/pricing/',
  priority: '0.9',
  title: `Website Pricing for Small Businesses | ${SITE.name}`,
  description: `Flat website pricing for Austin small businesses: ${starter.name} ${money(starter.price)}, Local SEO Site, and an optional monthly Care Plan. No hourly billing.`,
  schema: [breadcrumbSchema([['Home', '/'], ['Pricing', '/pricing/']]), faqSchema(PRICING_FAQ)],
  main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs([['Home', '/'], ['Pricing', '/pricing/']])}
    <h1>Simple, flat pricing</h1>
    <p class="lede">No hourly billing and no surprises. You’ll know the full price before we start. Half up front, half when the site is live and you’re happy with it.</p>
  </div>
</section>
<section class="tight">
  <div class="wrap">${pricingCards()}</div>
</section>
<section>
  <div class="wrap">
    <div class="eyebrow">Questions</div>
    <h2>Pricing questions</h2>
    ${faqList(PRICING_FAQ)}
  </div>
</section>
${contactBand()}`,
};

const check = {
  path: '/website-check/',
  priority: '0.8',
  title: `Free Small Business Website Check | ${SITE.name}`,
  description: 'Eight quick questions to see if your small business website is losing customers. Takes 60 seconds, works on your phone, no email required.',
  schema: [breadcrumbSchema([['Home', '/'], ['Free website check', '/website-check/']])],
  main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs([['Home', '/'], ['Free website check', '/website-check/']])}
    <h1>Is your website costing you customers?</h1>
    <p class="lede">Pull up your business’s website on your phone, then tick everything that’s true. Takes about a minute. No email needed.</p>
    ${websiteCheck()}
  </div>
</section>
<section>
  <div class="wrap prose">
    <h2>Why these eight things matter</h2>
    <p>Most people looking for a local service are on their phone and ready to call someone soon. They’ll give a website a few seconds. If it’s slow, hard to read, or they can’t tell whether you serve their area, they hit back and try the next business.</p>
    <p>None of these fixes are complicated, but together they’re the difference between a website that brings in calls and one that just exists. If you scored low, that’s good news in a way: there’s room to win customers you’re currently missing.</p>
    <p><a class="btn" href="/contact/">Get a free quote to fix it</a></p>
  </div>
</section>`,
};

const w = WORK[0];
const work = {
  path: '/work/',
  priority: '0.8',
  title: `Our Work: Small Business Websites | ${SITE.name}`,
  description: `See websites we’ve built for local businesses, including ${w.name}: a multi-page, search-ready site for a lake weed removal company.`,
  schema: [breadcrumbSchema([['Home', '/'], ['Work', '/work/']])],
  main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs([['Home', '/'], ['Work', '/work/']])}
    <h1>Our work</h1>
    <p class="lede">Real sites for real local businesses.</p>
  </div>
</section>
${WORK.map((p) => `<section>
  <div class="wrap split">
    <div>
      <div class="eyebrow">${esc(p.what)}</div>
      <h2>${esc(p.name)}</h2>
      <p class="lede">${esc(p.blurb)}</p>
      <ul class="checks">${p.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <a class="btn ghost" href="${p.url}" target="_blank" rel="noopener">Visit ${esc(p.url.replace('https://', ''))} ↗</a>
    </div>
    <div class="browser" aria-hidden="true">
      <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="url">${esc(p.url.replace('https://', ''))}</span></div>
      <div class="body">
        <h3>Clear water. Clean docks.</h3>
        <p>Hand-pulled, chemical-free hydrilla removal on Lake Travis, Lake Austin, and Lake LBJ.</p>
        <span class="fake-btn">Get a quote</span>
      </div>
    </div>
  </div>
</section>`).join('\n')}
<section>
  <div class="wrap">
    <div class="eyebrow">Sample sites</div>
    <h2>See what yours could look like</h2>
    <p class="lede">We’ve put together sample sites for common trades. Pick yours from the <a href="/websites-for/">industries page</a>.</p>
  </div>
</section>
${contactBand('Want to be next?')}`,
};

const contact = {
  path: '/contact/',
  priority: '0.9',
  title: `Get a Free Website Quote | ${SITE.name}`,
  description: 'Tell us about your business and get a flat-price quote for a new website. Serving small businesses in Austin, Lakeway, Round Rock, Cedar Park, and nearby.',
  schema: [breadcrumbSchema([['Home', '/'], ['Contact', '/contact/']])],
  main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs([['Home', '/'], ['Contact', '/contact/']])}
    <h1>Get a free quote</h1>
    <p class="lede">Tell us what your business does and where. We’ll reply within a day with a flat price and a couple of ideas for your site.</p>
    ${quoteForm()}
    ${SITE.email ? `<p style="margin-top:24px">Prefer email? <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></p>` : ''}
  </div>
</section>
<section>
  <div class="wrap">
    <div class="eyebrow">Service area</div>
    <h2>Where we work</h2>
    <p class="lede">We’re based in ${esc(SITE.city)} and build for businesses across the area, including ${esc(SITE.serviceArea.slice(0, -1).join(', '))}, and ${esc(SITE.serviceArea.at(-1))}. Most of the work happens remotely, so we can help businesses farther out too.</p>
  </div>
</section>`,
};

const privacy = {
  path: '/privacy/',
  priority: '0.2',
  title: `Privacy | ${SITE.name}`,
  description: `How ${SITE.name} handles your information: no tracking cookies, no analytics, and quote requests go straight from your email app to ours.`,
  main: `<section class="hero sub">
  <div class="wrap prose">
    ${crumbs([['Home', '/'], ['Privacy', '/privacy/']])}
    <h1>Privacy</h1>
    <p>This site doesn’t use tracking cookies, ads, or analytics.</p>
    <h2>Quote requests</h2>
    <p>When you fill out the quote form, nothing is sent from this website. It opens your own email app with a message ready to go, and you choose whether to send it. If you do, we only use what you send to reply to you about your website.</p>
    <h2>Fonts</h2>
    <p>Pages load fonts from Google Fonts, which means your browser connects to Google’s servers to download them.</p>
    <h2>Questions</h2>
    <p>Ask us anything about this through the <a href="/contact/">contact page</a>.</p>
  </div>
</section>`,
};

const notFound = {
  path: '/404/',
  file: '404.html',
  noindex: true,
  title: `Page not found | ${SITE.name}`,
  description: 'This page doesn’t exist.',
  main: `<section class="hero">
  <div class="wrap">
    <h1>That page doesn’t exist</h1>
    <p class="lede">It may have moved. Try the home page or get in touch.</p>
    <div class="actions"><a class="btn" href="/">Home</a><a class="btn ghost" href="/contact/">Contact</a></div>
  </div>
</section>`,
};

export default [pricing, check, work, contact, privacy, notFound];
