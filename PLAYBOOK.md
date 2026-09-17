# Bluebonnet Web: how to get your first 3 paying clients

The website (`node build.mjs`) makes you look legit. It won't bring customers on its own. This is how you get them. Commands are in [README.md](README.md).

## Before you start (30 min)
1. Rename the business if you want, and set your prices: both are in `src/site.mjs`.
2. Make a business email (free Gmail is fine) and put it in `email` in `src/site.mjs`.
3. Decide how you'll get paid. If either of you is under 18, a parent may need to own the Venmo, PayPal, or Stripe account.
4. Agree on the split in writing, for example: "50/50 on everything; whoever finds a client gets an extra 10% of that job."
5. Read the site and fix anything that isn't true for you (see "Before you share anything" in the README).
6. Put the site online (Cloudflare Pages or GitHub Pages are free; Netlify credits are used up on Waterline).

## Find 50 leads (1 hour)
Search Google Maps for things like `lawn care Lakeway`, `house cleaning Round Rock`, `pool service Cedar Park`, `mobile detailing Austin`.
Add businesses to `leads/leads.csv` (opens in Google Sheets or Excel, with `status` set to `new`) when they:
- have **no website** (only a Facebook or Google listing). These are the best leads.
- have a site that's broken, slow, not built for phones, or last updated around 2015.
- have lots of good Google reviews. That means they're busy and can afford $400–900.

## Contact them (split this up)
Instagram/Facebook DMs and walking in work better than cold email for small local businesses.

**Message for no website:**
> Hi [name], I came across [business] on Google Maps. You've got great reviews, but I couldn't find a website for you. My business partner and I build simple websites for local businesses so people searching Google can find you and request a quote. Here's one we built for a lake service company: waterlineweeds.co. Would you be open to me putting together a free mockup of what yours could look like? No cost to look.

**Message for an outdated site:**
> Hi [name], I pulled up [business]'s website on my phone and noticed [specific thing: the menu is cut off / it took ~8 seconds to load / the phone number isn't clickable]. That's probably costing you some calls. We fix this for local businesses at a flat price. Want me to send you a free before-and-after mockup?

**The free mockup is the secret weapon.** Run `node mockup.mjs leads/leads.csv --shot` and every new lead gets a demo site plus `desktop.png` and `phone.png` in `mockups/`. Send them the phone screenshot. Showing someone their own site already looking good sells way better than a pitch.

For your best leads, go further: copy `leads/example-lawn.json`, fill in their real services and service areas from their Google listing, and regenerate. Only use facts you've actually seen. Never make up reviews or claims.

You can also send them the matching page on your own site, like `/websites-for/pool-service/`, which has a sample site built in.

Follow up once after 3–4 days, then move on. Most people won’t reply, and that’s normal. Track your own numbers in the `status` column so you learn what works.

## When they say yes
- Take **50% up front** before building. No exceptions.
- Put the scope in a text or email: pages included, what they send you, 2 rounds of changes, the price.
- Have them buy the domain in **their** name.
- Build it the same way you built Waterline (`build.mjs` pattern: pages, sitemap, Search Console).
- Collect the other 50% when it goes live, then offer the **$35/month Care Plan**. Ten care clients is $350/month for very little work.
- Ask for a Google review and a referral. Put their site on your Work section.

## Numbers to aim for
| Goal | What it takes |
|---|---|
| First $400 | 1 Starter site (keep messaging until someone says yes) |
| $2,000 | ~2 Local SEO sites + a few Care Plans |
| $350/month recurring | 10 Care Plan clients |

## Rules
- Never promise a Google ranking.
- Never make up reviews, stats, or client names on your site or theirs.
- Don't take on a job you can't finish. Tell them your real timeline, including school.
