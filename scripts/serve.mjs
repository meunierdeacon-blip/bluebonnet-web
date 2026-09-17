// Serves dist/ locally for previewing: node scripts/serve.mjs  → http://localhost:4322 (plus the base path from SITE.url)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const { SITE } = await import('../src/site.mjs');
const BASE = new URL(SITE.url).pathname.replace(/\/$/, '');

const PORT = Number(process.env.PORT) || 4322;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };

createServer(async (req, res) => {
  let raw = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (BASE && (raw === BASE || raw.startsWith(`${BASE}/`))) raw = raw.slice(BASE.length) || '/';
  const path = normalize(raw).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, path);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(await readFile(join(DIST, '404.html')).catch(() => 'Not found'));
  }
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
