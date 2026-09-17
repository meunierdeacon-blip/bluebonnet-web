import { SITE, WORK } from '../site.mjs';
import { INDUSTRIES } from '../industries.mjs';
import { esc, pricingCards, faqList, faqSchema, contactBand } from '../layout.mjs';

export const HOME_FAQ = [
  ['How do payments work?', 'Half up front to start, half when the site is live and you’re happy with it. Care Plans are billed monthly and you can cancel anytime.'],
  ['Do I need to already have a domain name?', 'No. We’ll help you pick and register one. It usually costs around $10–20 a year, paid directly by you so you always own it.'],
  ['What if I don’t have photos or a logo?', 'That’s fine. We can start with a clean text logo, and phone photos of your work are usually better than stock photos anyway.'],
  ['Do I own the website?', 'Yes. The domain is in your name, and if you ever leave we hand over all the files.'],
  ['Can you guarantee I’ll be #1 on Google?', 'Nobody honestly can. What we can do is set your site up the right way so Google understands what you do and where, which is what most local businesses are missing.'],
];

const w = WORK[0];

export default {
  path: '/',
  priority: '1.0',
  title: `Websites for Austin Small Businesses | ${SITE.name}`,
  description: 'Fast, phone-friendly, Google-ready websites for Austin-area local service businesses. Flat pricing, live in about a week, optional monthly care.',
  schema: [faqSchema(HOME_FAQ)],
  main: `<section class="hero">
  <div class="wrap">
    <div class="eyebrow">Websites for Austin-area small businesses</div>
    <h1>Your customers are searching Google.<br>Let’s make sure they find you.</h1>
    <p class="lede">We build fast, good-looking websites for local service businesses: landscapers, cleaners, lake and pool services, tutors, food trucks. You get a site that works on phones and is set up for Google, usually live within about a week, at a flat price.</p>
    <div class="actions">
      <a class="btn" href="/contact/">Get a free quote</a>
      <a class="btn ghost" href="/website-check/">Check your current site</a>
    </div>
    <div class="proof">
      <span><b>Flat pricing</b>, no surprise bills</span>
      <span><b>Phone-first</b> design</span>
      <span><b>Google-ready</b> from day one</span>
    </div>
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <div class="eyebrow">Recent work</div>
      <h2>${esc(w.name)}</h2>
      <p class="lede">${esc(w.blurb)}</p>
      <ul class="checks">${w.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <div class="actions" style="margin-top:0">
        <a class="btn ghost" href="/work/">About this project</a>
        <a class="btn ghost" href="${w.url}" target="_blank" rel="noopener">See the live site ↗</a>
      </div>
    </div>
    <div class="browser" aria-hidden="true">
      <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="url">${esc(w.url.replace('https://', ''))}</span></div>
      <div class="body">
        <h3>Clear water. Clean docks.</h3>
        <p>Hand-pulled, chemical-free hydrilla removal on Lake Travis, Lake Austin, and Lake LBJ.</p>
        <span class="fake-btn">Get a quote</span>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow">Who we build for</div>
    <h2>Built for the way your customers search</h2>
    <p class="lede">Every trade gets found a little differently. Pick yours to see what we’d build and a sample site.</p>
    <div class="grid small">
      ${INDUSTRIES.map((i) => `<a class="card mini" href="/websites-for/${i.slug}/">${esc(i.short)} →</a>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow">Pricing</div>
    <h2>Simple, flat prices</h2>
    <p class="lede">No hourly billing. You’ll know the full price before we start, and you pay the rest only when you’re happy with the site.</p>
    ${pricingCards()}
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <div class="eyebrow">Free 60-second check</div>
      <h2>Is your website costing you customers?</h2>
      <p class="lede">Eight quick yes-or-no questions. Pull up your site on your phone and see how it scores. No email needed.</p>
      <a class="btn" href="/website-check/">Take the free check</a>
    </div>
    <div class="card">
      <ul class="checks" style="margin:0">
        <li>Works on phones without zooming</li>
        <li>One tap to call or request a quote</li>
        <li>Loads fast on cell data</li>
        <li>Says what you do and where</li>
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow">How it works</div>
    <h2>Live in about a week</h2>
    <div class="grid steps">
      <div class="card"><h3>Quick call</h3><p>15 minutes. You tell us what you do, where you work, and what customers ask about most.</p></div>
      <div class="card"><h3>We build it</h3><p>You send photos and your logo if you have one. We write the first draft of the words for you.</p></div>
      <div class="card"><h3>You review</h3><p>We send you a private link. Ask for changes until it feels right.</p></div>
      <div class="card"><h3>Go live</h3><p>We connect your domain and set up Google. You pay the balance once it’s live.</p></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow">Questions</div>
    <h2>Common questions</h2>
    ${faqList(HOME_FAQ)}
  </div>
</section>

${contactBand()}`,
};
