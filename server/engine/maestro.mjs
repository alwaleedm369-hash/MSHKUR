import { randomUUID } from 'node:crypto';
import { db, nowIso, audit } from '../db.mjs';
import { executeSkill, skillManifests } from './registry.mjs';

const manifestById = new Map(skillManifests.map(item => [item.id, item]));
const running = new Set();
const cancelRequested = new Set();

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
  const job = db.prepare('SELECT * FROM jobs WHERE id=?').get(jobId);
  if (!job || job.status !== 'queued') return;
  running.add(jobId);
  const now = nowIso();
  const claimed = db.prepare("UPDATE jobs SET status='running',attempts=attempts+1,updated_at=? WHERE id=? AND status='queued'").run(now, jobId);
  if (!claimed.changes) { running.delete(jobId); return; }
  try {
    const output = await executeSkill(job.skill_id, JSON.parse(job.input_json), { tenantId:job.tenant_id, userId:job.user_id });
    if (cancelRequested.has(jobId) || db.prepare("SELECT error_code FROM jobs WHERE id=? AND status='running'").get(jobId)?.error_code==='cancel_requested') {
      db.prepare("UPDATE jobs SET status='cancelled',output_json=NULL,error_code='cancelled',error_message='Cancelled by user',updated_at=? WHERE id=? AND status='running'").run(nowIso(), jobId);
      audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.cancelled', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
    } else {
      db.prepare("UPDATE jobs SET status='succeeded',output_json=?,error_code=NULL,error_message=NULL,updated_at=? WHERE id=? AND status='running'").run(JSON.stringify(output), nowIso(), jobId);
      audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.succeeded', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
    }
  } catch (error) {
    if (cancelRequested.has(jobId)) {
      db.prepare("UPDATE jobs SET status='cancelled',error_code='cancelled',error_message='Cancelled by user',updated_at=? WHERE id=? AND status='running'").run(nowIso(), jobId);
      audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.cancelled', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
    } else {
      db.prepare("UPDATE jobs SET status='failed',error_code=?,error_message=?,updated_at=? WHERE id=? AND status='running'")
        .run(error.code || 'execution_failed', String(error.message || 'Execution failed').slice(0,300), nowIso(), jobId);
      audit({ tenantId:job.tenant_id, actorUserId:job.user_id, eventType:'job.failed', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id, code:error.code || 'execution_failed' } });
    }
  } finally {
    cancelRequested.delete(jobId);
    running.delete(jobId);
  }
}

export function cancelJobForTenant(jobId, tenantId, userId) {
  const job = db.prepare('SELECT id,skill_id,status FROM jobs WHERE id=? AND tenant_id=?').get(jobId, tenantId);
  if (!job) return null;
  if (job.status === 'queued') {
    const result = db.prepare("UPDATE jobs SET status='cancelled',error_code='cancelled',error_message='Cancelled by user',updated_at=? WHERE id=? AND tenant_id=? AND status='queued'").run(nowIso(), jobId, tenantId);
    if (result.changes) audit({ tenantId, actorUserId:userId, eventType:'job.cancelled', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
    return getJobForTenant(jobId, tenantId);
  }
  if (job.status === 'running') {
    cancelRequested.add(jobId);
    db.prepare("UPDATE jobs SET error_code='cancel_requested',error_message='Cancellation requested; current local operation will finish before its result is discarded.',updated_at=? WHERE id=? AND tenant_id=? AND status='running'").run(nowIso(),jobId,tenantId);
    return { ...getJobForTenant(jobId, tenantId), cancellationRequested:true, note:'The current local operation will finish before the result is discarded.' };
  }
  return getJobForTenant(jobId, tenantId);
}

export async function retryJobForTenant(jobId, tenantId, userId) {
  const job = db.prepare('SELECT id,skill_id,status,attempts FROM jobs WHERE id=? AND tenant_id=?').get(jobId, tenantId);
  if (!job) return null;
  if (job.status !== 'failed' || job.attempts >= 3) throw Object.assign(new Error(job.attempts >= 3 ? 'Retry limit reached (3 attempts)' : 'Only failed jobs can be retried'), { code:'job_not_retryable' });
  const result = db.prepare("UPDATE jobs SET status='queued',output_json=NULL,error_code=NULL,error_message=NULL,updated_at=? WHERE id=? AND tenant_id=? AND status='failed' AND attempts < 3").run(nowIso(), jobId, tenantId);
  if (!result.changes) throw Object.assign(new Error('Job state changed; refresh and try again'), { code:'job_state_changed' });
  audit({ tenantId, actorUserId:userId, eventType:'job.retried', resourceType:'job', resourceId:jobId, details:{ skillId:job.skill_id } });
  runJob(jobId).catch(() => {});
  return getJobForTenant(jobId, tenantId);
}

export function getJobForTenant(jobId, tenantId) {
  const row = db.prepare('SELECT id,skill_id,status,input_json,output_json,error_code,error_message,attempts,created_at,updated_at FROM jobs WHERE id=? AND tenant_id=?').get(jobId, tenantId);
  if (!row) return null;
  return { ...row, input:JSON.parse(row.input_json), output:row.output_json ? JSON.parse(row.output_json) : null, input_json:undefined, output_json:undefined };
}
export function listJobsForTenant(tenantId, limit = 30) {
  return db.prepare('SELECT id,skill_id,status,error_code,error_message,attempts,created_at,updated_at FROM jobs WHERE tenant_id=? ORDER BY created_at DESC LIMIT ?').all(tenantId, Math.min(Math.max(limit,1),100));
}
export function getSkills() { return skillManifests; }
export async function recoverQueuedJobs() {
  db.prepare("UPDATE jobs SET status='cancelled',error_message='Cancellation completed during recovery',updated_at=? WHERE status='running' AND error_code='cancel_requested'").run(nowIso());
  db.prepare("UPDATE jobs SET status='queued',error_code=NULL,error_message=NULL,updated_at=? WHERE status='running'").run(nowIso());
  while (true) {
    const rows = db.prepare("SELECT id FROM jobs WHERE status='queued' ORDER BY created_at LIMIT 20").all();
    if (!rows.length) break;
    for (const row of rows) await runJob(row.id);
  }
}
