import test from 'node:test';
import assert from 'node:assert/strict';
import { getCenteredCrop, MAX_CROP_PIXELS } from '../src/imageCropGeometry.mjs';

test('original ratio keeps the complete source image', () => {
  assert.deepEqual(getCenteredCrop(1600, 900), { x: 0, y: 0, width: 1600, height: 900 });
});

test('square crop centers horizontally on a landscape image', () => {
  assert.deepEqual(getCenteredCrop(1600, 900, 1), { x: 350, y: 0, width: 900, height: 900 });
});

test('4:3 crop centers vertically on a portrait image', () => {
  assert.deepEqual(getCenteredCrop(900, 1600, 4 / 3), { x: 0, y: 462, width: 900, height: 675 });
});

test('wide crop stays inside source bounds', () => {
  const crop = getCenteredCrop(1200, 800, 16 / 9);
  assert.deepEqual(crop, { x: 0, y: 62, width: 1200, height: 675 });
  assert.ok(crop.x + crop.width <= 1200);
  assert.ok(crop.y + crop.height <= 800);
});

test('rejects invalid dimensions, ratios and oversized source images', () => {
  assert.throws(() => getCenteredCrop(0, 100), /أبعاد الصورة/);
  assert.throws(() => getCenteredCrop(100, 100, 0), /نسبة القص/);
  assert.throws(() => getCenteredCrop(8000, 6000), /40 ميغابكسل/);
  assert.equal(MAX_CROP_PIXELS, 40_000_000);
});
