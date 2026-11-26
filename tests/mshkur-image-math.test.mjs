import test from 'node:test';
import assert from 'node:assert/strict';
import {
  regionToPixels,
  plateCoverageOk,
  resolveWatermarkEnabled,
  computeWatermarkBox,
  validatePipelineSteps,
  PIPELINE_STEPS,
} from '../src/mshkurImageMath.mjs';

test('regionToPixels clamps reverse and edge regions inside the image', () => {
  assert.deepEqual(regionToPixels({ x: 0.35, y: 0.62, w: 0.3, h: 0.12 }, 1000, 800), {
    x: 350, y: 496, w: 300, h: 96, left: 350, top: 496, width: 300, height: 96,
  });
  const edge = regionToPixels({ x: 0.95, y: 0.95, w: 0.2, h: 0.2 }, 200, 100);
  assert.ok(edge.x + edge.w <= 200);
  assert.ok(edge.y + edge.h <= 100);
  assert.ok(edge.w >= 1 && edge.h >= 1);
});

test('regionToPixels accepts width/height aliases and rejects bad input', () => {
  const r = regionToPixels({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, 500, 400);
  assert.equal(r.w, 100);
  assert.equal(r.h, 80);
  assert.throws(() => regionToPixels({ x: 0, y: 0, w: 1, h: 1 }, 0, 10));
  assert.throws(() => regionToPixels(null, 100, 100));
});

test('plateCoverageOk rejects tiny regions and accepts valid plate boxes', () => {
  const tiny = regionToPixels({ x: 0.5, y: 0.5, w: 0.002, h: 0.002 }, 1000, 800);
  assert.equal(plateCoverageOk(tiny, 1000, 800).ok, false);
  const ok = regionToPixels({ x: 0.3, y: 0.7, w: 0.25, h: 0.1 }, 1200, 900);
  assert.equal(plateCoverageOk(ok, 1200, 900).ok, true);
});

test('watermark policy defaults to enabled and honors explicit off values', () => {
  assert.equal(resolveWatermarkEnabled(null), true);
  assert.equal(resolveWatermarkEnabled(''), true);
  assert.equal(resolveWatermarkEnabled('1'), true);
  assert.equal(resolveWatermarkEnabled('0'), false);
  assert.equal(resolveWatermarkEnabled('false'), false);
  assert.equal(resolveWatermarkEnabled('off'), false);
});

test('watermark box stays on bottom edge and never in image center', () => {
  const box = computeWatermarkBox(1200, 800, 120, 14, 'bottom-right');
  assert.ok(box.y > 800 * 0.55, 'must stay in lower half');
  assert.ok(box.x + box.w <= 1200);
  assert.ok(box.y + box.h <= 800);
  const left = computeWatermarkBox(800, 600, 100, 12, 'bottom-left');
  assert.ok(left.x < 40);
});

test('pipeline step contract rejects composite without cutout', () => {
  assert.equal(validatePipelineSteps(['background-remove', 'matte-refine']).ok, true);
  assert.equal(validatePipelineSteps(['studio-composite']).ok, false);
  assert.equal(validatePipelineSteps(['unknown']).ok, false);
  assert.ok(PIPELINE_STEPS.includes('background-remove'));
});

test('RTL-safe: horizontal drag either direction yields positive width/height via min/max pattern', () => {
  function fromDrag(x0, y0, x1, y1, W, H) {
    const x = Math.min(x0, x1) / W;
    const y = Math.min(y0, y1) / H;
    const w = Math.abs(x1 - x0) / W;
    const h = Math.abs(y1 - y0) / H;
    return regionToPixels({ x, y, w, h }, W, H);
  }
  const a = fromDrag(100, 200, 400, 280, 1000, 800);
  const b = fromDrag(400, 280, 100, 200, 1000, 800);
  assert.deepEqual(a, b);
});
