/**
 * دوال رياضية نقية لمحرك مشكور — قابلة للاختبار في Node دون DOM.
 * يجب أن تبقى متوافقة مع server/engine/registry.mjs و mshkurImageEngine.ts
 */

/** تحويل منطقة نسبية (0–1) إلى بكسلات داخل حدود الصورة */
export function regionToPixels(region, imageW, imageH) {
  if (!imageW || !imageH || imageW < 1 || imageH < 1) {
    throw new Error('أبعاد الصورة غير صالحة');
  }
  if (!region || typeof region.x !== 'number' || typeof region.y !== 'number') {
    throw new Error('منطقة غير صالحة');
  }
  const x = Math.max(0, Math.min(imageW - 1, Math.round(region.x * imageW)));
  const y = Math.max(0, Math.min(imageH - 1, Math.round(region.y * imageH)));
  const w = Math.max(1, Math.min(imageW - x, Math.round((region.w ?? region.width ?? 0) * imageW)));
  const h = Math.max(1, Math.min(imageH - y, Math.round((region.h ?? region.height ?? 0) * imageH)));
  return { x, y, w, h, left: x, top: y, width: w, height: h };
}

/** تحقق تغطية اللوحة: المنطقة يجب أن تغطي حداً أدنى من البكسلات */
export function plateCoverageOk(regionPx, imageW, imageH, minPixels = 64) {
  const area = regionPx.w * regionPx.h;
  if (area < minPixels) return { ok: false, reason: 'region_too_small' };
  if (regionPx.x < 0 || regionPx.y < 0) return { ok: false, reason: 'out_of_bounds' };
  if (regionPx.x + regionPx.w > imageW || regionPx.y + regionPx.h > imageH) {
    return { ok: false, reason: 'out_of_bounds' };
  }
  return { ok: true, area };
}

/**
 * سياسة العلامة المجانية من قيمة التخزين.
 * null/undefined/'' => مفعّلة افتراضياً
 */
export function resolveWatermarkEnabled(stored) {
  if (stored === null || stored === undefined || stored === '') return true;
  const s = String(stored).toLowerCase();
  return s !== '0' && s !== 'false' && s !== 'off' && s !== 'no';
}

/** موقع صندوق التوقيع السفلي دون تغطية منتصف الصورة */
export function computeWatermarkBox(imageW, imageH, textWidth, fontSize, position = 'bottom-right', paddingRatio = 0.018) {
  if (imageW < 8 || imageH < 8) throw new Error('صورة صغيرة جداً');
  const padding = Math.round(Math.max(10, Math.min(imageW, imageH) * paddingRatio));
  const padX = Math.max(6, Math.round(fontSize * 0.7));
  const padY = Math.max(4, Math.round(fontSize * 0.4));
  const boxW = textWidth + padX * 2;
  const boxH = fontSize + padY * 2;
  const x = position === 'bottom-left' ? padding : imageW - padding - boxW;
  const y = imageH - padding - boxH;
  const midY = imageH * 0.55;
  return {
    x: Math.max(0, Math.min(imageW - boxW, x)),
    y: Math.max(midY, Math.min(imageH - boxH, y)),
    w: boxW,
    h: boxH,
    padding,
  };
}

/** خطوات خط الاستوديو المعتمدة (عقد) */
export const PIPELINE_STEPS = [
  'background-remove',
  'matte-refine',
  'studio-composite',
  'contact-shadow',
  'lighting-enhance',
  'license-plate-blur-region',
];

export function validatePipelineSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return { ok: false, reason: 'empty' };
  const known = new Set(PIPELINE_STEPS);
  for (const s of steps) {
    if (!known.has(s)) return { ok: false, reason: 'unknown_step', step: s };
  }
  if (steps.includes('studio-composite') && !steps.includes('background-remove')) {
    return { ok: false, reason: 'composite_without_cutout' };
  }
  return { ok: true };
}
