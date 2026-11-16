import { randomUUID } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { registerAuthRoutes, requireAuth } from './auth.mjs';
import { db, nowIso, audit } from './db.mjs';
import { createJob, getJobForTenant, getSkills, listJobsForTenant, runJob } from './engine/maestro.mjs';
import { classifyIntent } from './engine/intent.mjs';
import { generateWithLocalModel, getLocalModelStatus } from './engine/model-router.mjs';
import { listAgents } from './agents/registry.mjs';
import { createApproval, decideApproval, listApprovals } from './engine/policy.mjs';
import { readImageFile, storeImageDataUrl } from './storage.mjs';
import { executeWorkflow, getWorkflowForTenant, listWorkflows } from './engine/workflow.mjs';

export function registerRoutes(app) {
  registerAuthRoutes(app);
  app.get('/api/workflows', requireAuth, (_req,res) => res.json({workflows:listWorkflows()}));
  app.post('/api/workflows/:workflowId/run', requireAuth, async (req,res) => {
    const { vehicleId }=req.body||{};
    if(typeof vehicleId!=='string')return res.status(400).json({error:'vehicle_id_required'});
    try{
      const workflow=await executeWorkflow({workflowId:req.params.workflowId,tenantId:req.user.tenantId,userId:req.user.id,input:{vehicleId}});
      return res.status(workflow.status==='succeeded'?200:422).json({workflow});
    }catch(error){return res.status(error.code==='vehicle_not_found'?404:400).json({error:error.code||'workflow_failed',message:error.message});}
  });
  app.get('/api/workflows/:id', requireAuth, (req,res) => {
    const workflow=getWorkflowForTenant(req.params.id,req.user.tenantId);
    return workflow?res.json({workflow}):res.status(404).json({error:'not_found'});
  });
  app.get('/api/skills', requireAuth, (_req,res) => res.json({ skills:getSkills() }));
  app.get('/api/agents', requireAuth, (_req,res) => res.json({ agents:listAgents() }));
  app.get('/api/assistant/status', requireAuth, (_req,res) => res.json({ orchestration:'deterministic-local', model:getLocalModelStatus(), paidFallback:false }));
  app.post('/api/assistant/chat', requireAuth, async (req,res) => {
    const { message } = req.body || {};
    if(typeof message!=='string'||!message.trim()||message.length>6000) return res.status(400).json({error:'invalid_message'});
    try {
      const result=await generateWithLocalModel({messages:[{role:'system',content:'أنت مساعد مشكور. لا تخترع حقائق عن السيارات أو المستخدم. لا تنفذ إجراءات خارجية. أجب بالعربية بوضوح.'},{role:'user',content:message.trim()}]});
      audit({tenantId:req.user.tenantId,actorUserId:req.user.id,eventType:'assistant.local_model',resourceType:'conversation',details:{model:result.model}});
      return res.json({reply:result.content,provider:result.provider,model:result.model});
    } catch(error) {
      return res.status(error.code==='local_model_not_configured'?503:502).json({error:error.code||'local_model_error',message:error.message});
    }
  });
  app.post('/api/assistant/plan', requireAuth, (req,res) => {
    const { request } = req.body || {};
    if (typeof request !== 'string' || request.length > 2000) return res.status(400).json({ error:'invalid_request' });
    const intent=classifyIntent(request);
    return res.json({ intent, agents:listAgents().filter(agent => !intent.skillId || agent.skills.includes(intent.skillId)) });
  });
  app.get('/api/audit', requireAuth, (req,res) => {
    if(!['owner','admin'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
    const events=db.prepare('SELECT id,actor_user_id,event_type,resource_type,resource_id,details_json,created_at FROM audit_events WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100').all(req.user.tenantId).map(row=>({...row,details:JSON.parse(row.details_json),details_json:undefined}));
    return res.json({events});
  });
  app.get('/api/approvals', requireAuth, (req,res) => res.json({ approvals:listApprovals(req.user.tenantId) }));
  app.post('/api/approvals', requireAuth, (req,res) => {
    try { return res.status(201).json({ approval:createApproval({tenantId:req.user.tenantId,userId:req.user.id,actionType:req.body?.actionType,payload:req.body?.payload}) }); }
    catch(error){ return res.status(400).json({ error:error.code || 'approval_rejected', message:error.message }); }
  });
  app.post('/api/approvals/:id/decision', requireAuth, (req,res) => {
    try { const result=decideApproval({tenantId:req.user.tenantId,userId:req.user.id,role:req.user.role,approvalId:req.params.id,decision:req.body?.decision}); return result ? res.json({approval:result}) : res.status(404).json({error:'not_found'}); }
    catch(error){ return res.status(error.code==='forbidden'?403:400).json({error:error.code || 'decision_failed',message:error.message}); }
  });
  app.get('/api/files/:id', requireAuth, (req,res) => {
    try {
      const {buffer,file}=readImageFile(req.params.id,req.user.tenantId);
      res.set('Content-Type',file.mime_type);
      res.set('Content-Length',String(file.size_bytes));
      res.set('Cache-Control','private, no-store');
      res.set('X-Content-Type-Options','nosniff');
      return res.status(200).send(buffer);
    } catch { return res.status(404).json({error:'not_found'}); }
  });
  app.post('/api/tasks', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }), requireAuth, (req,res) => {
    const { skillId, input:rawInput } = req.body || {};
    if (typeof skillId !== 'string' || !rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) return res.status(400).json({ error:'invalid_task' });
    try {
      const manifest=getSkills().find(skill=>skill.id===skillId);
      if(!manifest) return res.status(404).json({error:'skill_not_found'});
      if(manifest.runtime==='browser') return res.status(400).json({error:'skill_requires_browser_runtime'});
      const input={...rawInput};
      if(['image-optimize','license-plate-blur-region'].includes(skillId)) {
        if(input.imageBase64) {
          const stored=storeImageDataUrl(input.imageBase64,{tenantId:req.user.tenantId,userId:req.user.id});
          delete input.imageBase64;
          input.imageFileId=stored.id;
        } else if(input.imageFileId) {
          readImageFile(input.imageFileId,req.user.tenantId);
        } else return res.status(400).json({error:'image_required'});
      }
      const job = createJob({ tenantId:req.user.tenantId, userId:req.user.id, skillId, input });
      runJob(job.id).catch(() => {});
      return res.status(202).json(job);
    } catch (error) { return res.status(400).json({ error:error.code || 'task_rejected', message:error.message }); }
  });
  app.get('/api/tasks', requireAuth, (req,res) => res.json({ tasks:listJobsForTenant(req.user.tenantId) }));
  app.get('/api/tasks/:id', requireAuth, (req,res) => {
    const job = getJobForTenant(req.params.id, req.user.tenantId);
    return job ? res.json({ task:job }) : res.status(404).json({ error:'not_found' });
  });
  app.get('/api/vehicles', requireAuth, (req,res) => {
    const rows = db.prepare('SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status,notes,created_at,updated_at FROM vehicles WHERE tenant_id=? ORDER BY created_at DESC').all(req.user.tenantId);
    res.json({ vehicles:rows });
  });
  app.put('/api/vehicles/:id', requireAuth, (req,res) => {
    const current=db.prepare('SELECT * FROM vehicles WHERE id=? AND tenant_id=?').get(req.params.id,req.user.tenantId);
    if(!current) return res.status(404).json({error:'not_found'});
    const v=req.body||{};
    const fields=['make','model','trim','year','mileage','fuel','transmission','color','price','city','notes'];
    const next={};
    for(const key of fields) if(v[key]!==undefined) next[key]=v[key];
    if(next.year!==undefined && next.year!==null && (!Number.isInteger(next.year)||next.year<1950||next.year>new Date().getFullYear()+1)) return res.status(400).json({error:'invalid_year'});
    if(next.price!==undefined && next.price!==null && (typeof next.price!=='number'||next.price<0)) return res.status(400).json({error:'invalid_price'});
    if(next.mileage!==undefined && next.mileage!==null && (typeof next.mileage!=='number'||next.mileage<0)) return res.status(400).json({error:'invalid_mileage'});
    const merged={...current,...next,updated_at:nowIso()};
    const params={id:current.id,tenant_id:req.user.tenantId,make:merged.make,model:merged.model,trim:merged.trim,year:merged.year,mileage:merged.mileage,fuel:merged.fuel,transmission:merged.transmission,color:merged.color,price:merged.price,city:merged.city,notes:merged.notes,updated_at:merged.updated_at};
    db.prepare(`UPDATE vehicles SET make=@make,model=@model,trim=@trim,year=@year,mileage=@mileage,fuel=@fuel,transmission=@transmission,color=@color,price=@price,city=@city,notes=@notes,updated_at=@updated_at WHERE id=@id AND tenant_id=@tenant_id`).run(params);
    audit({tenantId:req.user.tenantId,actorUserId:req.user.id,eventType:'vehicle.updated',resourceType:'vehicle',resourceId:current.id});
    return res.json({vehicle:db.prepare('SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status,notes,created_at,updated_at FROM vehicles WHERE id=? AND tenant_id=?').get(current.id,req.user.tenantId)});
  });
  app.delete('/api/vehicles/:id', requireAuth, (req,res) => {
    if(!['owner','admin'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
    const result=db.prepare('DELETE FROM vehicles WHERE id=? AND tenant_id=?').run(req.params.id,req.user.tenantId);
    if(!result.changes) return res.status(404).json({error:'not_found'});
    audit({tenantId:req.user.tenantId,actorUserId:req.user.id,eventType:'vehicle.deleted',resourceType:'vehicle',resourceId:req.params.id});
    return res.status(204).end();
  });

  app.post('/api/vehicles', requireAuth, (req,res) => {
    const v = req.body || {};
    const allowed = ['make','model','trim','year','mileage','fuel','transmission','color','price','city','notes'];
    const record = {};
    for (const key of allowed) if (v[key] !== undefined) record[key] = v[key];
    if (typeof record.make !== 'string' || !record.make.trim() || typeof record.model !== 'string' || !record.model.trim()) return res.status(400).json({ error:'make_and_model_required' });
    if (record.year !== undefined && (!Number.isInteger(record.year) || record.year < 1950 || record.year > new Date().getFullYear()+1)) return res.status(400).json({ error:'invalid_year' });
    if (record.price !== undefined && (typeof record.price !== 'number' || record.price < 0)) return res.status(400).json({ error:'invalid_price' });
    if (record.mileage !== undefined && (typeof record.mileage !== 'number' || record.mileage < 0)) return res.status(400).json({ error:'invalid_mileage' });
    if (record.trim !== undefined && (typeof record.trim !== 'string' || record.trim.length > 80)) return res.status(400).json({ error:'invalid_trim' });
    const id = randomUUID(), now = nowIso();
    db.prepare(`INSERT INTO vehicles(id,tenant_id,created_by,make,model,trim,year,mileage,fuel,transmission,color,price,city,notes,created_at,updated_at)
      VALUES(@id,@tenant_id,@created_by,@make,@model,@trim,@year,@mileage,@fuel,@transmission,@color,@price,@city,@notes,@created_at,@updated_at)`)
      .run({ id, tenant_id:req.user.tenantId, created_by:req.user.id, make:record.make.trim(), model:record.model.trim(), trim:record.trim||null, year:record.year||null, mileage:record.mileage??null, fuel:record.fuel||null, transmission:record.transmission||null, color:record.color||null, price:record.price??null, city:record.city||null, notes:record.notes||null, created_at:now, updated_at:now });
    audit({ tenantId:req.user.tenantId, actorUserId:req.user.id, eventType:'vehicle.created', resourceType:'vehicle', resourceId:id });
    return res.status(201).json({ vehicle:db.prepare('SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status,notes,created_at,updated_at FROM vehicles WHERE id=? AND tenant_id=?').get(id,req.user.tenantId) });
  });
}
