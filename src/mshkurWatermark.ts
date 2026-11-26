/**
 * mshkurWatermark — علامة تسويقية على حافة الصورة فقط
 * لا تدخل في مسار العزل/الإضاءة؛ تُطبَّق عند التصدير المجاني فقط.
 * قابلة للتعطيل من شاشة الإدارة عبر localStorage key.
 */

export const WATERMARK_POLICY_KEY = 'mshkur_free_watermark_enabled';

export type WatermarkOptions = {
  enabled?: boolean;
  text?: string;
  opacity?: number;
  scale?: number;
  position?: 'bottom-right' | 'bottom-left';
  padding?: number;
  mode?: 'signature' | 'subtle-edge';
};

/** سياسة التصدير المجاني: افتراضي مفعّل. الأدمن يوقفها بمفتاح false. */
export function isFreeWatermarkEnabled(): boolean {
  try {
    const v = localStorage.getItem(WATERMARK_POLICY_KEY);
    if (v === null || v === '') return true;
    return v !== '0' && v !== 'false';
  } catch {
    return true;
  }
}

export function setFreeWatermarkEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(WATERMARK_POLICY_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;
    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('تعذر تحميل الصورة للعلامة'));
    };
    if (typeof src === 'string') {
      img.src = src;
    } else {
      objectUrl = URL.createObjectURL(src);
      img.src = objectUrl;
    }
  });
}

function sampleCornerLuminance(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  try {
    const data = ctx.getImageData(
      Math.max(0, Math.floor(x)),
      Math.max(0, Math.floor(y)),
      Math.max(1, Math.floor(w)),
      Math.max(1, Math.floor(h))
    ).data;
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 16) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    return n ? sum / n : 200;
  } catch {
    return 200;
  }
}

/**
 * توقيع هادئ في الركن السفلي — لا يغطي جسم السيارة.
 * يُطبَّق على نسخة مشتقة فقط.
 */
export async function applyFreeWatermark(
  source: Blob | string,
  opts: WatermarkOptions = {}
): Promise<Blob> {
  if (opts.enabled === false) {
    if (typeof source !== 'string') return source;
    const res = await fetch(source);
    return res.blob();
  }

  const img = await loadImage(source);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const scale = opts.scale ?? Math.min(1, Math.max(0.55, W / 1200));
  const padding = opts.padding ?? Math.round(Math.max(10, Math.min(W, H) * 0.018));
  const opacity = opts.opacity ?? 0.72;
  const text = opts.text ?? 'MSHKUR · مشكور';
  const position = opts.position ?? 'bottom-right';

  const fontSize = Math.max(11, Math.round(14 * scale));
  ctx.font = `600 ${fontSize}px system-ui, Tahoma, sans-serif`;
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = fontSize;
  const padX = Math.round(10 * scale);
  const padY = Math.round(6 * scale);
  const boxW = tw + padX * 2;
  const boxH = th + padY * 2;

  const x = position === 'bottom-left' ? padding : W - padding - boxW;
  const y = H - padding - boxH;

  const lum = sampleCornerLuminance(ctx, x, y, boxW, boxH);
  const darkBg = lum > 140;
  const bg = darkBg ? 'rgba(15, 28, 26, 0.42)' : 'rgba(255, 255, 255, 0.55)';
  const fg = darkBg ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 28, 26, 0.88)';

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = bg;
  const r = Math.max(4, Math.round(6 * scale));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + boxW, y, x + boxW, y + boxH, r);
  ctx.arcTo(x + boxW, y + boxH, x, y + boxH, r);
  ctx.arcTo(x, y + boxH, x, y, r);
  ctx.arcTo(x, y, x + boxW, y, r);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + boxH / 2);
  ctx.restore();

  if (opts.mode === 'subtle-edge') {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = darkBg ? '#0f1c1a' : '#ffffff';
    ctx.fillRect(0, H - Math.max(2, Math.round(H * 0.004)), W, Math.max(2, Math.round(H * 0.004)));
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('فشل تصدير العلامة'))),
      'image/png'
    );
  });
}
