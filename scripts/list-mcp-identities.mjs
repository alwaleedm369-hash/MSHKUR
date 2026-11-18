import 'dotenv/config';
import { db } from '../server/db.mjs';
const rows=db.prepare('SELECT u.id AS userId,u.name,u.role,t.id AS tenantId,t.name AS tenantName FROM users u JOIN tenants t ON t.id=u.tenant_id ORDER BY t.created_at,u.created_at').all();
if(!rows.length)console.log('No local users yet. Register through the MSHKUR web app first.');
else console.table(rows);
db.close();
