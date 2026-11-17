export const MAX_CROP_PIXELS = 40_000_000;

function validateSource(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('أبعاد الصورة غير صالحة.');
  }
  if (width * height > MAX_CROP_PIXELS) {
    throw new RangeError('الصورة كبيرة جداً للقص الآمن في المتصفح. استخدم نسخة أصغر من 40 ميغابكسل.');
  }
}

function validateRatio(targetRatio) {
  if (targetRatio !== null && (!Number.isFinite(targetRatio) || targetRatio <= 0)) {
    throw new RangeError('نسبة القص غير صالحة.');
  }
}

/** Calculate a centered crop rectangle in integer source-image pixels. */
export function getCenteredCrop(width, height, targetRatio = null) {
  validateSource(width, height);
  validateRatio(targetRatio);
  let x = 0, y = 0, cropWidth = width, cropHeight = height;
  if (targetRatio !== null) {
    if (width / height > targetRatio) {
      cropWidth = Math.max(1, Math.min(width, Math.round(height * targetRatio)));
      x = Math.floor((width - cropWidth) / 2);
    } else {
      cropHeight = Math.max(1, Math.min(height, Math.round(width / targetRatio)));
      y = Math.floor((height - cropHeight) / 2);
    }
  }
  return { x, y, width: cropWidth, height: cropHeight };
}

/**
 * Convert a drag gesture to a bounded source-pixel crop.
 * Pointer coordinates use the displayed image's pixel coordinate space.
 */
export function getCropFromDrag(width, height, startX, startY, endX, endY, targetRatio = null) {
  validateSource(width, height);
  validateRatio(targetRatio);
  const values = [startX, startY, endX, endY];
  if (!values.every(Number.isFinite)) throw new RangeError('إحداثيات القص غير صالحة.');
  const sx = Math.max(0, Math.min(width, startX));
  const sy = Math.max(0, Math.min(height, startY));
  const ex = Math.max(0, Math.min(width, endX));
  const ey = Math.max(0, Math.min(height, endY));
  const directionX = ex >= sx ? 1 : -1;
  const directionY = ey >= sy ? 1 : -1;
  let cropWidth = Math.abs(ex - sx);
  let cropHeight = Math.abs(ey - sy);

  if (targetRatio !== null && cropWidth > 0 && cropHeight > 0) {
    if (cropWidth / cropHeight > targetRatio) cropWidth = cropHeight * targetRatio;
    else cropHeight = cropWidth / targetRatio;
  }
  cropWidth = Math.max(1, Math.min(cropWidth, directionX > 0 ? width - sx : sx));
  cropHeight = Math.max(1, Math.min(cropHeight, directionY > 0 ? height - sy : sy));
  if (targetRatio !== null) {
    if (cropWidth / cropHeight > targetRatio) cropWidth = cropHeight * targetRatio;
    else cropHeight = cropWidth / targetRatio;
  }
  const left = directionX > 0 ? sx : sx - cropWidth;
  const top = directionY > 0 ? sy : sy - cropHeight;
  const x = Math.max(0, Math.min(width - 1, Math.floor(left)));
  const y = Math.max(0, Math.min(height - 1, Math.floor(top)));
  const right = Math.max(x + 1, Math.min(width, Math.ceil(left + cropWidth)));
  const bottom = Math.max(y + 1, Math.min(height, Math.ceil(top + cropHeight)));
  return { x, y, width: right - x, height: bottom - y };
}
