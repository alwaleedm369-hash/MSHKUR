/**
 * Free-tier export watermark for MSHKUR.
 * Applies only to a derivative; never mutates the uploaded original.
 * This client-side watermark is branding, not an entitlement/security boundary.
 */
export async function applyFreeWatermark(source: Blob): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(source);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('تعذر تحميل الصورة لإضافة العلامة المائية'));
      img.src = sourceUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('تعذر إنشاء مساحة التصدير');
    ctx.drawImage(image, 0, 0);

    const w = canvas.width, h = canvas.height;
    const scale = Math.max(0.65, Math.min(1.5, Math.min(w, h) / 900));
    const pad = Math.round(18 * scale);
    const fontSize = Math.round(22 * scale);
    const text = 'MSHKUR  ·  مشكور';
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const badgeW = textWidth + pad * 2;
    const badgeH = fontSize + pad;
    const x = w - badgeW - Math.round(24 * scale);
    const y = h - badgeH - Math.round(24 * scale);
    const radius = Math.round(12 * scale);

    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = 'rgba(20, 24, 30, 0.72)';
    ctx.beginPath();
    ctx.roundRect(x, y, badgeW, badgeH, radius);
    ctx.fill();
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);
    ctx.restore();

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('تعذر تصدير العلامة المائية')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
