import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(root, 'src/CarAdWorkflow.tsx'), 'utf8');

test('car-ad workflow composes local background removal and matte refinement', () => {
  assert.match(workflow, /removeBackgroundOnly/);
  assert.match(workflow, /refineCutoutMatte/);
  assert.match(workflow, /model:\s*'lite'/);
});
test('car-ad workflow exposes studio scene, manual plate blur and glass tint', () => {
  assert.match(workflow, /SceneStudio/);
  assert.match(workflow, /blurPlateRegion/);
  assert.match(workflow, /GlassTintTool/);
  assert.match(workflow, /تحديد اللوحة يدوياً/);
});
test('car-ad workflow includes crop and image lighting before ad draft', () => {
  assert.match(workflow, /ImageCropTool/);
  assert.match(workflow, /enhanceLighting/);
  assert.match(workflow, /تجهيز الإعلان/);
});
