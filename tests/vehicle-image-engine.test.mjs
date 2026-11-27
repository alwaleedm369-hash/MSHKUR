import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAlphaRegion, getCenteredSubjectPlacement, inspectAlphaPlane, parseImageCommand } from '../src/vehicleImageEngine.mjs';

test('subject is centered on a standard canvas without distortion or clipping', () => {
  const p = getCenteredSubjectPlacement(1200, 800, {x:100,y:200,width:900,height:300});
  assert.equal(p.canvas.width,1600);
  assert.ok(Math.abs(p.destination.x + p.destination.width/2 - 800) < 1e-8);
  assert.ok(Math.abs(p.destination.y + p.destination.height/2 - 600) < 1e-8);
  assert.ok(p.destination.x >= 0 && p.destination.y >= 0);
  assert.ok(p.destination.x+p.destination.width <= 1600);
  assert.ok(p.destination.y+p.destination.height <= 1200);
});

test('REMOVE and KEEP region commands parse normalized coordinates', () => {
  assert.deepEqual(parseImageCommand('REMOVE/REGION 0.1,0.2,0.3,0.4'), {action:'REMOVE',region:{x:0.1,y:0.2,width:0.3,height:0.4}});
  assert.equal(parseImageCommand('KEEP/REGION 0,0,1,1').action,'KEEP');
  assert.equal(parseImageCommand('CENTER').action,'CENTER');
  assert.throws(()=>parseImageCommand('REMOVE EVERYTHING'));
});

test('KEEP and REMOVE edit only the selected alpha region', () => {
  const alpha = new Uint8Array(100).fill(255);
  applyAlphaRegion(alpha,10,10,parseImageCommand('REMOVE/REGION 0.2,0.2,0.3,0.3'));
  assert.equal(alpha[2*10+2],0);
  assert.equal(alpha[4*10+4],0);
  assert.equal(alpha[1*10+1],255);
  applyAlphaRegion(alpha,10,10,parseImageCommand('KEEP/REGION 0.3,0.3,0.1,0.1'));
  assert.equal(alpha[3*10+3],255);
});

test('alpha review reports bounds and edge contact for crop-risk detection', () => {
  const alpha=new Uint8Array(100);
  alpha[2*10+3]=255; alpha[5*10+7]=255;
  const report=inspectAlphaPlane(alpha,10,10);
  assert.deepEqual(report.bounds,{x:3,y:2,width:5,height:4});
  assert.equal(report.touchesEdge,false);
  alpha[0]=255;
  assert.equal(inspectAlphaPlane(alpha,10,10).touchesEdge,true);
  assert.equal(inspectAlphaPlane(new Uint8Array(100),10,10).bounds,null);
});
