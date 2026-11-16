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

test.after(async()=>{
  await new Promise(resolve=>server.close(resolve));
  db.close();
  rmSync(temp,{recursive:true,force:true});
});
