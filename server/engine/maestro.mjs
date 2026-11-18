import { randomUUID } from 'node:crypto';
import { db, nowIso, audit } from '../db.mjs';
import { executeSkill, skillManifests } from './registry.mjs';

const manifestById = new Map(skillManifests.map(item => [item.id, item]));
const running = new Set();
export function planTask({ skillId, input }) {
  const skill = manifestById.get(skillId);
  if (!skill) throw Object.assign(new Error('Unknown skill'), { code: 'unknown_skill' });
  return { planId: randomUUID(), skillId, steps: [{ id:'validate-input', type:'schema-validation' }, { id:'execute-skill', type:'local-handler', skillId }], externalSideEffects: false, approvalRequired: false };
}
export function createJob({ tenantId, userId, skillId, input }) {
  const plan = planTask({ skillId, input });
  const id = randomUUID(), now = nowIso();
  db.prepare(`INSERT INTO jobs(id,tenant_id,user_id,skill_id,status,input_json,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?)`).run(id, tenantId, userId, skillId, 'queued', JSON.stringify(input), now, now);
  audit({ tenantId, actorUserId:userId, eventType:'job.queued', resourceType:'job', resourceId:id, details:{ skillId } });
  return { id, status:'queued', plan };
}
export async function runJob(jobId) {
  if (running.has(jobId)) return;
  running.add(jobId);
  const job = db.prepare('SELECT * FROM jobs WHERE id=?').get(jobId);
  if (!job || job.status !== 'queued') { running.delete(jobId); return; }
  const now = nowIso();
  db.prepare("UPDATE jobs SET status='running',attempts=attempts+1,updated_at=? WHERE id=?").run(now, jobId);
  try {
    const output = await executeSkill(job.skill_id, JSON.parse(job.input_json), { tenantId:job.tenant_id, userId:job.user_id });
    db.prepare("UPDATE jobs SET status='succeeded',output_json=?,updated_at=? WHERE id=?").run(JSON.stringify(output), nowIso(), jobId);
    audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.succeeded', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
  } catch (error) {
    db.prepare("UPDATE jobs SET status='failed',error_code=?,error_message=?,updated_at=? WHERE id=?")
      .run(error.code || 'execution_failed', String(error.message || 'Execution failed').slice(0,300), nowIso(), jobId);
    audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.failed', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id, code:error.code || 'execution_failed' } });
  } finally { running.delete(jobId); }
}
export function getJobForTenant(jobId, tenantId) {
  const row = db.prepare('SELECT id,skill_id,status,input_json,output_json,error_code,error_message,attempts,created_at,updated_at FROM jobs WHERE id=? AND tenant_id=?').get(jobId, tenantId);
  if (!row) return null;
  return { ...row, input:JSON.parse(row.input_json), output:row.output_json ? JSON.parse(row.output_json) : null, input_json:undefined, output_json:undefined };
}
export function listJobsForTenant(tenantId, limit = 30) {
  return db.prepare('SELECT id,skill_id,status,error_code,attempts,created_at,updated_at FROM jobs WHERE tenant_id=? ORDER BY created_at DESC LIMIT ?').all(tenantId, Math.min(Math.max(limit,1),100));
}
export function getSkills() { return skillManifests; }
export async function recoverQueuedJobs() {
  const rows = db.prepare("SELECT id FROM jobs WHERE status='queued' ORDER BY created_at LIMIT 20").all();
  for (const row of rows) await runJob(row.id);
}
