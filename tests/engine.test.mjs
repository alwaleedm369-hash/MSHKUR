import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const temp = mkdtempSync(path.join(tmpdir(), 'mshkur-test-'));
process.env.MSHKUR_DB_PATH = path.join(temp, 'test.sqlite');
process.env.MSHKUR_STORAGE_DIR = path.join(temp, 'storage');
process.env.NODE_ENV = 'test';
process.env.APP_BASE_URL = 'http://mshkur.test';
const { createApp } = await import('../server/app.mjs');
const { db } = await import('../server/db.mjs');
const server = createApp({ serveWeb:false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const json = (url, options={}) => fetch(base+url, { ...options, headers:{ 'content-type':'application/json', ...(options.headers||{}) } });
const register = async (email, tenantName) => {
  const response = await json('/api/auth/register',{method:'POST',body:JSON.stringify({name:'Owner Test',email,password:'StrongPassword!123',tenantName})});
  assert.equal(response.status,201);
  return response.headers.get('set-cookie').split(';')[0];
};
const pollTask = async (id,cookie) => {
  let task;
  for(let i=0;i<40;i++){
    await new Promise(resolve=>setTimeout(resolve,25));
    task=(await (await json('/api/tasks/'+id,{headers:{cookie}})).json()).task;
    if(task.status==='succeeded'||task.status==='failed') return task;
  }
  return task;
};

test('state-changing requests reject a foreign browser origin', async () => {
  const response=await json('/api/auth/register',{method:'POST',headers:{origin:'http://evil.test'},body:JSON.stringify({name:'Bad Origin',tenantName:'Bad',email:'origin@example.test',password:'StrongPassword!123'})});
  assert.equal(response.status,403);
});

test('protected endpoints reject anonymous requests', async () => {
  const response = await json('/api/skills');
  assert.equal(response.status,401);
});

test('registration creates an isolated tenant and authenticated session', async () => {
  const cookie = await register('owner-one@example.test','معرض الأول');
  const me = await json('/api/auth/me',{headers:{cookie}});
  assert.equal(me.status,200);
  const body = await me.json();
  assert.equal(body.user.role,'owner');
  assert.equal(body.user.tenantName,'معرض الأول');
});

test('vehicle records are isolated between tenants', async () => {
  const cookieA = await register('owner-a@example.test','معرض ألف');
  const cookieB = await register('owner-b@example.test','معرض باء');
  const created = await json('/api/vehicles',{method:'POST',headers:{cookie:cookieA},body:JSON.stringify({make:'Toyota',model:'Camry',year:2022,price:85000})});
  assert.equal(created.status,201);
  assert.equal((await (await json('/api/vehicles',{headers:{cookie:cookieA}})).json()).vehicles.length,1);
  assert.equal((await (await json('/api/vehicles',{headers:{cookie:cookieB}})).json()).vehicles.length,0);
  const vehicleId=(await created.json()).vehicle.id;
  const updated=await json('/api/vehicles/'+vehicleId,{method:'PUT',headers:{cookie:cookieA},body:JSON.stringify({price:81000})});
  assert.equal(updated.status,200);
  assert.equal((await updated.json()).vehicle.price,81000);
});

test('vehicle ad workflow validates the saved record before drafting copy', async () => {
  const cookie=await register('workflow@example.test','معرض سير العمل');
  const created=await json('/api/vehicles',{method:'POST',headers:{cookie},body:JSON.stringify({make:'Honda',model:'Accord',year:2021,city:'جدة'})});
  assert.equal(created.status,201);
  const vehicleId=(await created.json()).vehicle.id;
  const response=await json('/api/workflows/vehicle-ad-draft/run',{method:'POST',headers:{cookie},body:JSON.stringify({vehicleId})});
  assert.equal(response.status,200);
  const {workflow}=await response.json();
  assert.equal(workflow.status,'succeeded');
  assert.equal(workflow.steps.length,2);
  assert.equal(workflow.steps[0].skill_id,'vehicle-validate');
  assert.equal(workflow.steps[1].skill_id,'vehicle-ad-copy');
  assert.match(workflow.output.adDraft.description,/Honda Accord/);
  assert.ok(workflow.output.validation.missingFields.includes('price'));
});

test('vehicle ad skill creates a draft only from supplied facts', async () => {
  const cookie = await register('copy@example.test','معرض الإعلانات');
  const response = await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'vehicle-ad-copy',input:{make:'Toyota',model:'Camry',year:2022,city:'جدة'}})});
  assert.equal(response.status,202);
  const { id } = await response.json();
  const task=await pollTask(id,cookie);
  assert.equal(task.status,'succeeded');
  assert.match(task.output.description,/Toyota Camry/);
  assert.equal(task.output.generatedBy,'deterministic-template');
});

