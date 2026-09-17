// Builds the static site into dist/.  Run: node build.mjs
import { readdir, rm, mkdir, writeFile, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE } from './src/site.mjs';
import { INDUSTRIES } from './src/industries.mjs';
import { renderPage } from './src/layout.mjs';
import { renderMockup } from './mockup/render.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
const pagesDir = join(root, 'src/pages');
const today = new Date().toISOString().slice(0, 10);

// Base path when the site lives in a subfolder (e.g. GitHub Pages project sites)
const BASE = new URL(SITE.url).pathname.replace(/\/$/, '');
const withBase = (html) => BASE ? html.replace(/(\s(?:href|src|action)=")\/(?!\/)/g, `$1${BASE}/`).replace('<html lang="en">', `<html lang="en" data-base="${BASE}">`) : html;

if (SITE.url.includes('YOUR-DOMAIN')) console.warn('! SITE.url is still a placeholder in src/site.mjs (canonical links and sitemap will be wrong).');
if (!SITE.email) console.warn('! SITE.email is empty in src/site.mjs (the quote form will show a setup message).');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, 'src/static'), out, { recursive: true });

const pages = [];
for (const file of (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(join(pagesDir, file)).href);
  pages.push(...[mod.default].flat());
}

const seen = new Set();
for (const page of pages) {
  if (seen.has(page.path)) throw new Error(`Duplicate page path: ${page.path}`);
  seen.add(page.path);
  if (!page.noindex && page.title.length > 70) console.warn(`! long title (${page.title.length}): ${page.path}`);
  if (!page.noindex && (page.description.length < 70 || page.description.length > 165)) {
    console.warn(`! description length ${page.description.length}: ${page.path}`);
  }
  const dest = join(out, page.file || join(page.path, 'index.html'));
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, withBase(renderPage(page)));
}

// Sample sites for each industry page (noindex, clearly labeled as samples)
for (const i of INDUSTRIES) {
  const dest = join(out, 'samples', i.slug, 'index.html');
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, withBase(renderMockup(
    { name: i.sampleName, trade: i.trade, town: i.sampleTown },
    { banner: `Sample site by ${SITE.name}. Not a real business.` },
  )));
}

const indexable = pages.filter((p) => !p.noindex)
  .sort((a, b) => (b.priority || '0.5') - (a.priority || '0.5') || a.path.localeCompare(b.path));
await writeFile(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url>
    <loc>${SITE.url}${p.path}</loc>
    <lastmod>${p.updated || today}</lastmod>
  </url>`).join('\n')}
</urlset>
`);

await writeFile(join(out, 'robots.txt'), `User-agent: *
Allow: /
Disallow: ${BASE}/samples/

Sitemap: ${SITE.url}/sitemap.xml
`);

await writeFile(join(out, 'llms.txt'), `# ${SITE.name}

> ${SITE.summary}

- Based in: ${SITE.city}, Texas
- Serves: ${SITE.serviceArea.join(', ')}

## Pages
${indexable.map((p) => `- [${p.title.split(' | ')[0]}](${SITE.url}${p.path}): ${p.description}`).join('\n')}
`);

console.log(`Built ${pages.length} pages + ${INDUSTRIES.length} samples → dist/ (${indexable.length} in sitemap)`);
