import { randomUUID } from 'node:crypto';
import { db, nowIso, audit } from '../db.mjs';
import { createJob, runJob, getJobForTenant } from './maestro.mjs';
import { readFileSync } from 'node:fs';

const definitions=JSON.parse(readFileSync(new URL('../../workflows/registry.json',import.meta.url),'utf8'));
const definitionById=new Map(definitions.map(item=>[item.id,item]));

export function listWorkflows(){return definitions;}
export function getWorkflowForTenant(id,tenantId){
  const row=db.prepare('SELECT * FROM workflow_runs WHERE id=? AND tenant_id=?').get(id,tenantId);
  if(!row)return null;
  const steps=db.prepare('SELECT id,step_key,skill_id,status,job_id,output_json,error_code,error_message,created_at,updated_at FROM workflow_steps WHERE run_id=? AND tenant_id=? ORDER BY created_at').all(id,tenantId).map(step=>({...step,output:step.output_json?JSON.parse(step.output_json):null,output_json:undefined}));
  return {...row,input:JSON.parse(row.input_json),output:row.output_json?JSON.parse(row.output_json):null,input_json:undefined,output_json:undefined,steps};
}
export async function executeWorkflow({workflowId,tenantId,userId,input}){
  const definition=definitionById.get(workflowId);
  if(!definition)throw Object.assign(new Error('Unknown workflow'),{code:'unknown_workflow'});
  if(definition.runtime!=='server'||definition.externalSideEffects)throw Object.assign(new Error('Workflow is not approved for local execution'),{code:'workflow_not_allowed'});
  const vehicle=db.prepare('SELECT * FROM vehicles WHERE id=? AND tenant_id=?').get(input?.vehicleId,tenantId);
  if(!vehicle)throw Object.assign(new Error('Vehicle not found in this tenant'),{code:'vehicle_not_found'});
  const id=randomUUID(),now=nowIso();
  db.prepare('INSERT INTO workflow_runs(id,tenant_id,user_id,workflow_id,status,input_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
    .run(id,tenantId,userId,workflowId,'running',JSON.stringify(input),now,now);
  audit({tenantId,actorUserId:userId,eventType:'workflow.started',resourceType:'workflow',resourceId:id,details:{workflowId}});
  const outputs={};
  try{
    for(const step of definition.steps){
      const stepId=randomUUID(),started=nowIso();
      db.prepare('INSERT INTO workflow_steps(id,run_id,tenant_id,step_key,skill_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
        .run(stepId,id,tenantId,step.key,step.skillId,'queued',started,started);
      const job=createJob({tenantId,userId,skillId:step.skillId,input:vehicle});
      db.prepare("UPDATE workflow_steps SET status='running',job_id=?,updated_at=? WHERE id=?").run(job.id,nowIso(),stepId);
      await runJob(job.id);
      const task=getJobForTenant(job.id,tenantId);
      if(!task||task.status!=='succeeded'){
        const error=Object.assign(new Error(task?.error_message||'Workflow step failed'),{code:task?.error_code||'workflow_step_failed'});
        db.prepare("UPDATE workflow_steps SET status='failed',error_code=?,error_message=?,updated_at=? WHERE id=?")
          .run(error.code,error.message.slice(0,300),nowIso(),stepId);
        throw error;
      }
      outputs[step.key]=task.output;
      db.prepare("UPDATE workflow_steps SET status='succeeded',output_json=?,updated_at=? WHERE id=?")
        .run(JSON.stringify(task.output),nowIso(),stepId);
    }
    const completed=nowIso();
    db.prepare("UPDATE workflow_runs SET status='succeeded',output_json=?,updated_at=? WHERE id=?")
      .run(JSON.stringify({validation:outputs.validate,adDraft:outputs.draft}),completed,id);
    audit({tenantId,actorUserId:userId,eventType:'workflow.succeeded',resourceType:'workflow',resourceId:id,details:{workflowId,steps:definition.steps.length}});
  }catch(error){
    const failed=nowIso();
    db.prepare("UPDATE workflow_runs SET status='failed',error_code=?,error_message=?,updated_at=? WHERE id=?")
      .run(error.code||'workflow_failed',String(error.message||'Workflow failed').slice(0,300),failed,id);
    audit({tenantId,actorUserId:userId,eventType:'workflow.failed',resourceType:'workflow',resourceId:id,details:{workflowId,code:error.code||'workflow_failed'}});
  }
  return getWorkflowForTenant(id,tenantId);
}