test('image optimizer stores a real WebP derivative outside SQLite', async () => {
  const cookie = await register('image@example.test','معرض الصور');
  const png = await sharp({create:{width:80,height:60,channels:3,background:'#d0d0d0'}}).png().toBuffer();
  const response = await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'image-optimize',input:{imageBase64:'data:image/png;base64,'+png.toString('base64'),maxWidth:320,quality:75}})});
  assert.equal(response.status,202);
  const {id}=await response.json();
  const task=await pollTask(id,cookie);
  assert.equal(task.status,'succeeded');
  assert.match(task.output.imageFileId,/^[0-9a-f-]{36}$/i);
  assert.equal(task.output.format,'webp');
  const file=await fetch(base+'/api/files/'+task.output.imageFileId,{headers:{cookie}});
  assert.equal(file.status,200);
  assert.equal(file.headers.get('content-type'),'image/webp');
  const otherTenant=await register('other-image@example.test','معرض آخر');
  const denied=await fetch(base+'/api/files/'+task.output.imageFileId,{headers:{cookie:otherTenant}});
  assert.equal(denied.status,404);
});

test('manual plate-region blur creates a tenant-owned PNG derivative', async () => {
  const cookie=await register('blur@example.test','معرض الطمس');
  const png=await sharp({create:{width:120,height:80,channels:3,background:'#777777'}}).png().toBuffer();
  const response=await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'license-plate-blur-region',input:{imageBase64:'data:image/png;base64,'+png.toString('base64'),left:0.2,top:0.55,width:0.5,height:0.25}})});
  assert.equal(response.status,202);
  const {id}=await response.json();
  const task=await pollTask(id,cookie);
  assert.equal(task.status,'succeeded');
  const file=await fetch(base+'/api/files/'+task.output.imageFileId,{headers:{cookie}});
  assert.equal(file.status,200);
  assert.equal(file.headers.get('content-type'),'image/png');
});

test('browser-only background removal cannot be dispatched to the server worker', async () => {
  const cookie=await register('browser-skill@example.test','معرض المتصفح');
  const skills=await (await json('/api/skills',{headers:{cookie}})).json();
  const bg=skills.skills.find(skill=>skill.id==='background-remove');
  assert.equal(bg.available,true);
  assert.equal(bg.runtime,'browser');
  const response=await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'background-remove',input:{}})});
  assert.equal(response.status,400);
  assert.equal((await response.json()).error,'skill_requires_browser_runtime');
});

test('assistant intent planner routes Arabic tasks to an installed local skill', async () => {
  const cookie=await register('planner@example.test','معرض المساعد');
  const response=await json('/api/assistant/plan',{method:'POST',headers:{cookie},body:JSON.stringify({request:'جهز إعلان لسيارة كامري'})});
  const body=await response.json();
  assert.equal(body.intent.matched,true);
  assert.equal(body.intent.skillId,'vehicle-ad-copy');
  const bg=await json('/api/assistant/plan',{method:'POST',headers:{cookie},body:JSON.stringify({request:'أزل الخلفية من الصورة'})});
  assert.equal((await bg.json()).intent.skillId,'background-remove');
});

