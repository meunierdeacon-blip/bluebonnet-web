// One landing page per industry at /websites-for/<slug>/. `trade` must match a key in mockup/presets.mjs,
// which also powers the sample site linked from each page (/samples/<slug>/).
// Keep claims general and true: no statistics, rankings, or results we can't back up.
export const INDUSTRIES = [
  {
    slug: 'lawn-care', trade: 'lawn care', plural: 'lawn care companies', short: 'Lawn Care',
    sampleName: 'Sample Lawn Co.', sampleTown: 'Lakeway',
    why: 'Homeowners usually look for a lawn service when the grass is already too tall or they just moved in. They search, open two or three results, and call whoever looks reliable and clearly serves their neighborhood. If you only have a Facebook page, you’re often not one of those results.',
    build: ['A home page that says exactly which neighborhoods you mow', 'Separate pages for mowing, trimming, and seasonal cleanups', 'A tap-to-call button and a quote form that asks for the address', 'Space for before-and-after photos of real yards'],
    faq: [
      ['I get most of my work from referrals. Why do I need a site?', 'Referrals still look you up before they call. A clean site makes the referral stick instead of sending them to whoever shows up first on Google.'],
      ['Can I show different prices for different yard sizes?', 'Yes, or we can leave prices off and use a quote form. Whatever matches how you actually quote jobs.'],
    ],
  },
  {
    slug: 'landscaping', trade: 'landscaping', plural: 'landscapers', short: 'Landscaping',
    sampleName: 'Sample Landscapes', sampleTown: 'Dripping Springs',
    why: 'Landscaping jobs are bigger decisions, so people compare. They want to see finished projects, understand what you do, and feel confident before they ask for an estimate. A site with a real project gallery does a lot of that selling for you.',
    build: ['A project gallery organized by type (installs, hardscape, maintenance)', 'Service pages that explain your process', 'An estimate form that collects the project type and rough budget', 'Pages for the towns you work in most'],
    faq: [
      ['I don’t have great photos. Is that a problem?', 'Phone photos of finished jobs work well. We’ll show you how to take them so they look good on the site.'],
      ['Can people upload photos of their yard?', 'Yes. The Local SEO Site plan includes a quote form with photo upload.'],
    ],
  },
  {
    slug: 'house-cleaning', trade: 'house cleaning', plural: 'house cleaners', short: 'House Cleaning',
    sampleName: 'Sample Cleaning Co.', sampleTown: 'Round Rock',
    why: 'Letting someone into your home takes trust. People looking for a cleaner want to know what’s included, how booking works, and who’s coming. A clear, friendly site answers those questions before they have to call.',
    build: ['A clear list of what’s included in standard, deep, and move-out cleans', 'A booking or quote request form', 'An About section that introduces you or your team', 'A service area section for the neighborhoods you cover'],
    faq: [
      ['Can customers book online?', 'We can add a simple request form, or link to a booking tool you already use.'],
      ['I’m a solo cleaner. Is a website overkill?', 'No. The Starter plan is built for exactly that: one page that makes you look established and easy to contact.'],
    ],
  },
  {
    slug: 'pool-service', trade: 'pool service', plural: 'pool service companies', short: 'Pool Service',
    sampleName: 'Sample Pool Care', sampleTown: 'Cedar Park',
    why: 'Pool service is recurring work, so each new customer can be worth a lot over a season. People searching for pool help often have a green pool and want someone soon. A fast, phone-friendly site with an obvious call button catches them.',
    build: ['Pages for weekly service, green-to-clean, and equipment help', 'A prominent tap-to-call button on phones', 'A quote form that asks pool size and current condition', 'A service area section by neighborhood'],
    faq: [
      ['Most of my customers are recurring. Do I still need a site?', 'Every customer that leaves or moves needs replacing. A site keeps new ones coming in without you having to chase them.'],
      ['Can I list my service days by area?', 'Yes. We can add a simple section showing which areas you service on which days.'],
    ],
  },
  {
    slug: 'mobile-detailing', trade: 'mobile detailing', plural: 'mobile detailers', short: 'Mobile Detailing',
    sampleName: 'Sample Mobile Detail', sampleTown: 'Pflugerville',
    why: 'Detailing sells on looks. People want to see the before and after and know what each package includes. A site with clear packages and a booking button turns Instagram followers into paying customers.',
    build: ['A packages section that compares interior, exterior, and full details', 'A before-and-after gallery', 'A booking request form that asks for the vehicle type and location', 'Links to your Instagram or TikTok'],
    faq: [
      ['I already post on Instagram. Why a website?', 'Instagram is great for showing work, but it’s hard to find through Google and hard to book from. The site gives your posts somewhere to send people.'],
      ['Can I show package prices?', 'Yes, and they’re easy to update later, especially with the Care Plan.'],
    ],
  },
  {
    slug: 'pressure-washing', trade: 'pressure washing', plural: 'pressure washing companies', short: 'Pressure Washing',
    sampleName: 'Sample Pressure Washing', sampleTown: 'Georgetown',
    why: 'Pressure washing has some of the most satisfying before-and-after photos of any service. A site built around those photos, with a simple quote form, does a lot of the convincing before you even talk to the customer.',
    build: ['A before-and-after gallery front and center', 'Pages for driveways, house washing, decks, and fences', 'A quote form with photo upload', 'A service area section for the towns you cover'],
    faq: [
      ['Can customers send me photos for a quote?', 'Yes. The Local SEO Site plan includes a quote form with photo upload so you can price jobs without driving out.'],
      ['Do I need separate pages for each service?', 'It helps people searching for something specific, like house washing, find the right page. That’s what the Local SEO Site plan is for.'],
    ],
  },
  {
    slug: 'food-trucks', trade: 'food truck', plural: 'food trucks', short: 'Food Trucks',
    sampleName: 'Sample Taco Truck', sampleTown: 'Austin',
    why: 'Food truck customers want two things: the menu and where you’ll be. When that info is buried in old social posts, people give up. A simple site with an up-to-date menu, a weekly schedule, and a catering form fixes that.',
    build: ['A phone-friendly menu that’s easy to update', 'A “where we’ll be this week” section', 'A catering and events request form', 'Links to your social accounts'],
    faq: [
      ['My schedule changes every week. Can I keep it updated?', 'Yes. With the Care Plan you just text us the new schedule, or we can set it up so you can edit it yourself.'],
      ['Can I take catering requests?', 'Yes. We’ll add a form that asks for the date, headcount, and location.'],
    ],
  },
  {
    slug: 'tutors', trade: 'tutoring', plural: 'tutors', short: 'Tutors',
    sampleName: 'Sample Tutoring', sampleTown: 'Austin',
    why: 'Parents choosing a tutor want to know subjects, grade levels, how sessions work, and who the tutor is. A clean site with that info and an easy way to book a first session makes you look more established than a flyer or a post in a parents’ group.',
    build: ['Subject and grade-level sections', 'An About section with your background', 'A form to request a first session', 'Clear info on in-person versus online sessions'],
    faq: [
      ['I’m an independent tutor. Is this worth it?', 'The Starter plan is one page, which is often all an independent tutor needs to look professional and get inquiries.'],
      ['Can I list my rates?', 'Yes, or you can leave them off and discuss rates when parents reach out.'],
    ],
  },
  {
    slug: 'lake-services', trade: 'lake services', plural: 'lake and dock businesses', short: 'Lake & Dock Services',
    sampleName: 'Sample Dock Services', sampleTown: 'Lakeway',
    why: 'Lake property owners search by lake: “Lake Travis dock cleaning,” “Lake LBJ weed removal.” A site with a page for each lake you serve matches those searches. It’s the same approach we used for Waterline Weed Co.',
    build: ['A page for each lake you serve', 'Service pages for docks, shorelines, and seasonal work', 'A quote form with photo upload for dock pictures', 'Google Search Console setup with a sitemap'],
    faq: [
      ['Have you built sites for lake businesses before?', 'Yes. We built waterlineweeds.co for a lake weed removal company on the Highland Lakes, with a page for each lake they serve.'],
      ['Can I add more lakes later?', 'Yes. Each lake page follows the same pattern, so adding one is quick.'],
    ],
  },
  {
    slug: 'handyman', trade: 'handyman', plural: 'handymen', short: 'Handyman',
    sampleName: 'Sample Handyman Services', sampleTown: 'Bee Cave',
    why: 'People search for a handyman when something needs fixing and they don’t know who to call. They want to see quickly whether you do that kind of job and how to reach you. A clear list of jobs you take and a tap-to-call button is most of the battle.',
    build: ['A clear list of the jobs you do (and don’t do)', 'A tap-to-call button and a job request form with photo upload', 'A service area section', 'Space for photos of finished work'],
    faq: [
      ['I do a bit of everything. How do we organize that?', 'We group your work into a few categories, like repairs, installs, and assembly, so people can quickly see if you handle their job.'],
      ['Can people send photos of the problem?', 'Yes, with the photo upload form on the Local SEO Site plan.'],
    ],
  },
];
