import { db } from '../server/db.mjs';
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(row=>row.name);
const required = ['tenants','users','sessions','vehicles','files','jobs','workflow_runs','workflow_steps','approvals','audit_events'];
const missing = required.filter(name=>!tables.includes(name));
if(missing.length){console.error('Missing database tables:',missing.join(', '));process.exit(1);}
console.log('SQLite schema OK:',required.join(', '));
db.close();
