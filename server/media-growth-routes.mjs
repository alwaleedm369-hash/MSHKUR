import { randomUUID } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { db, nowIso, audit } from './db.mjs';
import { requireAuth } from './auth.mjs';
import { storeImageDataUrl } from './storage.mjs';

const FREE_DAILY_LIMITS = { image_jobs: 20, ad_drafts: 10, assistant_messages: 40 };
export function consumeDailyUsage(tenantId, userId, key) {
  const day = nowIso().slice(0, 10);
  const limit = FREE_DAILY_LIMITS[key] || 20;\n  const result = db.prepare('INSERT INTO daily_usage(id,tenant_id,user_id,usage_date,action_key,used_count) VALUES(?,?,?,?,?,1) ON CONFLICT(tenant_id,user_id,usage_date,action_key) DO UPDATE SET used_count=used_count+1 WHERE used_count < ?').run(randomUUID(),tenantId,userId,day,key,limit);\n  if (!result.changes) throw Object.assign(new Error('وصلت إلى الحد اليومي المجاني لهذه المهمة. حاول غداً.'), { code: 'daily_limit_reached' });
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
  app.post('/api/marketing/map-search', requireAuth, (req, res) => {
    const city = String(req.body?.city || '').trim().slice(0, 100);
    const kind = ['car_dealers', 'car_detailing', 'used_cars', 'service_centers'].includes(req.body?.kind) ? req.body.kind : 'car_dealers';
    if (!city) return res.status(400).json({ error: 'city_required' });
    const terms = { car_dealers: 'معارض سيارات', car_detailing: 'تجهيز وتلميع سيارات', used_cars: 'سيارات مستعملة للبيع', service_centers: 'مراكز خدمة سيارات' };
    const query = encodeURIComponent(terms[kind] + ' ' + city);
    return res.json({ query: terms[kind] + ' ' + city, googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + query, assistant: 'مساعد النمو المحلي', note: 'بحث يفتحه المستخدم في خرائط Google. لا يتم جمع بيانات أشخاص أو إرسال رسائل تلقائياً.' });
  });
}
