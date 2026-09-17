# Bluebonnet Web

A website business in a box. Two parts:

1. **The business website** (`src/` → `dist/`): home, pricing, a free website check, your work, and a landing page plus sample site for 10 trades.
2. **The sales tools** (`mockup.mjs`, `leads/`): make a free demo site for a prospect in seconds, then send it with your pitch.

How to actually get clients is in [PLAYBOOK.md](PLAYBOOK.md). Start there.

No npm install needed. Just Node 18+ (and Google Chrome for screenshots).

## Before you share anything

Open `src/site.mjs` and fill in:

| Setting | What to put |
|---|---|
| `name` | Your business name (Bluebonnet Web is a placeholder, so rename it if you like) |
| `email` | A business email for quote requests. Not a school account. |
| `url` | Your real domain once you have one |
| `PLANS` | Your prices |

Then read through the pages and change anything that isn’t true for you. In particular:
- **“We’ll reply within a day”** (contact sections)
- **Payment terms** (half up front, half at launch)
- **Care Plan turnaround** (2 business days)
- **Upgrade policy** (“pay the difference”)

These are sensible defaults, not promises you’ve made yet.

## Commands

| What | Command |
|---|---|
| Build the site | `node build.mjs` |
| Check for broken links and SEO problems | `node scripts/check.mjs` |
| Preview locally | `node scripts/serve.mjs`, then open http://localhost:4322 |
| List trades and color themes for mockups | `node mockup.mjs --list` |
| Mockup for one business | `node mockup.mjs --name "Hill Country Lawn" --trade "lawn care" --town Lakeway --phone "(512) 555-0100" --shot` |
| Mockup with custom services | copy `leads/example-lawn.json`, edit it, then `node mockup.mjs leads/your-file.json --shot` |
| Mockups for every new lead in your tracker | `node mockup.mjs leads/leads.csv --shot` |
| Real site for a paying client | `node mockup.mjs leads/their-name.json --final --shot` (see below) |

`--shot` saves `desktop.png` and `phone.png` next to the mockup. Text those to the business owner.

Mockups go in `mockups/<business-name>/` and are marked “Free demo… Not live yet” across the top.

## Delivering a Starter site ($400 plan)

When a business pays, turn their mockup into the real site:

1. Copy `leads/example-lawn.json` to `leads/<their-name>.json` and fill in **only facts they gave you**:

   ```json
   {
     "name": "Hill Country Lawn Co",
     "trade": "lawn care",
     "town": "Lakeway",
     "areas": ["Lakeway", "Bee Cave"],
     "phone": "(512) 555-0100",
     "texts": true,
     "email": "owner@example.com",
     "url": "https://hillcountrylawn.com",
     "about": "A short paragraph the owner approved.",
     "services": [["Mowing & edging", "Their description."]],
     "photos": ["photos/front-yard.jpg", { "src": "photos/after.jpg", "alt": "Freshly mowed yard in Lakeway" }],
     "formAction": "https://formspree.io/f/xxxxxxx"
   }
   ```

   - `photos` paths are relative to the JSON file. Put their photos in `leads/photos/`. Resize big phone photos first (about 1600px wide is plenty).
   - `formAction` is optional. A free form service like Formspree gives you a URL that emails submissions to the owner. Have **the owner** make the account so the messages go to them.
   - `texts: false` changes “Call or text” to “Call”.
   - Optional: `headline`, `intro`, `cta`, `theme`, `icon`, `description` (the Google snippet).
2. `node mockup.mjs leads/<their-name>.json --final --shot`
3. Open `clients/<their-name>/index.html` and read every word with the owner.
4. Upload the `clients/<their-name>/` folder to a free static host (Cloudflare Pages, Netlify, GitHub Pages), then connect their domain. Screenshots go in a separate `-screenshots` folder, so they don't get uploaded.
5. Set up Google Search Console for their domain and submit `sitemap.xml`, the same way you did for Waterline.

Final mode removes the demo banner, lets Google index the page, adds a description and business schema (built only from fields you filled in), and leaves out the photo section if there are no photos.

The Local SEO Site plan ($900) needs more pages than this one-page template makes. For those, copy this repo's `src/` + `build.mjs` setup or Waterline's.

## Lead tracker

`leads/leads.csv` opens in Google Sheets, Numbers, or Excel. Columns: `name, trade, town, phone, areas, status, found_on, contact, website, problem, contacted, follow_up, notes`.

- Set `status` to `new` (or leave it blank) and the mockup command builds a demo for that row.
- Then move it along: `mockup made` → `contacted` → `replied` → `won` / `lost`.
- `trade` should match one from `node mockup.mjs --list`. Anything else still works, but with generic text.
- Separate multiple `areas` with commas or semicolons, and put the whole field in quotes.
- If you export from Google Sheets, save it back to `leads/leads.csv`.

`leads/`, `mockups/`, and `clients/` are git-ignored so prospects’ info doesn’t end up on GitHub (only the template and example are tracked).

## Adding a trade

1. Add a preset to `mockup/presets.mjs` (headline, intro, 4 services, theme, icon, call-to-action).
2. Add an entry to `src/industries.mjs` with the same `trade` name. That creates `/websites-for/<slug>/` and `/samples/<slug>/`.
3. `node build.mjs && node scripts/check.mjs`

## Putting it online

The build output in `dist/` is plain static files, so any static host works. Netlify credits are used up on Waterline, so use a different free host for this one:

- **Cloudflare Pages:** `npx wrangler pages deploy dist --project-name bluebonnet-web`
- **GitHub Pages / Vercel:** point them at a repo and use `node build.mjs` as the build command and `dist` as the output folder.

Set `url` in `src/site.mjs` to the real domain and rebuild before going live, so the sitemap and canonical links are right.

## Layout

```
src/site.mjs          business info, prices, portfolio
src/industries.mjs    the 10 trade landing pages
src/layout.mjs        page shell, CSS, schema, shared sections (pricing, quiz, form)
src/pages/*.mjs       page content
src/static/           copied to dist/ as-is (favicon, main.js)
mockup/presets.mjs    starter copy + color themes per trade
mockup/render.mjs     the one-page demo site template
mockup.mjs            mockup + client site command
scripts/check.mjs     build checker
scripts/serve.mjs     local preview server
_archive/             the original single-file version
```
