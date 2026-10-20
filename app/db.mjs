// Accounts, sessions, and saved sites, in one SQLite file (Node's built-in node:sqlite, no packages).
// The file lives at app/data/bluebonnet.db and is git-ignored: it holds customers' emails and password hashes.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { slugify } from '../mockup/render.mjs';

const dataDir = process.env.BLUEBONNET_DATA || join(dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(join(dataDir, 'bluebonnet.db'));

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
`);

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

export function sessionUser(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT u.id, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) { endSession(token); return null; }
  return { id: row.id, email: row.email };
}

export const endSession = (token) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));

// ---- Sites: one per account for now. `data` is the JSON the builder edits (see cleanSite in server.mjs).
const rowToSite = (r) => r && { slug: r.slug, data: JSON.parse(r.data), published: !!r.published, updatedAt: r.updated_at };

export const siteForUser = (userId) => rowToSite(db.prepare('SELECT * FROM sites WHERE user_id = ?').get(userId));
export const siteBySlug = (slug) => rowToSite(db.prepare('SELECT * FROM sites WHERE slug = ?').get(slug));

// Picks "juarez-lawn-service", then "juarez-lawn-service-2", ... skipping ones other accounts own
const freeSlug = (name, userId) => {
  const base = slugify(name).slice(0, 48).replace(/-$/, '') || 'my-business';
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
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