test('external action approvals are stored pending and never executed automatically', async () => {
  const cookie=await register('approval@example.test','معرض الموافقات');
  const response=await json('/api/approvals',{method:'POST',headers:{cookie},body:JSON.stringify({actionType:'publish_listing',payload:{platform:'example',listingId:'draft-1'}})});
  assert.equal(response.status,201);
  const {approval}=await response.json();
  assert.equal(approval.status,'pending');
  const decision=await json('/api/approvals/'+approval.id+'/decision',{method:'POST',headers:{cookie},body:JSON.stringify({decision:'approved'})});
  assert.equal(decision.status,200);
  assert.equal((await decision.json()).approval.execution,'not_connected');
});

test('local model router rejects public hosted API endpoints', async () => {
  const cookie=await register('public-model@example.test','معرض النموذج المحلي');
  process.env.LOCAL_LLM_BASE_URL='https://api.openai.com';
  const response=await json('/api/assistant/status',{headers:{cookie}});
  const body=await response.json();
  assert.equal(body.model.status,'invalid_configuration');
  assert.equal(body.paidFallback,false);
  delete process.env.LOCAL_LLM_BASE_URL;
});

test('local model endpoint refuses to call a paid fallback when no local model is configured', async () => {
  const cookie=await register('model@example.test','معرض النموذج');
  const response=await json('/api/assistant/chat',{method:'POST',headers:{cookie},body:JSON.stringify({message:'اكتب وصفاً'})});
  assert.equal(response.status,503);
});

test('logout revokes the session', async () => {
  const cookie=await register('logout@example.test','معرض الخروج');
  const out=await json('/api/auth/logout',{method:'POST',headers:{cookie}});
  assert.equal(out.status,200);
  const me=await json('/api/auth/me',{headers:{cookie}});
  assert.equal(me.status,401);
});


test('a vehicle can keep multiple tenant-scoped original photos in its library', async () => {
  const cookie=await register('gallery@example.test','معرض الألبوم');
  const created=await json('/api/vehicles',{method:'POST',headers:{cookie},body:JSON.stringify({make:'Toyota',model:'Land Cruiser'})});
  const vehicleId=(await created.json()).vehicle.id;
  const png=await sharp({create:{width:48,height:36,channels:3,background:'#aabbcc'}}).png().toBuffer();
  for(let i=0;i<3;i++){
    const uploaded=await json('/api/vehicles/'+vehicleId+'/assets',{method:'POST',headers:{cookie},body:JSON.stringify({imageBase64:'data:image/png;base64,'+png.toString('base64')})});
    assert.equal(uploaded.status,201);
  }
  const gallery=await json('/api/vehicles/'+vehicleId+'/assets',{headers:{cookie}});
  const assets=(await gallery.json()).assets;
  assert.equal(assets.length,3);
  assert.equal(assets[0].mime_type,'image/png');
  const outsider=await register('gallery-outsider@example.test','معرض آخر');
  const denied=await json('/api/vehicles/'+vehicleId+'/assets',{headers:{cookie:outsider}});
  assert.equal(denied.status,404);
});

test('public website chat creates a stored conversation and returns a safe handoff reply', async () => {
  const cookie=await register('webchat@example.test','معرض الدردشة');
  const me=await (await json('/api/auth/me',{headers:{cookie}})).json();
  const response=await json('/api/public/chat/'+me.user.tenantSlug,{method:'POST',body:JSON.stringify({message:'أين موقع المعرض؟',name:'عميل تجريبي',phone:'+966500000000'})});
  assert.equal(response.status,200);
  const result=await response.json();
  assert.equal(result.channel,'web');
  assert.equal(result.humanFollowUp,true);
  assert.match(result.reply,/فريق المعرض/);
  const inbox=await json('/api/inbox',{headers:{cookie}});
  const inboxData=await inbox.json();\n  assert.equal(inboxData.conversations.length,1);\n  assert.equal(inboxData.leads.length,1);
});

