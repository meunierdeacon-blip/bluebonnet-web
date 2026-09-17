// Starter copy for each trade. Everything here is generic on purpose: no years in business,
// licenses, insurance, guarantees, reviews, or prices, because we don't know those about a prospect.
// Add facts you've actually confirmed (from their Google listing or a call) in the lead's JSON instead.

export const THEMES = {
  lake:  { ink: '#0f2f3a', accent: '#f4c542', accentInk: '#1b2a24', hero1: '#0f3b4a', hero2: '#16606e', bg: '#f5f9f9', soft: '#e3f0f0' },
  green: { ink: '#1d2b1f', accent: '#2f7d4f', accentInk: '#ffffff', hero1: '#1e4d2b', hero2: '#3c7a3f', bg: '#f7f8f2', soft: '#e6eedc' },
  clean: { ink: '#1c2533', accent: '#2b7de9', accentInk: '#ffffff', hero1: '#e9f3ff', hero2: '#ffffff', bg: '#ffffff', soft: '#eef5ff', lightHero: true },
  bold:  { ink: '#15151a', accent: '#e63946', accentInk: '#ffffff', hero1: '#15151a', hero2: '#2b2d42', bg: '#f6f6f8', soft: '#ececf1' },
  warm:  { ink: '#2b1d14', accent: '#d9622b', accentInk: '#ffffff', hero1: '#5a2e17', hero2: '#9c4a1f', bg: '#fdf8f3', soft: '#f7e9dc' },
  slate: { ink: '#1e2530', accent: '#4f46e5', accentInk: '#ffffff', hero1: '#1e2a3a', hero2: '#334155', bg: '#f8fafc', soft: '#e8ecf4' },
};

