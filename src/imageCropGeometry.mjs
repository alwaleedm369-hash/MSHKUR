export const MAX_CROP_PIXELS = 40_000_000;

/**
 * Calculate a centered crop rectangle without touching the source image.
 * Coordinates and dimensions are integer source-image pixels.
 */
export function getCenteredCrop(width, height, targetRatio = null) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('أبعاد الصورة غير صالحة.');
  }
  if (width * height > MAX_CROP_PIXELS) {
    throw new RangeError('الصورة كبيرة جداً للقص الآمن في المتصفح. استخدم نسخة أصغر من 40 ميغابكسل.');
  }
  if (targetRatio !== null && (!Number.isFinite(targetRatio) || targetRatio <= 0)) {
    throw new RangeError('نسبة القص غير صالحة.');
  }

  let x = 0;
  let y = 0;
  let cropWidth = width;
  let cropHeight = height;

  if (targetRatio !== null) {
    const sourceRatio = width / height;
    if (sourceRatio > targetRatio) {
      cropWidth = Math.max(1, Math.min(width, Math.round(height * targetRatio)));
      x = Math.floor((width - cropWidth) / 2);
    } else {
      cropHeight = Math.max(1, Math.min(height, Math.round(width / targetRatio)));
      y = Math.floor((height - cropHeight) / 2);
    }
  }

  return { x, y, width: cropWidth, height: cropHeight };
}
