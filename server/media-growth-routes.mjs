import { randomUUID } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { db, nowIso, audit } from './db.mjs';
import { requireAuth } from './auth.mjs';
import { storeImageDataUrl } from './storage.mjs';
import { executeSkill } from './engine/registry.mjs';

const FREE_DAILY_LIMITS = { image_jobs: 3, ad_drafts: 10, assistant_messages: 40 };
export function consumeDailyUsage(tenantId, userId, key) {
  const day = nowIso().slice(0, 10);
  const limit = FREE_DAILY_LIMITS[key] || 20;
  const result = db.prepare('INSERT INTO daily_usage(id,tenant_id,user_id,usage_date,action_key,used_count) VALUES(?,?,?,?,?,1) ON CONFLICT(tenant_id,user_id,usage_date,action_key) DO UPDATE SET used_count=used_count+1 WHERE used_count < ?').run(randomUUID(),tenantId,userId,day,key,limit);
  if (!result.changes) throw Object.assign(new Error('وصلت إلى الحد اليومي المجاني لهذه المهمة. حاول غداً.'), { code: 'daily_limit_reached' });
}

async function executePhotoBatch(runId, tenantId, userId, vehicleId) {
  const items=db.prepare('SELECT * FROM photo_batch_items WHERE run_id=? ORDER BY sort_order').all(runId);
  for(const item of items) {
    try {
      consumeDailyUsage(tenantId,userId,'image_jobs');
      db.prepare("UPDATE photo_batch_items SET status='running',updated_at=? WHERE id=?").run(nowIso(),item.id);
      const output=await executeSkill('image-optimize',{imageFileId:item.source_file_id,maxWidth:2048,quality:84},{tenantId,userId});
      const derivedId=randomUUID();
      db.prepare("INSERT INTO vehicle_assets(id,tenant_id,vehicle_id,file_id,original_file_id,asset_role,sort_order,processing_status,created_by,created_at) VALUES(?,?,?,?,?,'derived',?,'optimized',?,?)")
        .run(derivedId,tenantId,vehicleId,output.imageFileId,item.source_file_id,item.sort_order,userId,nowIso());
      db.prepare("UPDATE photo_batch_items SET output_file_id=?,status='succeeded',updated_at=? WHERE id=?").run(output.imageFileId,nowIso(),item.id);
      db.prepare('UPDATE photo_batch_runs SET completed_items=completed_items+1,updated_at=? WHERE id=?').run(nowIso(),runId);
    } catch(error) {
      db.prepare("UPDATE photo_batch_items SET status='failed',error_message=?,updated_at=? WHERE id=?").run(String(error.message||'Processing failed').slice(0,300),nowIso(),item.id);
      db.prepare('UPDATE photo_batch_runs SET failed_items=failed_items+1,updated_at=? WHERE id=?').run(nowIso(),runId);
    }
  }
  const counts=db.prepare("SELECT SUM(status='failed') AS failed,SUM(status='succeeded') AS done FROM photo_batch_items WHERE run_id=?").get(runId);
  const status=counts.failed?'completed_with_errors':'succeeded';
  db.prepare('UPDATE photo_batch_runs SET status=?,updated_at=? WHERE id=?').run(status,nowIso(),runId);
}