export const PRESETS = {
  'lawn care': {
    theme: 'green', icon: '🌿',
    headline: 'A yard you’re proud to come home to',
    intro: 'Reliable mowing, edging, and yard upkeep for homes around {town}.',
    services: [
      ['Mowing & edging', 'Clean lines and a freshly cut lawn on a schedule that fits your yard.'],
      ['Hedge & shrub trimming', 'Shaped, tidy hedges and shrubs that don’t take over the walkway.'],
      ['Leaf & debris cleanup', 'Seasonal cleanups so the lawn can breathe and the beds look sharp.'],
      ['Flower bed upkeep', 'Weeding and fresh mulch to keep beds looking finished.'],
    ],
    cta: 'Get a free yard quote',
  },
  landscaping: {
    theme: 'green', icon: '🌳',
    headline: 'Outdoor spaces built for Texas weather',
    intro: 'Landscape design, installs, and upkeep for homes and businesses around {town}.',
    services: [
      ['Landscape design', 'A plan that fits your space, your budget, and the Central Texas climate.'],
      ['Planting & installs', 'Trees, shrubs, and beds put in properly so they last.'],
      ['Hardscaping', 'Paths, borders, and patios that tie the yard together.'],
      ['Ongoing maintenance', 'Keep it looking like install day, all year.'],
    ],
    cta: 'Request a free estimate',
  },
  'house cleaning': {
    theme: 'clean', icon: '✨',
    headline: 'Come home to a clean house',
    intro: 'Friendly, detail-minded home cleaning around {town}.',
    services: [
      ['Recurring cleaning', 'Weekly, every-other-week, or monthly visits so it stays clean.'],
      ['Deep cleaning', 'Baseboards, inside appliances, and the spots that get skipped.'],
      ['Move-in / move-out', 'Get your deposit back or start fresh in a new place.'],
      ['One-time cleans', 'Before guests, after a party, or whenever you need a reset.'],
    ],
    cta: 'Get a cleaning quote',
  },
  'pool service': {
    theme: 'lake', icon: '🏊',
    headline: 'Clear, swim-ready water all season',
    intro: 'Pool cleaning, chemical balancing, and equipment checks around {town}.',
    services: [
      ['Weekly pool service', 'Skimming, brushing, vacuuming, and balanced chemicals every visit.'],
      ['Green-to-clean', 'Bringing neglected pools back to clear water.'],
      ['Equipment checks', 'Pumps, filters, and heaters looked over so small issues stay small.'],
      ['Opening & closing', 'Seasonal startup and shutdown done right.'],
    ],
    cta: 'Get a pool service quote',
  },
  'mobile detailing': {
    theme: 'bold', icon: '🚗',
    headline: 'Showroom clean, right in your driveway',
    intro: 'Mobile car detailing that comes to you around {town}.',
    services: [
      ['Interior detail', 'Vacuum, shampoo, and wipe-down of every surface inside.'],
      ['Exterior wash & wax', 'Hand wash, decontamination, and a protective finish.'],
      ['Full detail', 'Inside and out, for when your car needs a total reset.'],
      ['Fleet & multi-car', 'Bring the whole household or work fleet in one visit.'],
    ],
    cta: 'Book a detail',
  },
  'pressure washing': {
    theme: 'slate', icon: '💦',
    headline: 'Years of grime, gone in an afternoon',
    intro: 'Pressure and soft washing for driveways, siding, and patios around {town}.',
    services: [
      ['Driveways & sidewalks', 'Lift oil, dirt, and stains from concrete.'],
      ['House washing', 'Gentle soft washing for siding, brick, and stucco.'],
      ['Decks & patios', 'Get outdoor living spaces looking new again.'],
      ['Fences', 'Bring faded wood and vinyl fences back to life.'],
    ],
    cta: 'Get a free quote',
  },
  'food truck': {
    theme: 'warm', icon: '🌮',
    headline: 'Find us, then follow your nose',
    intro: 'Made-to-order food around {town}. Check where we’re parked this week.',
    services: [
      ['The menu', 'Our regular lineup, made fresh to order.'],
      ['Where we’ll be', 'Check this spot for this week’s locations and hours.'],
      ['Catering & events', 'Bring the truck to your party, office, or event.'],
      ['Specials', 'Rotating items. Follow along so you don’t miss them.'],
    ],
    cta: 'Book us for an event',
  },
  tutoring: {
    theme: 'slate', icon: '📚',
    headline: 'Confidence that shows up on the report card',
    intro: 'One-on-one tutoring for students around {town}, in person or online.',
    services: [
      ['Math', 'From the basics through algebra, geometry, and beyond.'],
      ['Reading & writing', 'Stronger essays, better comprehension, less stress.'],
      ['Test prep', 'Focused practice before the big tests.'],
      ['Homework help', 'Regular sessions to stay on top of assignments.'],
    ],
    cta: 'Schedule a first session',
  },
  'lake services': {
    theme: 'lake', icon: '⚓',
    headline: 'More time on the water, less time on upkeep',
    intro: 'Dock, shoreline, and lake property services around {town}.',
    services: [
      ['Dock cleaning', 'Clear away grime, algae, and buildup from docks and walkways.'],
      ['Shoreline cleanup', 'Keep banks and shallows clean and usable.'],
      ['Boat lift care', 'Checks and cleaning to keep lifts working smoothly.'],
      ['Seasonal service', 'Regular visits so problems never get a head start.'],
    ],
    cta: 'Get a free quote',
  },
  handyman: {
    theme: 'warm', icon: '🔧',
    headline: 'That to-do list? Consider it done',
    intro: 'Home repairs and odd jobs around {town}, big and small.',
    services: [
      ['Repairs', 'Doors, drywall, fixtures, and the things that just stopped working.'],
      ['Installs', 'TVs, shelves, lights, and ceiling fans put up properly.'],
      ['Assembly', 'Furniture and playsets built so you don’t have to.'],
      ['Small projects', 'Painting, caulking, and the jobs that keep getting pushed.'],
    ],
    cta: 'Get a quote',
  },
};

export const DEFAULT_PRESET = {
  theme: 'slate', icon: '⭐',
  headline: 'Local service you can count on',
  intro: 'Proudly serving {town} and nearby areas.',
  services: [
    ['Our main service', 'Describe the service customers ask about most.'],
    ['Another service', 'Describe what’s included and who it’s for.'],
    ['Another service', 'Keep it short and specific.'],
  ],
  cta: 'Get a free quote',
};
