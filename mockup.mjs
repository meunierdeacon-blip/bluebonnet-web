// Builds free one-page demo websites for prospects, to send with your pitch.
//
//   node mockup.mjs --name "Hill Country Lawn Co" --trade "lawn care" --town Lakeway --phone "(512) 555-0100"
//   node mockup.mjs leads/example-lawn.json          (one lead, with custom services)
//   node mockup.mjs leads/leads.csv                  (every row whose status is "new" or blank)
//   node mockup.mjs --list                           (show trades and themes)
//
// Options: --areas "Lakeway, Bee Cave"  --theme green  --headline "..."  --shot (save desktop + phone screenshots)
//          --all (with a CSV: include every row, not just new ones)
//          --final (for a paying client: no demo banner, real photos, SEO tags; see "Delivering a Starter site" in README)
// Output:  mockups/<business-slug>/index.html  (+ desktop.png and phone.png with --shot)
//          clients/<business-slug>/ with --final (upload that whole folder to any static host)
//
// Only put facts you've confirmed (from their Google listing, Facebook, or a call) into a mockup.
// Never add reviews, ratings, prices, licenses, or "years in business" you haven't seen.
import { readFileSync, mkdirSync, writeFileSync, existsSync, rmSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PRESETS, THEMES } from './mockup/presets.mjs';
import { renderMockup, slugify } from './mockup/render.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log(`Trades: ${Object.keys(PRESETS).join(', ')}\nThemes: ${Object.keys(THEMES).join(', ')}`);
  process.exit(0);
}

const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const splitList = (s) => s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);

// Minimal CSV parser: handles quoted fields, commas and newlines inside quotes, and "" escapes.
function parseCsv(text) {
  const rows = [[]];
  let field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { rows.at(-1).push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      rows.at(-1).push(field); field = ''; rows.push([]);
    } else field += c;
  }
  rows.at(-1).push(field);
  const [header, ...body] = rows.filter((r) => r.some((f) => f.trim()));
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || '').trim()])));
}

let leads;
const input = args.find((a) => /\.(json|csv)$/i.test(a));
if (input?.toLowerCase().endsWith('.csv')) {
  leads = parseCsv(readFileSync(input, 'utf8'))
    .filter((r) => r.name && (args.includes('--all') || !r.status || r.status.toLowerCase() === 'new'))
    .map((r) => ({ ...r, areas: r.areas ? splitList(r.areas) : undefined }));
  if (!leads.length) console.log('No rows to build. (Only rows with status "new" or blank are built; add --all for every row.)');
} else {
  const lead = input ? JSON.parse(readFileSync(input, 'utf8')) : {};
  for (const k of ['name', 'trade', 'town', 'phone', 'email', 'areas', 'theme', 'headline', 'intro', 'cta']) {
    if (flag(k)) lead[k] = k === 'areas' ? splitList(flag(k)) : flag(k);
  }
  leads = [lead];
}

const final = args.includes('--final');
const baseDir = input ? dirname(resolve(input)) : process.cwd();
const shots = args.includes('--shot') && existsSync(CHROME);
if (args.includes('--shot') && !shots) console.warn('! Google Chrome not found, skipping screenshots.');

let failed = 0;
for (const lead of leads) {
  if (!lead.name || !lead.trade || !lead.town) {
    console.error(`✗ ${lead.name || '(no name)'}: needs name, trade, and town. Try --list for trades.`);
    failed++;
    continue;
  }
  const dir = join(final ? 'clients' : 'mockups', slugify(lead.name));
  mkdirSync(dir, { recursive: true });
  if (final) {
    if (!copyPhotos(lead, dir)) { failed++; continue; }
    writeSiteFiles(lead, dir);
    if (!lead.phone && !lead.email && !lead.formAction) console.warn('! No phone, email, or formAction: customers have no way to reach this business.');
    if (!lead.url) console.warn('! No url set: add the live address to the JSON so canonical link and sitemap are written.');
  }
  writeFileSync(join(dir, 'index.html'), renderMockup(lead, { final }));
  console.log(`${final ? 'Client site' : 'Mockup'}: ${dir}/index.html`);
  if (shots) screenshot(dir, final ? `${dir}-screenshots` : dir);
}
if (failed) process.exit(1);

// Screenshots for a final client site go in a sibling folder so they don't get uploaded with the site.
function screenshot(dir, outDir) {
  mkdirSync(outDir, { recursive: true });
  const chrome = (size, out, url, extra = []) => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--allow-file-access-from-files', '--virtual-time-budget=2000', `--window-size=${size}`, `--screenshot=${resolve(outDir, out)}`,
    ...extra, url], { stdio: 'ignore' });
  chrome('1280,900', 'desktop.png', pathToFileURL(resolve(dir, 'index.html')).href);
  // Headless Chrome won't size a window below ~500px, so render the phone view inside a 390px iframe.
  const frame = resolve(dir, '_phone.html');
  writeFileSync(frame, '<body style="margin:0"><iframe src="index.html" style="border:0;width:390px;height:844px;display:block"></iframe>');
  chrome('390,844', 'phone.png', pathToFileURL(frame).href, ['--force-device-scale-factor=2']);
  rmSync(frame);
  console.log(`  Screenshots: ${outDir}/desktop.png, ${outDir}/phone.png`);
}

// Copies photos listed in the lead (paths relative to the JSON file) into <dir>/images/ and points the page at them.
function copyPhotos(lead, dir) {
  if (!lead.photos?.length) return true;
  mkdirSync(join(dir, 'images'), { recursive: true });
  const out = [];
  for (const p of lead.photos) {
    const photo = typeof p === 'string' ? { src: p } : { ...p };
    if (/^https?:/.test(photo.src)) { out.push(photo); continue; }
    const from = resolve(baseDir, photo.src);
    if (!existsSync(from)) { console.error(`✗ ${lead.name}: photo not found: ${from}`); return false; }
    const name = basename(from).toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    copyFileSync(from, join(dir, 'images', name));
    out.push({ ...photo, src: `images/${name}` });
  }
  lead.photos = out;
  return true;
}

function writeSiteFiles(lead, dir) {
  const url = lead.url?.replace(/\/?$/, '/');
  writeFileSync(join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n${url ? `\nSitemap: ${url}sitemap.xml\n` : ''}`);
  if (url) {
    writeFileSync(join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${url}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`);
  }
}
