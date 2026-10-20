// Private demo links: each lead's mockup gets an unguessable path like /p/juarez-lawn-service-7f3k9q2m/.
// Tokens are saved in leads/preview-links.json (git-ignored) so links stay the same across deploys.
// Leads marked "removed" or "lost" get no link, so their page disappears on the next deploy.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './render.mjs';
import { parseCsv } from './csv.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const leadsFile = join(root, 'leads/leads.csv');
const tokensFile = join(root, 'leads/preview-links.json');

// → [{ name, slug, src (mockup HTML file), path ('/p/<slug>-<token>/') }]
export function previewLinks() {
  if (!existsSync(leadsFile)) return [];
  const tokens = existsSync(tokensFile) ? JSON.parse(readFileSync(tokensFile, 'utf8')) : {};
  const links = parseCsv(readFileSync(leadsFile, 'utf8'))
    .filter((r) => !['removed', 'lost'].includes(r.status))
    .map((r) => ({ name: r.name, slug: slugify(r.name) }))
    .map((l) => ({ ...l, src: join(root, 'mockups', l.slug, 'index.html') }))
    .filter((l) => existsSync(l.src))
    .map((l) => {
      tokens[l.slug] ||= randomBytes(4).toString('hex');
      return { ...l, path: `/p/${l.slug}-${tokens[l.slug]}/` };
    });
  writeFileSync(tokensFile, `${JSON.stringify(tokens, null, 2)}\n`);
  return links;
}
