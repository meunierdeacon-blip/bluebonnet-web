// Builds, checks, and publishes dist/ to the gh-pages branch (GitHub Pages).  Run: node scripts/deploy.mjs
// Commit and push your source changes to main first; the deploy commit message records which commit was deployed.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();

execFileSync('node', ['build.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['scripts/check.mjs'], { cwd: root, stdio: 'inherit' });

const remote = run('git', ['remote', 'get-url', 'origin']);
const commit = run('git', ['rev-parse', '--short', 'HEAD']);
if (run('git', ['status', '--porcelain'])) console.warn('! You have uncommitted changes. They will be deployed but not saved to main.');

const tmp = mkdtempSync(join(tmpdir(), 'bluebonnet-deploy-'));
try {
  cpSync(join(root, 'dist'), tmp, { recursive: true });
  run('git', ['init', '-q', '-b', 'gh-pages'], tmp);
  run('git', ['config', 'user.name', run('git', ['config', 'user.name'])], tmp);
  run('git', ['config', 'user.email', run('git', ['config', 'user.email'])], tmp);
  run('git', ['add', '-A'], tmp);
  run('git', ['commit', '-q', '-m', `Deploy site from ${commit}`], tmp);
  execFileSync('git', ['push', '-q', '-f', remote, 'gh-pages'], { cwd: tmp, stdio: 'inherit' });
  console.log('Deployed. GitHub Pages usually updates within a minute or two.');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
