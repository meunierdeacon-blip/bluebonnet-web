// Accounts, sessions, and saved sites, in one SQLite file (Node's built-in node:sqlite, no packages).
// The file lives at app/data/bluebonnet.db and is git-ignored: it holds customers' emails and password hashes.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { slugify } from '../mockup/render.mjs';
import { CONFIG, RESERVED_SLUGS } from './config.mjs';

mkdirSync(CONFIG.dataDir, { recursive: true });
const db = new DatabaseSync(join(CONFIG.dataDir, 'bluebonnet.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    pass_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
`);

// Billing columns, added to databases made before billing existed. sub_status mirrors Stripe's subscription status.
const userCols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
for (const [col, type] of [['stripe_customer_id', 'TEXT'], ['sub_id', 'TEXT'], ['sub_status', 'TEXT'], ['sub_period_end', 'INTEGER']]) {
  if (!userCols.includes(col)) db.exec(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
}

// Stripe keeps retrying a failed card for a while (past_due), so the site stays up during that time
const PAYING = new Set(['active', 'trialing', 'past_due']);

// ---- Passwords: scrypt with a per-user salt, stored as "salt:hash" in hex
const hashPassword = (pw) => {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${scryptSync(pw, salt, 64).toString('hex')}`;
};
const checkPassword = (pw, stored) => {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(scryptSync(pw, Buffer.from(salt, 'hex'), 64), Buffer.from(hash, 'hex'));
};
// Compared against when the email doesn't exist, so a wrong email takes as long as a wrong password
const DUMMY_HASH = hashPassword(randomBytes(8).toString('hex'));

export function createUser(email, password) {
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return null;
  const { lastInsertRowid } = db.prepare('INSERT INTO users (email, pass_hash) VALUES (?, ?)').run(email, hashPassword(password));
  return Number(lastInsertRowid);
}

export function verifyUser(email, password) {
  const user = db.prepare('SELECT id, pass_hash FROM users WHERE email = ?').get(email);
  const ok = checkPassword(password, user?.pass_hash || DUMMY_HASH);
  return ok && user ? user.id : null;
}

// ---- Sessions: the cookie holds a random token; the database only keeps its SHA-256
const SESSION_DAYS = 30;
const sha = (s) => createHash('sha256').update(s).digest('hex');

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sha(token), userId, Date.now() + SESSION_DAYS * 864e5);
  return { token, maxAge: SESSION_DAYS * 86400 };
}

const toUser = (r) => r && {
  id: r.id, email: r.email, stripeCustomerId: r.stripe_customer_id || null, subStatus: r.sub_status || null, paying: PAYING.has(r.sub_status),
};

export function sessionUser(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) { endSession(token); return null; }
  return toUser(row);
}

export const deleteUser = (userId) => db.prepare('DELETE FROM users WHERE id = ?').run(userId); // sites, sessions, resets cascade
export const endSession = (token) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
export const endAllSessions = (userId) => db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
export const userById = (id) => toUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
export const userByEmail = (email) => toUser(db.prepare('SELECT * FROM users WHERE email = ?').get(email));

// ---- Password resets: one-hour, one-use links. Like sessions, only the token's hash is stored.
export function createResetToken(userId) {
  db.prepare('DELETE FROM password_resets WHERE user_id = ? OR expires_at < ?').run(userId, Date.now());
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, Date.now() + 3600e3);
  return token;
}

export function useResetToken(token, newPassword) {
  const row = db.prepare('SELECT user_id, expires_at FROM password_resets WHERE token_hash = ?').get(sha(String(token)));
  if (!row || row.expires_at < Date.now()) return null;
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(row.user_id);
  db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(newPassword), row.user_id);
  endAllSessions(row.user_id); // log out everywhere, in case someone else had the old password
  return row.user_id;
}

// ---- Billing (written by the Stripe webhook; see stripe.mjs)
export const setStripeCustomer = (userId, customerId) => db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);

export function updateSubscription({ userId, customerId, subId, status, periodEnd }) {
  const where = userId ? ['id = ?', userId] : ['stripe_customer_id = ?', customerId];
  db.prepare(`UPDATE users SET sub_id = ?, sub_status = ?, sub_period_end = ?${userId && customerId ? ', stripe_customer_id = ?' : ''} WHERE ${where[0]}`)
    .run(...[subId, status, periodEnd || null, ...(userId && customerId ? [customerId] : []), where[1]]);
}

// ---- Sites: one per account for now. `data` is the JSON the builder edits (see cleanSite in server.mjs).
const rowToSite = (r) => r && { slug: r.slug, data: JSON.parse(r.data), published: !!r.published, updatedAt: r.updated_at, ownerPaying: PAYING.has(r.sub_status) };

const SITE_SQL = 'SELECT s.*, u.sub_status FROM sites s JOIN users u ON u.id = s.user_id';
export const siteForUser = (userId) => rowToSite(db.prepare(`${SITE_SQL} WHERE s.user_id = ?`).get(userId));
export const siteBySlug = (slug) => rowToSite(db.prepare(`${SITE_SQL} WHERE s.slug = ?`).get(slug));

// Picks "juarez-lawn-service", then "juarez-lawn-service-2", ... skipping ones other accounts own
const freeSlug = (name, userId) => {
  const base = slugify(name).slice(0, 48).replace(/-$/, '') || 'my-business';
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (RESERVED_SLUGS.has(slug)) continue;
    const owner = db.prepare('SELECT user_id FROM sites WHERE slug = ?').get(slug);
    if (!owner || owner.user_id === userId) return slug;
  }
};

// The address is set from the business name on first save and then stays put, so shared links keep working
export function saveSite(userId, data) {
  const existing = siteForUser(userId);
  if (existing) {
    db.prepare(`UPDATE sites SET data = ?, updated_at = datetime('now') WHERE user_id = ?`).run(JSON.stringify(data), userId);
  } else {
    db.prepare('INSERT INTO sites (user_id, slug, data) VALUES (?, ?, ?)').run(userId, freeSlug(data.name, userId), JSON.stringify(data));
  }
  return siteForUser(userId);
}

export function setPublished(userId, published) {
  db.prepare(`UPDATE sites SET published = ?, updated_at = datetime('now') WHERE user_id = ?`).run(published ? 1 : 0, userId);
  return siteForUser(userId);
}

// ---- Daily backups: a full copy of the database in <data>/backups/, keeping the last 14 days.
// They sit on the same volume, so they undo mistakes and bad data. Download one now and then for an off-site copy.
const KEEP_DAYS = 14;
export function backupToday() {
  const dir = join(CONFIG.dataDir, 'backups');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `bluebonnet-${new Date().toISOString().slice(0, 10)}.db`);
  if (existsSync(file)) return null;
  db.exec(`VACUUM INTO '${file.replaceAll("'", "''")}'`);
  const old = readdirSync(dir).filter((f) => /^bluebonnet-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort().slice(0, -KEEP_DAYS);
  for (const f of old) rmSync(join(dir, f));
  return file;
}
