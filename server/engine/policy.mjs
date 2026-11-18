import { createHash, randomUUID } from 'node:crypto';
import { db, nowIso, audit } from '../db.mjs';

const externalActions = new Set(['send_message','publish_listing','share_data','delete_resource','purchase','modify_external_record']);
const stable = value => Array.isArray(value) ? '['+value.map(stable).join(',')+']' : value && typeof value==='object' ? '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}' : JSON.stringify(value);
export function requiresApproval(actionType){ return externalActions.has(actionType); }
export function createApproval({tenantId,userId,actionType,payload}){
  if(!requiresApproval(actionType)) throw Object.assign(new Error('Unknown or non-external action type'),{code:'invalid_action_type'});
  if(!payload || typeof payload!=='object' || Array.isArray(payload)) throw Object.assign(new Error('Action payload must be an object'),{code:'invalid_payload'});
  const id=randomUUID(), payloadJson=stable(payload);
  if(payloadJson.length>32_000) throw Object.assign(new Error('Approval payload is too large'),{code:'payload_too_large'});
  const payloadHash=createHash('sha256').update(payloadJson).digest('hex'), now=nowIso();
  db.prepare(`INSERT INTO approvals(id,tenant_id,user_id,action_type,payload_json,payload_hash,status,created_at)
    VALUES(?,?,?,?,?,?,?,?)`).run(id,tenantId,userId,actionType,payloadJson,payloadHash,'pending',now);
  audit({tenantId,actorUserId:userId,eventType:'approval.created',resourceType:'approval',resourceId:id,details:{actionType,payloadHash}});
  return {id,actionType,payload,payloadHash,status:'pending',createdAt:now};
}
export function listApprovals(tenantId){
  return db.prepare('SELECT id,user_id,action_type,payload_json,payload_hash,status,created_at,decided_at FROM approvals WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100')
    .all(tenantId).map(row=>({...row,payload:JSON.parse(row.payload_json),payload_json:undefined}));
}
export function decideApproval({tenantId,userId,role,approvalId,decision}){
  if(!['owner','admin'].includes(role)) throw Object.assign(new Error('Only an owner or admin can decide approvals'),{code:'forbidden'});
  if(!['approved','rejected'].includes(decision)) throw Object.assign(new Error('Invalid decision'),{code:'invalid_decision'});
  const row=db.prepare('SELECT * FROM approvals WHERE id=? AND tenant_id=?').get(approvalId,tenantId);
  if(!row) return null;
  if(row.status!=='pending') throw Object.assign(new Error('Approval is no longer pending'),{code:'approval_not_pending'});
  const now=nowIso();
  db.prepare('UPDATE approvals SET status=?,decided_at=? WHERE id=? AND tenant_id=?').run(decision,now,approvalId,tenantId);
  audit({tenantId,actorUserId:userId,eventType:'approval.'+decision,resourceType:'approval',resourceId:approvalId,details:{payloadHash:row.payload_hash}});
  return {id:approvalId,status:decision,payloadHash:row.payload_hash,decidedAt:now,execution:'not_connected'};
}
