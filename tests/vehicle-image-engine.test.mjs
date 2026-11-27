import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAlphaRegion, createBatchPlan, getCenteredSubjectPlacement, getGroundedSubjectPlacement, inspectAlphaPlane, parseImageCommand, reviewVehicleMask } from '../src/vehicleImageEngine.mjs';

test('subject is centered on a standard canvas without distortion or clipping', () => {
  const p=getCenteredSubjectPlacement(1200,800,{x:100,y:200,width:900,height:300});
  assert.equal(p.canvas.width,1600);
  assert.ok(Math.abs(p.destination.x+p.destination.width/2-800)<1e-8);
  assert.ok(Math.abs(p.destination.y+p.destination.height/2-600)<1e-8);
  assert.ok(p.destination.x>=0&&p.destination.y>=0);
  assert.ok(p.destination.x+p.destination.width<=1600);
  assert.ok(p.destination.y+p.destination.height<=1200);
});

test('grounded placement aligns all vehicle subjects to a shared tire baseline',()=>{
  const a=getGroundedSubjectPlacement(1400,900,{x:120,y:180,width:1100,height:430});
  const b=getGroundedSubjectPlacement(900,1200,{x:80,y:300,width:740,height:500});
  assert.equal(a.baseline,b.baseline);
  assert.equal(a.destination.y+a.destination.height,a.baseline);
  assert.equal(b.destination.y+b.destination.height,b.baseline);
  assert.ok(a.destination.x>=0&&b.destination.x>=0);
});

test('slash commands support concise REMOVE/ and KEEP/ aliases',()=>{
  assert.deepEqual(parseImageCommand('REMOVE/ 0.1,0.2,0.3,0.4'),{action:'REMOVE',region:{x:0.1,y:0.2,width:0.3,height:0.4}});
  assert.equal(parseImageCommand('KEEP/ 0,0,1,1').action,'KEEP');
  assert.equal(parseImageCommand('REMOVE/REGION 0.1,0.2,0.3,0.4').action,'REMOVE');
  for(const cmd of ['CENTER/','FIT/','WHITE/','TRANSPARENT/','REVIEW/']) assert.ok(parseImageCommand(cmd).action);
  assert.throws(()=>parseImageCommand('REMOVE EVERYTHING'));
});

test('KEEP and REMOVE edit only the selected alpha region',()=>{
  const alpha=new Uint8Array(100).fill(255);
  applyAlphaRegion(alpha,10,10,parseImageCommand('REMOVE/ 0.2,0.2,0.3,0.3'));
  assert.equal(alpha[22],0); assert.equal(alpha[44],0); assert.equal(alpha[11],255);
  applyAlphaRegion(alpha,10,10,parseImageCommand('KEEP/ 0.3,0.3,0.1,0.1'));
  assert.equal(alpha[33],255);
});

test('alpha review detects empty masks, edge contact and implausible occupancy',()=>{
  const alpha=new Uint8Array(100);
  alpha[23]=255; alpha[57]=255;
  const report=inspectAlphaPlane(alpha,10,10);
  assert.deepEqual(report.bounds,{x:3,y:2,width:5,height:4});
  assert.equal(report.touchesEdge,false);
  assert.equal(reviewVehicleMask(report,10,10).status,'needs-review');
  alpha[0]=255;
  assert.ok(reviewVehicleMask(inspectAlphaPlane(alpha,10,10),10,10).issues.some(x=>x.code==='EDGE_CONTACT'));
  assert.equal(reviewVehicleMask(inspectAlphaPlane(new Uint8Array(100),10,10),10,10).status,'blocked');
});

test('batch plan applies a single output contract to every image',()=>{
  const plan=createBatchPlan([{id:'a'},{id:'b'}],{background:'transparent'});
  assert.equal(plan.length,2);
  assert.deepEqual(plan.map(x=>x.sequence),[1,2]);
  assert.ok(plan.every(x=>x.canvas.width===1600&&x.background==='transparent'&&x.ground===0.86));
  assert.throws(()=>createBatchPlan([]));
});

test('subject bounds extending beyond source are clipped to valid source pixels',()=>{
  const p=getCenteredSubjectPlacement(100,100,{x:80,y:80,width:50,height:50});
  assert.deepEqual(p.source,{x:80,y:80,width:20,height:20});
  assert.ok(p.destination.x>=0&&p.destination.y>=0);
  assert.ok(p.destination.x+p.destination.width<=1600);
  assert.ok(p.destination.y+p.destination.height<=1200);
});
