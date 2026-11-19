/**
 * MSHKUR export watermark renderer.
 * Non-destructive: accepts a processed image Blob and returns a new Blob.
 * It never modifies the input and never participates in segmentation/matting.
 */
export type WatermarkSettings = {
  enabled: boolean;
  text?: string;
  secondaryText?: string;
  logoUrl?: string;
  opacity?: number;
  scale?: number;
  marginRatio?: number;
  corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  secondaryColor?: string;
  fontFamily?: string;
};

const defaults: Required<Omit<WatermarkSettings, 'logoUrl'>> = {
  enabled: true,
  text: 'مشكور',
  secondaryText: 'MSHKUR',
  opacity: 0.22,
  scale: 1,
  marginRatio: 0.035,
  corner: 'bottom-right',
  color: '#ffffff',
  secondaryColor: '#ffffff',
  fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
};

function imageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('تعذر تحميل الصورة لإضافة العلامة')); };
    image.src = url;
  });
}

function imageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('تعذر تحميل شعار مشكور'));
    image.src = url;
  });
}

/** Adds a discreet single signature near a corner. Output dimensions remain unchanged. */
export async function renderMshkurWatermark(
  source: Blob,
  settings: WatermarkSettings = defaults,
  output?: { type?: string; quality?: number },
): Promise<Blob> {
  if (settings.enabled === false) return source;
  const s = { ...defaults, ...settings };
  const img = await imageFromBlob(source);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) throw new Error('أبعاد الصورة غير صالحة');

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas غير متاح');
  ctx.drawImage(img, 0, 0, w, h);

  const unit = Math.max(1, Math.min(w, h));
  const scale = Math.max(0.45, Math.min(2.5, s.scale));
  const margin = Math.round(unit * Math.max(0.015, Math.min(0.1, s.marginRatio)));
  const maxWidth = Math.round(unit * 0.24 * scale);
  const logo = s.logoUrl ? await imageFromUrl(s.logoUrl) : null;
  const logoW = logo ? Math.min(maxWidth, unit * 0.18 * scale) : 0;
  const logoH = logo && logoW ? logoW * (logo.height / logo.width) : 0;

  const textSize = Math.max(12, Math.round(unit * 0.027 * scale));
  const secondarySize = Math.max(8, Math.round(textSize * 0.48));
  ctx.save();
  ctx.globalAlpha = Math.max(0.06, Math.min(0.65, s.opacity));
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.direction = 'rtl';
  ctx.font = '600 ' + textSize + 'px ' + s.fontFamily;
  const main = s.text.trim();
  const secondary = s.secondaryText.trim();
  const measured = Math.max(ctx.measureText(main).width, secondary ? ctx.measureText(secondary).width : 0);
  const contentW = Math.min(maxWidth, measured);
  const totalW = Math.max(contentW, logoW) + (logo ? margin * 0.55 : 0);
  const totalH = textSize + (secondary ? secondarySize + margin * 0.15 : 0) + (logo ? logoH : 0);
  let x = margin, y = margin;
  if (s.corner.includes('right')) x = w - margin - totalW;
  if (s.corner.includes('bottom')) y = h - margin - totalH;

  // A tiny translucent backing is deliberately limited to the signature footprint.
  const pad = Math.round(margin * 0.28);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  const bx=x-pad, by=y-pad, bw=totalW+pad*2, bh=totalH+pad*2, radius=Math.max(3,pad);
  ctx.roundRect(bx,by,bw,bh,radius);
  ctx.fill();

  let textX = x + totalW;
  if (logo) {
    const lx = s.corner.includes('right') ? x : x + totalW - logoW;
    const ly = s.corner.includes('bottom') ? y + totalH - logoH : y;
    ctx.drawImage(logo, lx, ly, logoW, logoH);
    textX = s.corner.includes('right') ? x + totalW - logoW - margin*0.35 : x + totalW;
  }
  ctx.fillStyle = s.color;
  ctx.font = '600 ' + textSize + 'px ' + s.fontFamily;
  ctx.textAlign = s.corner.includes('right') ? 'right' : 'left';
  ctx.direction = 'rtl';
  const mainY = s.corner.includes('bottom') ? y + totalH - (secondary ? secondarySize : 0) : y + textSize;
  ctx.fillText(main, textX, mainY, maxWidth);
  if (secondary) {
    ctx.font = '600 ' + secondarySize + 'px Arial, sans-serif';
    ctx.fillStyle = s.secondaryColor;
    ctx.textAlign = s.corner.includes('right') ? 'right' : 'left';
    ctx.direction = 'ltr';
    const subY = s.corner.includes('bottom') ? y + totalH : y + textSize + secondarySize;
    ctx.fillText(secondary, textX, subY, maxWidth);
  }
  ctx.restore();

  const type = output?.type || source.type || 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذر تصدير الصورة بعد العلامة')), type, output?.quality);
  });
}
