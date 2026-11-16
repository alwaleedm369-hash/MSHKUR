import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.env.MSHKUR_DB_PATH || './data/mshkur.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
db.exec(`
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('owner','admin','seller','marketer','viewer')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  created_by TEXT NOT NULL REFERENCES users(id), make TEXT, model TEXT, trim TEXT,
  year INTEGER, mileage INTEGER, fuel TEXT, transmission TEXT, color TEXT,
  price REAL, currency TEXT NOT NULL DEFAULT 'SAR', city TEXT, status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id), storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL, sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_files_tenant ON files(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id), skill_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued','running','succeeded','failed','cancelled')),
  input_json TEXT NOT NULL, output_json TEXT, error_code TEXT, error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), user_id TEXT NOT NULL REFERENCES users(id),
  workflow_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('running','succeeded','failed')),
  input_json TEXT NOT NULL, output_json TEXT, error_code TEXT, error_message TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_tenant ON workflow_runs(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS workflow_steps (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id), step_key TEXT NOT NULL, skill_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued','running','succeeded','failed')),
  job_id TEXT REFERENCES jobs(id), output_json TEXT, error_code TEXT, error_message TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_run ON workflow_steps(run_id, created_at);
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id), action_type TEXT NOT NULL,
  payload_json TEXT NOT NULL, payload_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','executed','expired')),
  created_at TEXT NOT NULL, decided_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  actor_user_id TEXT REFERENCES users(id), event_type TEXT NOT NULL,
  resource_type TEXT, resource_id TEXT, details_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_events(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS vehicle_assets (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES files(id), original_file_id TEXT REFERENCES files(id),
  asset_role TEXT NOT NULL DEFAULT 'gallery', sort_order INTEGER NOT NULL DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'original',
  created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vehicle_assets ON vehicle_assets(tenant_id, vehicle_id, sort_order);
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  name TEXT, phone TEXT, email TEXT, source TEXT NOT NULL DEFAULT 'website',
  message TEXT, status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id, status, created_at DESC);
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'web', visitor_key TEXT,
  status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('visitor','assistant','staff','system')),
  body TEXT NOT NULL, metadata_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id, created_at);
CREATE TABLE IF NOT EXISTS photo_batch_runs (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id), status TEXT NOT NULL,
  total_items INTEGER NOT NULL, completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS photo_batch_items (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES photo_batch_runs(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id), source_asset_id TEXT NOT NULL,
  source_file_id TEXT NOT NULL, output_file_id TEXT, status TEXT NOT NULL,
  error_message TEXT, sort_order INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photo_batch_items ON photo_batch_items(run_id, sort_order);
CREATE TABLE IF NOT EXISTS daily_usage (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id), usage_date TEXT NOT NULL,
  action_key TEXT NOT NULL, used_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(tenant_id,user_id,usage_date,action_key)
);
`);
export function nowIso() { return new Date().toISOString(); }
export function audit({ tenantId, actorUserId = null, eventType, resourceType = null, resourceId = null, details = {} }) {
  db.prepare(`INSERT INTO audit_events(id,tenant_id,actor_user_id,event_type,resource_type,resource_id,details_json,created_at)
    VALUES(?,?,?,?,?,?,?,?)`).run(randomUUID(), tenantId, actorUserId, eventType, resourceType, resourceId, JSON.stringify(details), nowIso());
}
