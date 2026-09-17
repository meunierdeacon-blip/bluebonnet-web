import { SITE } from '../site.mjs';
import { INDUSTRIES } from '../industries.mjs';
import { esc, crumbs, breadcrumbSchema, faqSchema, faqList, pricingCards, contactBand } from '../layout.mjs';

const hub = {
  path: '/websites-for/',
  priority: '0.8',
  title: `Websites for Local Service Businesses | ${SITE.name}`,
  description: 'Websites built for how customers find lawn care, cleaning, pool, detailing, food truck, tutoring, lake service, and handyman businesses around Austin.',
  schema: [breadcrumbSchema([['Home', '/'], ['Industries', '/websites-for/']])],
  main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs([['Home', '/'], ['Industries', '/websites-for/']])}
    <h1>Websites for local service businesses</h1>
    <p class="lede">People search for a lawn service differently than they search for a tutor. We build around how your customers actually look for you. Pick your trade to see what we’d build and a sample site.</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="grid">
      ${INDUSTRIES.map((i) => `<a class="card" href="/websites-for/${i.slug}/"><h3>${esc(i.short)}</h3><p>${esc(i.why.split('. ')[0])}.</p></a>`).join('\n      ')}
    </div>
    <p style="margin-top:32px">Don’t see your trade? We build for most local service businesses. <a href="/contact/">Tell us what you do</a>.</p>
  </div>
</section>
${contactBand()}`,
};

const pages = INDUSTRIES.map((i) => {
  const trail = [['Home', '/'], ['Industries', '/websites-for/'], [i.short, `/websites-for/${i.slug}/`]];
  const cap = i.plural.replace(/\b(?!and\b)\w/g, (c) => c.toUpperCase());
  return {
    path: `/websites-for/${i.slug}/`,
    priority: '0.7',
    title: `Websites for ${cap} in Austin | ${SITE.name}`,
    description: `Phone-friendly, Google-ready websites for ${i.plural} in the Austin area. Flat pricing from $400, live in about a week. See a sample site.`,
    schema: [breadcrumbSchema(trail), faqSchema(i.faq)],
    main: `<section class="hero sub">
  <div class="wrap">
    ${crumbs(trail)}
    <div class="eyebrow">${esc(i.short)}</div>
    <h1>Websites for ${esc(i.plural)}</h1>
    <p class="lede">${esc(i.why)}</p>
    <div class="actions">
      <a class="btn" href="#contact">Get a free quote</a>
      <a class="btn ghost" href="/samples/${i.slug}/" target="_blank" rel="noopener">Open the sample site ↗</a>
    </div>
  </div>
</section>
<section>
  <div class="wrap split">
    <div>
      <div class="eyebrow">What we’d build</div>
      <h2>A site that fits how ${esc(i.plural)} get hired</h2>
      <ul class="checks">${i.build.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p class="form-note">Every site also includes phone-first design, fast loading, and basic Google setup.</p>
    </div>
    <div class="browser">
      <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="url">Sample: ${esc(i.sampleName)}</span></div>
      <iframe src="/samples/${i.slug}/" title="Sample website for ${esc(i.plural)}" loading="lazy"></iframe>
    </div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="eyebrow">Pricing</div>
    <h2>Flat prices for ${esc(i.plural)}</h2>
    ${pricingCards()}
  </div>
</section>
<section>
  <div class="wrap">
    <div class="eyebrow">Questions</div>
    <h2>Questions from ${esc(i.plural)}</h2>
    ${faqList(i.faq)}
  </div>
</section>
${contactBand(`Get a website for your ${i.trade} business`, { industry: i.trade })}`,
  };
});

export default [hub, ...pages];