test('free daily ad draft quota is enforced and visible to the owner', async () => {
  const cookie=await register('quota@example.test','معرض الحدود');
  for(let i=0;i<10;i++){
    await json('/api/workflows/vehicle-ad-draft/run',{method:'POST',headers:{cookie},body:JSON.stringify({vehicleId:'00000000-0000-4000-8000-000000000000'})});
  }
  const blocked=await json('/api/workflows/vehicle-ad-draft/run',{method:'POST',headers:{cookie},body:JSON.stringify({vehicleId:'00000000-0000-4000-8000-000000000000'})});
  assert.equal(blocked.status,429);
  const usage=await (await json('/api/usage',{headers:{cookie}})).json();
  assert.equal(usage.usage.ad_drafts.used,10);
  assert.equal(usage.usage.ad_drafts.remaining,0);
});


test('vehicle photo batch runs sequentially and keeps originals plus optimized derivatives', async () => {
  const cookie=await register('batch@example.test','معرض المعالجة');
  const created=await json('/api/vehicles',{method:'POST',headers:{cookie},body:JSON.stringify({make:'Nissan',model:'Patrol'})});
  const vehicleId=(await created.json()).vehicle.id;
  const png=await sharp({create:{width:96,height:72,channels:3,background:'#b4c0b4'}}).png().toBuffer();
  const assetIds=[];
  for(let i=0;i<2;i++){
    const response=await json('/api/vehicles/'+vehicleId+'/assets',{method:'POST',headers:{cookie},body:JSON.stringify({imageBase64:'data:image/png;base64,'+png.toString('base64')})});
    assetIds.push((await response.json()).asset.id);
  }
  const started=await json('/api/vehicles/'+vehicleId+'/photo-batch',{method:'POST',headers:{cookie},body:JSON.stringify({assetIds})});
  assert.equal(started.status,202);
  const {runId}=await started.json();
  let state;
  for(let i=0;i<100;i++){
    await new Promise(resolve=>setTimeout(resolve,30));
    state=await (await json('/api/photo-batches/'+runId,{headers:{cookie}})).json();
    if(['succeeded','completed_with_errors'].includes(state.run.status))break;
  }
  assert.equal(state.run.status,'succeeded');
  assert.equal(state.run.completed_items,2);
  const gallery=(await (await json('/api/vehicles/'+vehicleId+'/assets',{headers:{cookie}})).json()).assets;
  assert.equal(gallery.filter(a=>a.asset_role==='gallery').length,2);
  assert.equal(gallery.filter(a=>a.asset_role==='derived').length,2);
});


test('individual accounts retain their account type and public showroom slug', async () => {
  const response=await json('/api/auth/register',{method:'POST',body:JSON.stringify({name:'Individual User',tenantName:'مساحتي الفردية',tenantType:'individual',email:'individual@example.test',password:'StrongPassword!123'})});
  assert.equal(response.status,201);
  const body=await response.json();
  assert.equal(body.user.tenantType,'individual');
  assert.ok(body.user.tenantSlug);
  const me=await json('/api/auth/me',{headers:{cookie:response.headers.get('set-cookie').split(';')[0]}});
  assert.equal((await me.json()).user.tenantType,'individual');
});

test('map growth assistant returns a Google Maps search link without sending outreach', async () => {
  const cookie=await register('map-growth@example.test','معرض التسويق');
  const response=await json('/api/marketing/map-search',{method:'POST',headers:{cookie},body:JSON.stringify({city:'جدة',kind:'car_dealers'})});
  assert.equal(response.status,200);
  const result=await response.json();
  assert.match(result.googleMapsUrl,/google\.com\/maps\/search/);
  assert.match(result.note,/لا يتم جمع بيانات أشخاص/);
});

test.after(async()=>{
  await new Promise(resolve=>server.close(resolve));
  db.close();
  rmSync(temp,{recursive:true,force:true});
});
