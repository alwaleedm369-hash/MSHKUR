import { db } from '../server/db.mjs';

const required = [
  'tenants','users','sessions','vehicles','files','vehicle_assets','jobs',
  'workflow_runs','workflow_steps','approvals','audit_events','leads',
  'conversations','conversation_messages','tenant_settings',
  'photo_batch_runs','photo_batch_items','imported_skill_sources','daily_usage'
];
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(row=>row.name);
const missing = required.filter(name=>!tables.includes(name));
const integrity = db.pragma('integrity_check').map(row=>row.integrity_check);
const foreignKeys = db.pragma('foreign_key_check');
const problems = [];
if(missing.length)problems.push('Missing tables: '+missing.join(', '));
if(integrity.some(result=>result!=='ok'))problems.push('SQLite integrity check failed: '+integrity.join('; '));
if(foreignKeys.length)problems.push('Foreign key violations: '+foreignKeys.length);
if(problems.length){
  for(const problem of problems)console.error(problem);
  db.close();
  process.exit(1);
}
console.log('SQLite schema, integrity, and foreign keys OK ('+required.length+' required tables).');
db.close();
