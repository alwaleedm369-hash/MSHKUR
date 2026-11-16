import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { db, nowIso, audit } from './db.mjs';

const SESSION_DAYS = 14;
const COOKIE = 'mshkur_session';
const hashToken = token => createHash('sha256').update(token).digest('hex');
const passwordHash = password => {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
};
const verifyPassword = (password, encoded) => {
  const [scheme, salt, expected] = String(encoded).split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const target = Buffer.from(expected, 'hex');
  return actual.length === target.length && timingSafeEqual(actual, target);
};
function cookieToken(req) {
  const raw = req.headers.cookie || '';
  const entry = raw.split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='));
  return entry ? decodeURIComponent(entry.slice(COOKIE.length + 1)) : null;
}
function setCookie(res, token, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`);
}
function clearCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}
function publicUser(row) {
  return { id: row.id, tenantId: row.tenant_id, tenantName: row.tenant_name, name: row.name, email: row.email, role: row.role };
}
function issueSession(userId, res) {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiry = new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)')
    .run(hashToken(token), userId, expiry, now.toISOString());
  setCookie(res, token, SESSION_DAYS * 86400);
}
export function registerAuthRoutes(app) {
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, tenantName } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80 ||
        typeof tenantName !== 'string' || tenantName.trim().length < 2 || tenantName.length > 100 ||
        typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        typeof password !== 'string' || password.length < 12 || password.length > 200) {
      return res.status(400).json({ error: 'invalid_registration', message: 'تحقق من الاسم والبريد وكلمة المرور (12 حرفاً على الأقل).' });
    }
    if (db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim())) {
      return res.status(409).json({ error: 'email_exists', message: 'هذا البريد مسجل مسبقاً.' });
    }
    const tenantId = randomUUID(), userId = randomUUID(), now = nowIso();
    const slugBase = tenantName.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 50) || 'workspace';
    const slug = `${slugBase}-${tenantId.slice(0, 8)}`;
    const create = db.transaction(() => {
      db.prepare('INSERT INTO tenants(id,name,slug,created_at) VALUES(?,?,?,?)').run(tenantId, tenantName.trim(), slug, now);
      db.prepare('INSERT INTO users(id,tenant_id,name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?,?)')
        .run(userId, tenantId, name.trim(), email.trim().toLowerCase(), passwordHash(password), 'owner', now);
    });
    create();
    issueSession(userId, res);
    audit({ tenantId, actorUserId: userId, eventType: 'auth.register', resourceType: 'user', resourceId: userId });
    return res.status(201).json({ user: publicUser({ id:userId, tenant_id:tenantId, tenant_name:tenantName.trim(), name:name.trim(), email:email.trim().toLowerCase(), role:'owner' }) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 200) {
      return res.status(400).json({ error: 'invalid_credentials' });
    }
    const row = db.prepare(`SELECT u.*, t.name AS tenant_name FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.email=? COLLATE NOCASE`).get(email.trim());
    if (!row || !verifyPassword(password, row.password_hash)) return res.status(401).json({ error: 'invalid_credentials', message: 'البريد أو كلمة المرور غير صحيحة.' });
    issueSession(row.id, res);
    audit({ tenantId: row.tenant_id, actorUserId: row.id, eventType: 'auth.login', resourceType: 'user', resourceId: row.id });
    return res.json({ user: publicUser(row) });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = cookieToken(req);
    if (!token) return res.status(401).json({ error: 'unauthenticated' });
    const row = db.prepare(`SELECT u.id,u.tenant_id,u.name,u.email,u.role,t.name AS tenant_name
      FROM sessions s JOIN users u ON u.id=s.user_id JOIN tenants t ON t.id=u.tenant_id
      WHERE s.token_hash=? AND s.expires_at > ?`).get(hashToken(token), nowIso());
    if (!row) { clearCookie(res); return res.status(401).json({ error: 'unauthenticated' }); }
    return res.json({ user: publicUser(row) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = cookieToken(req);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token));
    clearCookie(res);
    return res.json({ ok: true });
  });
}
export function requireAuth(req, res, next) {
  const token = cookieToken(req);
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  const row = db.prepare(`SELECT u.id,u.tenant_id,u.name,u.email,u.role,t.name AS tenant_name
    FROM sessions s JOIN users u ON u.id=s.user_id JOIN tenants t ON t.id=u.tenant_id
    WHERE s.token_hash=? AND s.expires_at > ?`).get(hashToken(token), nowIso());
  if (!row) { clearCookie(res); return res.status(401).json({ error: 'unauthenticated' }); }
  req.user = publicUser(row);
  return next();
}
