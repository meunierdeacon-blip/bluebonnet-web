// Checks the built site for broken internal links, missing titles/descriptions, duplicate titles,
// bad JSON-LD, missing alt text, and more than one <h1>.  Run after building: node scripts/check.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SITE } from '../src/site.mjs';

const BASE = new URL(SITE.url).pathname.replace(/\/$/, '');

const DIST = 'dist';
if (!existsSync(DIST)) { console.error('No dist/ folder. Run node build.mjs first.'); process.exit(1); }

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const errors = [];
const titles = new Map();

const resolves = (href, from) => {
  let clean = href.split('#')[0].split('?')[0];
  if (BASE && clean.startsWith('/')) {
    if (!clean.startsWith(`${BASE}/`)) return false;
    clean = clean.slice(BASE.length);
  }
  if (!clean) return true;
  const target = clean.startsWith('/') ? join(DIST, clean) : join(from, '..', clean);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(DIST, file);
  const isSample = rel.startsWith('samples/');

  for (const [, href] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) continue;
    if (!resolves(href, file)) errors.push(`${rel}: broken link ${href}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) errors.push(`${rel}: <img> without alt`);
  }
  if (isSample) continue;

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) errors.push(`${rel}: missing <title>`);
  else titles.set(title, [...(titles.get(title) || []), rel]);
  if (!html.includes('name="robots" content="noindex"') && !/<meta name="description" content="[^"]{50,}"/.test(html)) errors.push(`${rel}: missing or short meta description`);
  const h1s = html.match(/<h1\b/g)?.length || 0;
  if (h1s !== 1) errors.push(`${rel}: ${h1s} <h1> tags (want 1)`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (e) { errors.push(`${rel}: invalid JSON-LD (${e.message})`); }
  }
}

for (const [title, where] of titles) {
  if (where.length > 1) errors.push(`duplicate title "${title}" on ${where.join(', ')}`);
}

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
for (const [, loc] of sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)) {
  const path = new URL(loc).pathname.slice(BASE.length);
  if (!existsSync(join(DIST, path, 'index.html'))) errors.push(`sitemap: ${path} has no page`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  console.error(`\n${errors.length} problem(s) in ${htmlFiles.length} HTML files.`);
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} HTML files checked, no problems.`);
