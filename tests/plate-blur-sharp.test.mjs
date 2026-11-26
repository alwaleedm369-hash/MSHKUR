import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { regionToPixels, plateCoverageOk } from '../src/mshkurImageMath.mjs';

/** يحاكي منطق الخادم: extract + blur + composite */
async function blurRegionSharp(pngBuffer, regionNorm) {
  const image = sharp(pngBuffer, { failOn: 'error' });
  const meta = await image.metadata();
  const W = meta.width;
  const H = meta.height;
  const px = regionToPixels(regionNorm, W, H);
  const cover = plateCoverageOk(px, W, H, 16);
  if (!cover.ok) throw new Error(cover.reason);
  const oriented = await sharp(pngBuffer).png().toBuffer();
  const blurred = await sharp(oriented)
    .extract({ left: px.left, top: px.top, width: px.width, height: px.height })
    .blur(18)
    .png()
    .toBuffer();
  return sharp(oriented)
    .composite([{ input: blurred, left: px.left, top: px.top }])
    .png()
    .toBuffer();
}

test('plate blur produces same-size PNG and modifies output buffer', async () => {
  const W = 200;
  const H = 100;
  const png = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 40, g: 40, b: 40 } },
  })
    .png()
    .toBuffer();
  const out = await blurRegionSharp(png, { x: 0.6, y: 0.2, w: 0.3, h: 0.5 });
  const meta = await sharp(out).metadata();
  assert.equal(meta.width, W);
  assert.equal(meta.height, H);
  assert.equal(meta.format, 'png');
  assert.ok(out.length > 200);
  assert.notEqual(out.equals(png), true);
});

test('plate blur rejects region that collapses below minimum coverage', async () => {
  const png = await sharp({
    create: { width: 80, height: 60, channels: 3, background: '#336699' },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    () => blurRegionSharp(png, { x: 0.5, y: 0.5, w: 0.001, h: 0.001 }),
    /region_too_small|أبعاد|منطقة/
  );
});

test('plate blur handles edge-touching region without throwing', async () => {
  const png = await sharp({
    create: { width: 160, height: 120, channels: 3, background: '#cccccc' },
  })
    .png()
    .toBuffer();
  const out = await blurRegionSharp(png, { x: 0.85, y: 0.85, w: 0.2, h: 0.2 });
  const meta = await sharp(out).metadata();
  assert.equal(meta.width, 160);
  assert.equal(meta.height, 120);
  assert.equal(meta.format, 'png');
});