export function registerMediaAndGrowthRoutes(app) {
  app.get('/api/usage', requireAuth, (req, res) => {
    const usage = Object.fromEntries(Object.entries(FREE_DAILY_LIMITS).map(([key, limit]) => {
      const used = db.prepare('SELECT used_count FROM daily_usage WHERE tenant_id=? AND user_id=? AND usage_date=? AND action_key=?').get(req.user.tenantId, req.user.id, nowIso().slice(0,10), key)?.used_count || 0;
      return [key, { used, limit, remaining: Math.max(0, limit - used) }];
    }));
    return res.json({ plan: 'free', date: nowIso().slice(0, 10), usage });
  });
  app.get('/api/vehicles/:id/assets', requireAuth, (req, res) => {
    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id=? AND tenant_id=?').get(req.params.id, req.user.tenantId);
    if (!vehicle) return res.status(404).json({ error: 'not_found' });
    const sql = 'SELECT a.id,a.file_id,a.original_file_id,a.asset_role,a.sort_order,a.processing_status,a.created_at,f.mime_type,f.size_bytes FROM vehicle_assets a JOIN files f ON f.id=a.file_id WHERE a.vehicle_id=? AND a.tenant_id=? ORDER BY a.sort_order,a.created_at';
    const assets = db.prepare(sql).all(vehicle.id, req.user.tenantId);
    return res.json({ assets: assets.map(a => ({ ...a, url: '/api/files/' + a.file_id })) });
  });
  app.post('/api/vehicles/:id/assets', requireAuth, (req, res) => {
    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id=? AND tenant_id=?').get(req.params.id, req.user.tenantId);
    if (!vehicle) return res.status(404).json({ error: 'not_found' });
    try {
      const stored = storeImageDataUrl(req.body?.imageBase64, { tenantId: req.user.tenantId, userId: req.user.id });
      const id = randomUUID();
      const order = db.prepare('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM vehicle_assets WHERE vehicle_id=? AND tenant_id=?').get(vehicle.id, req.user.tenantId).n;
      const role = req.body?.role === 'cover' ? 'cover' : 'gallery';
      db.prepare('INSERT INTO vehicle_assets(id,tenant_id,vehicle_id,file_id,asset_role,sort_order,created_by,created_at) VALUES(?,?,?,?,?,?,?,?)')
        .run(id, req.user.tenantId, vehicle.id, stored.id, role, order, req.user.id, nowIso());
      audit({ tenantId: req.user.tenantId, actorUserId: req.user.id, eventType: 'vehicle.asset_added', resourceType: 'vehicle', resourceId: vehicle.id, details: { assetId: id } });
      return res.status(201).json({ asset: { id, file_id: stored.id, url: '/api/files/' + stored.id, asset_role: role, sort_order: order } });
    } catch (error) { return res.status(400).json({ error: error.code || 'asset_upload_failed', message: error.message }); }
  });
  app.delete('/api/vehicles/:vehicleId/assets/:assetId', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM vehicle_assets WHERE id=? AND vehicle_id=? AND tenant_id=?').run(req.params.assetId, req.params.vehicleId, req.user.tenantId);
    return result.changes ? res.status(204).end() : res.status(404).json({ error: 'not_found' });
  });


  app.post('/api/vehicles/:id/photo-batch', requireAuth, (req,res) => {
    const vehicle=db.prepare('SELECT id FROM vehicles WHERE id=? AND tenant_id=?').get(req.params.id,req.user.tenantId);
    if(!vehicle)return res.status(404).json({error:'not_found'});
    const assetIds=Array.isArray(req.body?.assetIds)?[...new Set(req.body.assetIds)].slice(0,20):[];
    if(!assetIds.length)return res.status(400).json({error:'assets_required'});
    const placeholders=assetIds.map(()=>'?').join(',');
    const assets=db.prepare('SELECT id,file_id,sort_order FROM vehicle_assets WHERE tenant_id=? AND vehicle_id=? AND id IN ('+placeholders+') AND asset_role IN (\'gallery\',\'cover\') ORDER BY sort_order').all(req.user.tenantId,vehicle.id,...assetIds);
    if(assets.length!==assetIds.length)return res.status(400).json({error:'invalid_assets'});
    const runId=randomUUID(),now=nowIso();
    const tx=db.transaction(()=>{
      db.prepare("INSERT INTO photo_batch_runs(id,tenant_id,vehicle_id,user_id,status,total_items,created_at,updated_at) VALUES(?,?,?,?,'queued',?,?,?)").run(runId,req.user.tenantId,vehicle.id,req.user.id,assets.length,now,now);
      for(const asset of assets)db.prepare("INSERT INTO photo_batch_items(id,run_id,tenant_id,source_asset_id,source_file_id,status,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,'queued',?,?,?)").run(randomUUID(),runId,req.user.tenantId,asset.id,asset.file_id,asset.sort_order,now,now);
    });
    tx();
    setImmediate(()=>executePhotoBatch(runId,req.user.tenantId,req.user.id,vehicle.id).catch(()=>{}));
    return res.status(202).json({runId,status:'queued',totalItems:assets.length,sequence:'optimize-webp'});
  });
  app.get('/api/photo-batches/:id', requireAuth, (req,res) => {
    const run=db.prepare('SELECT * FROM photo_batch_runs WHERE id=? AND tenant_id=? AND user_id=?').get(req.params.id,req.user.tenantId,req.user.id);
    if(!run)return res.status(404).json({error:'not_found'});
    const items=db.prepare('SELECT id,source_asset_id,source_file_id,output_file_id,status,error_message,sort_order FROM photo_batch_items WHERE run_id=? ORDER BY sort_order').all(run.id);
    return res.json({run,items});
  });

  app.post('/api/vehicles/:id/showroom-publish', requireAuth, (req,res) => {
    if (!['owner','admin'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
    const result=db.prepare("UPDATE vehicles SET status='published',updated_at=? WHERE id=? AND tenant_id=?").run(nowIso(),req.params.id,req.user.tenantId);
    if(!result.changes) return res.status(404).json({error:'not_found'});
    audit({tenantId:req.user.tenantId,actorUserId:req.user.id,eventType:'vehicle.showroom_published',resourceType:'vehicle',resourceId:req.params.id});
    return res.json({ok:true,status:'published'});
  });
  app.post('/api/vehicles/:id/showroom-hide', requireAuth, (req,res) => {
    if (!['owner','admin'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
    const result=db.prepare("UPDATE vehicles SET status='draft',updated_at=? WHERE id=? AND tenant_id=?").run(nowIso(),req.params.id,req.user.tenantId);
    if(!result.changes) return res.status(404).json({error:'not_found'});
    audit({tenantId:req.user.tenantId,actorUserId:req.user.id,eventType:'vehicle.showroom_hidden',resourceType:'vehicle',resourceId:req.params.id});
    return res.json({ok:true,status:'draft'});
  });

  app.get('/api/public/showroom/:slug', (req, res) => {
    const tenant = db.prepare('SELECT id,name,slug FROM tenants WHERE slug=?').get(req.params.slug);
    if (!tenant) return res.status(404).json({ error: 'not_found' });
    const vehicles = db.prepare("SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status FROM vehicles WHERE tenant_id=? AND status='published' ORDER BY created_at DESC LIMIT 100").all(tenant.id);
    return res.json({ showroom: { name: tenant.name, slug: tenant.slug }, vehicles });
  });
  app.post('/api/public/chat/:slug', rateLimit({ windowMs: 60000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false }), (req, res) => {
    const tenant = db.prepare('SELECT id,name,slug FROM tenants WHERE slug=?').get(req.params.slug);
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!tenant || !message || message.length > 1500) return res.status(400).json({ error: 'invalid_chat' });
    const conversationId = typeof req.body?.conversationId === 'string' ? req.body.conversationId : randomUUID();
    const conversation = db.prepare('SELECT id FROM conversations WHERE id=? AND tenant_id=?').get(conversationId, tenant.id);
    if (!conversation) db.prepare("INSERT INTO conversations(id,tenant_id,channel,status,created_at,updated_at) VALUES(?,?, 'web','open',?,?)").run(conversationId, tenant.id, nowIso(), nowIso());
    db.prepare("INSERT INTO conversation_messages(id,conversation_id,sender_type,body,created_at) VALUES(?,?, 'visitor',?,?)").run(randomUUID(), conversationId, message, nowIso());
    const lower = message.toLowerCase();
    let reply = 'أهلاً بك في ' + tenant.name + '. وصلت رسالتك، وسيقوم فريق المعرض بمتابعتها. اترك رقم التواصل واسم السيارة المطلوبة إن رغبت.';
    if (/سعر|كم|price/.test(lower)) reply = 'يسعدنا مساعدتك بالسعر. اذكر السيارة التي تستفسر عنها وسنرتب لك التواصل مع فريق المعرض.';
    else if (/موقع|وين|عنوان|location/.test(lower)) reply = 'يمكن لفريق المعرض مشاركة موقعه معك. اكتب اسم السيارة أو استفسارك ليتم توجيه الرسالة.';
    else if (/دوام|متى|زيارة|وقت/.test(lower)) reply = 'أرسل لنا الوقت المناسب للزيارة وسيراجع فريق المعرض طلبك.';
    db.prepare("INSERT INTO conversation_messages(id,conversation_id,sender_type,body,created_at) VALUES(?,?, 'assistant',?,?)").run(randomUUID(), conversationId, reply, nowIso());
    db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').run(nowIso(), conversationId);
    return res.json({ conversationId, reply, channel: 'web', humanFollowUp: true });
  });
  app.get('/api/inbox', requireAuth, (req, res) => {
    if (!['owner', 'admin', 'seller', 'marketer'].includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    const leads = db.prepare('SELECT * FROM leads WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100').all(req.user.tenantId);
    const conversations = db.prepare("SELECT c.*, (SELECT body FROM conversation_messages m WHERE m.conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS last_message FROM conversations c WHERE c.tenant_id=? ORDER BY c.updated_at DESC LIMIT 100").all(req.user.tenantId);
    return res.json({ leads, conversations });
  });
  app.get('/api/admin/overview', requireAuth, (req, res) => {
    if (!['owner', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    const tenantId = req.user.tenantId;
    const count = (sql) => db.prepare(sql).get(tenantId).n;
    const summary = {
      vehicles: count('SELECT COUNT(*) AS n FROM vehicles WHERE tenant_id=?'),
      media: count('SELECT COUNT(*) AS n FROM vehicle_assets WHERE tenant_id=?'),
      jobs: count('SELECT COUNT(*) AS n FROM jobs WHERE tenant_id=?'),
      pendingApprovals: count("SELECT COUNT(*) AS n FROM approvals WHERE tenant_id=? AND status='pending'"),
      leads: count('SELECT COUNT(*) AS n FROM leads WHERE tenant_id=?'),
      conversations: count("SELECT COUNT(*) AS n FROM conversations WHERE tenant_id=? AND status='open'")
    };
    return res.json({ summary, usage: Object.fromEntries(Object.entries(FREE_DAILY_LIMITS).map(([key,limit]) => {
      const used = db.prepare('SELECT used_count FROM daily_usage WHERE tenant_id=? AND user_id=? AND usage_date=? AND action_key=?')
        .get(tenantId, req.user.id, nowIso().slice(0,10), key)?.used_count || 0;
      return [key,{used,limit,remaining:Math.max(0,limit-used)}];
    })) });
  });

  app.post('/api/marketing/map-search', requireAuth, (req, res) => {
    const city = String(req.body?.city || '').trim().slice(0, 100);
    const kind = ['car_dealers', 'car_detailing', 'used_cars', 'service_centers'].includes(req.body?.kind) ? req.body.kind : 'car_dealers';
    if (!city) return res.status(400).json({ error: 'city_required' });
    const terms = { car_dealers: 'معارض سيارات', car_detailing: 'تجهيز وتلميع سيارات', used_cars: 'سيارات مستعملة للبيع', service_centers: 'مراكز خدمة سيارات' };
    const query = encodeURIComponent(terms[kind] + ' ' + city);
    return res.json({ query: terms[kind] + ' ' + city, googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + query, assistant: 'مساعد النمو المحلي', note: 'بحث يفتحه المستخدم في خرائط Google. لا يتم جمع بيانات أشخاص أو إرسال رسائل تلقائياً.' });
  });
}
