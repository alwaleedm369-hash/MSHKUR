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
});

test('vehicle ad skill creates a draft only from supplied facts', async () => {
  const cookie = await register('copy@example.test','معرض الإعلانات');
  const response = await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'vehicle-ad-copy',input:{make:'Toyota',model:'Camry',year:2022,city:'جدة'}})});
  assert.equal(response.status,202);
  const { id } = await response.json();
  let task;
  for(let i=0;i<20;i++){
    await new Promise(resolve=>setTimeout(resolve,20));
    const current=await json('/api/tasks/'+id,{headers:{cookie}});
    task=(await current.json()).task;
    if(task.status==='succeeded'||task.status==='failed') break;
  }
  assert.equal(task.status,'succeeded');
  assert.match(task.output.description,/Toyota Camry/);
  assert.equal(task.output.generatedBy,'deterministic-template');
});

test('image optimizer produces a real WebP derivative', async () => {
  const cookie = await register('image@example.test','معرض الصور');
  const png = await sharp({create:{width:80,height:60,channels:3,background:'#d0d0d0'}}).png().toBuffer();
  const response = await json('/api/tasks',{method:'POST',headers:{cookie},body:JSON.stringify({skillId:'image-optimize',input:{imageBase64:'data:image/png;base64,'+png.toString('base64'),maxWidth:64,quality:75}})});
  assert.equal(response.status,202);
  const {id}=await response.json();
  let task;
  for(let i=0;i<30;i++){
    await new Promise(resolve=>setTimeout(resolve,30));
    task=(await (await json('/api/tasks/'+id,{headers:{cookie}})).json()).task;
    if(task.status==='succeeded'||task.status==='failed') break;
  }
  assert.equal(task.status,'succeeded');
  assert.match(task.output.imageBase64,/^data:image\/webp;base64,/);
  assert.equal(task.output.format,'webp');
});

test('assistant intent planner routes Arabic tasks to an installed local skill', async () => {\n  const cookie=await register('planner@example.test','معرض المساعد');\n  const response=await json('/api/assistant/plan',{method:'POST',headers:{cookie},body:JSON.stringify({request:'جهز إعلان لسيارة كامري'})});\n  const body=await response.json();\n  assert.equal(body.intent.matched,true);\n  assert.equal(body.intent.skillId,'vehicle-ad-copy');\n});\n\ntest('external action approvals are stored pending and never executed automatically', async () => {\n  const cookie=await register('approval@example.test','معرض الموافقات');\n  const response=await json('/api/approvals',{method:'POST',headers:{cookie},body:JSON.stringify({actionType:'publish_listing',payload:{platform:'example',listingId:'draft-1'}})});\n  assert.equal(response.status,201);\n  const {approval}=await response.json();\n  assert.equal(approval.status,'pending');\n  const decision=await json('/api/approvals/'+approval.id+'/decision',{method:'POST',headers:{cookie},body:JSON.stringify({decision:'approved'})});\n  assert.equal(decision.status,200);\n  assert.equal((await decision.json()).approval.execution,'not_connected');\n});\n\ntest('logout revokes the session', async () => {
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
