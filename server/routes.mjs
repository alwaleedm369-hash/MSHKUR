import { registerAuthRoutes, requireAuth } from './auth.mjs';
import { db, nowIso, audit } from './db.mjs';
import { createJob, getJobForTenant, getSkills, listJobsForTenant, runJob } from './engine/maestro.mjs';

export function registerRoutes(app) {
  registerAuthRoutes(app);
  app.get('/api/skills', requireAuth, (_req,res) => res.json({ skills:getSkills() }));
  app.post('/api/tasks', requireAuth, (req,res) => {
    const { skillId, input } = req.body || {};
    if (typeof skillId !== 'string' || !input || typeof input !== 'object' || Array.isArray(input)) return res.status(400).json({ error:'invalid_task' });
    try {
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
  app.post('/api/vehicles', requireAuth, (req,res) => {
    const v = req.body || {};
    const allowed = ['make','model','trim','year','mileage','fuel','transmission','color','price','city','notes'];
    const record = {};
    for (const key of allowed) if (v[key] !== undefined) record[key] = v[key];
    if (typeof record.make !== 'string' || !record.make.trim() || typeof record.model !== 'string' || !record.model.trim()) return res.status(400).json({ error:'make_and_model_required' });
    if (record.year !== undefined && (!Number.isInteger(record.year) || record.year < 1950 || record.year > new Date().getFullYear()+1)) return res.status(400).json({ error:'invalid_year' });
    if (record.price !== undefined && (typeof record.price !== 'number' || record.price < 0)) return res.status(400).json({ error:'invalid_price' });
    const id = crypto.randomUUID(), now = nowIso();
    db.prepare(`INSERT INTO vehicles(id,tenant_id,created_by,make,model,trim,year,mileage,fuel,transmission,color,price,city,notes,created_at,updated_at)
      VALUES(@id,@tenant_id,@created_by,@make,@model,@trim,@year,@mileage,@fuel,@transmission,@color,@price,@city,@notes,@created_at,@updated_at)`)
      .run({ id, tenant_id:req.user.tenantId, created_by:req.user.id, make:record.make.trim(), model:record.model.trim(), trim:record.trim||null, year:record.year||null, mileage:record.mileage??null, fuel:record.fuel||null, transmission:record.transmission||null, color:record.color||null, price:record.price??null, city:record.city||null, notes:record.notes||null, created_at:now, updated_at:now });
    audit({ tenantId:req.user.tenantId, actorUserId:req.user.id, eventType:'vehicle.created', resourceType:'vehicle', resourceId:id });
    return res.status(201).json({ vehicle:db.prepare('SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status,notes,created_at,updated_at FROM vehicles WHERE id=? AND tenant_id=?').get(id,req.user.tenantId) });
  });
}
