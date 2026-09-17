// Single source of truth for the business. Change things here, run `node build.mjs`, and every page updates.
export const SITE = {
  // The live address (no trailing slash). Used for canonical links and the sitemap. If it has a path, like GitHub Pages'
  // /bluebonnet-web, build.mjs prefixes every internal link with it. Change this if you move to your own domain.
  url: 'https://meunierdeacon-blip.github.io/bluebonnet-web',
  name: 'Bluebonnet Web',
  icon: '🌼',
  city: 'Austin',
  region: 'TX',
  // The inbox quote requests go to (shown publicly on the site). Not a school account.
  email: 'meunierdeacon@gmail.com',
  summary:
    'Bluebonnet Web builds fast, phone-friendly, Google-ready websites for small local service businesses in the Austin, Texas area, at flat prices with an optional monthly care plan.',
  serviceArea: ['Austin', 'Lakeway', 'Bee Cave', 'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'Dripping Springs', 'Marble Falls'],
};

// Prices are your call. Change them here and they update everywhere (home, pricing, industry pages, schema).
export const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 400,
    for: 'For businesses with no website, or one that’s embarrassing.',
    features: ['One polished page: services, area, photos, contact', 'Works great on phones', 'Contact form or tap-to-call button', 'Basic Google setup'],
  },
  {
    id: 'local-seo', name: 'Local SEO Site', price: 900, featured: true,
    for: 'For businesses that want to show up when people search.',
    features: ['Up to 6 pages (a page per service or area)', 'Quote form with photo upload', 'Search titles, descriptions, and sitemap', 'Google Search Console setup', 'Custom domain connected'],
  },
  {
    id: 'care', name: 'Care Plan', price: 35, per: 'month',
    for: 'Add to any site so you never have to think about it.',
    features: ['Hosting handled for you', 'Text or photo changes, done within 2 business days', 'New prices or hours anytime', 'Cancel whenever'],
  },
];

export const WORK = [
  {
    name: 'Waterline Weed Co.',
    url: 'https://waterlineweeds.co',
    what: 'Hand-pulled lake weed removal on the Highland Lakes',
    blurb: 'A lake-weed removal crew needed people on Lake Travis and Lake Austin to find them. We built the whole site from scratch.',
    did: [
      'A multi-page site with a page for each lake and service, so each one can show up in search',
      'Custom domain, HTTPS, and verified in Google Search Console with a submitted sitemap',
      'Search-friendly titles, descriptions, and structured data on every page',
      'Built to load fast on a phone at the dock, not just on a laptop',
    ],
  },
];
