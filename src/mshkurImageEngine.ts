/**
 * mshkurImageEngine — محرك صور مشكور المحلي (بدون API مدفوع)
 *
 * مسار تجاري محلي:
 * 1) SEGMENT: BG0 / BiRefNet lite
 * 2) MATTE: تنعيم قناع + إزالة هالة لون الخلفية (defringe)
 * 3) SCENE: خلفية استوديو + ظل ملامس
 * 4) LIGHT: تباين/سطوع
 * 5) PLATE: طمس منطقة يدوية (نسبية)
 */

export type StudioBg = 'white' | 'light-gray' | 'showroom';

export type PipelineOptions = {
  model?: 'lite' | 'base';
  quality?: 'quality' | 'speed';
  studioBg?: StudioBg;
  contactShadow?: boolean;
  enhanceLight?: boolean;
  /** تنعيم الحواف وإزالة الهالة — افتراضي مفعّل */
  refineMatte?: boolean;
  plateRegion?: { x: number; y: number; w: number; h: number } | null;
  onProgress?: (msg: string) => void;
};

export type PipelineResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  steps: string[];
};

let bg0Ready: Promise<{ removeBackground: (file: File, opts?: any) => Promise<{ blob: Blob }> }> | null = null;

async function ensureBg0() {
  if (!bg0Ready) {
    bg0Ready = (async () => {
      const [{ removeBackground }, { env }] = await Promise.all([
        import('@bg0/browser'),
        import('@huggingface/transformers'),
      ]);
      try {
        env.backends.onnx.wasm.wasmPaths = `${import.meta.env.BASE_URL}onnx/`;
      } catch {
        /* ignore */
      }
      return { removeBackground };
    })();
  }
  return bg0Ready;
}

function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('فشل تصدير الصورة'))), type, quality);
  });
}

function fillStudio(ctx: CanvasRenderingContext2D, w: number, h: number, bg: StudioBg) {
  if (bg === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  } else if (bg === 'light-gray') {
    ctx.fillStyle = '#e8ecef';
    ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f4f6f8');
    g.addColorStop(0.55, '#e9eef2');
    g.addColorStop(1, '#d5dde3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * تنعيم قناع الألفا + defringe بسيط ضد هالة الخلفية على حواف السيارة.
 */
export async function refineCutoutMatte(blob: Blob): Promise<Blob> {
  const img = await loadImage(blob);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const a = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) a[p] = d[i + 3];

  const smooth = new Uint8ClampedArray(a);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const v = a[p];
      if (v < 8 || v > 247) continue;
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) sum += a[(y + dy) * w + (x + dx)];
      }
      smooth[p] = (sum / 9 + 0.5) | 0;
    }
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const alpha = smooth[p];
      if (alpha < 12 || alpha > 250) {
        d[p * 4 + 3] = alpha < 12 ? 0 : 255;
        if (alpha < 12) {
          d[p * 4] = d[p * 4 + 1] = d[p * 4 + 2] = 0;
        }
        continue;
      }
      let fr = 0,
        fg = 0,
        fb = 0,
        fw = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const q = (y + dy) * w + (x + dx);
          const aq = smooth[q];
          if (aq > 200) {
            const o = q * 4;
            fr += d[o];
            fg += d[o + 1];
            fb += d[o + 2];
            fw++;
          }
        }
      }
      const o = p * 4;
      if (fw > 0) {
        const t = alpha / 255;
        d[o] = (d[o] * t + (fr / fw) * (1 - t * 0.35)) | 0;
        d[o + 1] = (d[o + 1] * t + (fg / fw) * (1 - t * 0.35)) | 0;
        d[o + 2] = (d[o + 2] * t + (fb / fw) * (1 - t * 0.35)) | 0;
      }
      let na = alpha;
      if (na < 40) na = (na * na) / 40;
      else if (na > 220) na = 255 - ((255 - na) * (255 - na)) / 35;
      d[o + 3] = na < 0 ? 0 : na > 255 ? 255 : na;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas);
}

export function drawContactShadow(
  ctx: CanvasRenderingContext2D,
  car: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const cx = dx + dw / 2;
  const cy = dy + dh * 0.92;
  const rx = dw * 0.38;
  const ry = Math.max(8, dh * 0.045);
  ctx.save();
  ctx.globalAlpha = 0.28;
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rx);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.scale(1, -0.12);
  ctx.drawImage(car, dx, -(dy + dh * 1.85), dw, dh);
  ctx.restore();
}

export async function enhanceLighting(blob: Blob, amount = 0.12): Promise<Blob> {
  const img = await loadImage(blob);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const contrast = 1 + amount;
  const brightness = amount * 18;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    for (let c = 0; c < 3; c++) {
      let v = d[i + c];
      v = (v - 128) * contrast + 128 + brightness;
      d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas);
}

export async function blurPlateRegion(
  blob: Blob,
  region: { x: number; y: number; w: number; h: number }
): Promise<Blob> {
  const img = await loadImage(blob);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const x = Math.max(0, Math.floor(region.x * W));
  const y = Math.max(0, Math.floor(region.y * H));
  const rw = Math.min(W - x, Math.floor(region.w * W));
  const rh = Math.min(H - y, Math.floor(region.h * H));
  if (rw < 2 || rh < 2) return blob;

  const small = document.createElement('canvas');
  const sw = Math.max(4, Math.floor(rw / 12));
  const sh = Math.max(4, Math.floor(rh / 12));
  small.width = sw;
  small.height = sh;
  const sctx = small.getContext('2d')!;
  sctx.drawImage(canvas, x, y, rw, rh, 0, 0, sw, sh);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, sw, sh, x, y, rw, rh);
  return canvasToBlob(canvas);
}

export async function compositeStudio(
  cutout: Blob,
  opts: { studioBg?: StudioBg; contactShadow?: boolean } = {}
): Promise<Blob> {
  const studioBg = opts.studioBg ?? 'white';
  const contactShadow = opts.contactShadow !== false;
  const img = await loadImage(cutout);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  fillStudio(ctx, w, h, studioBg);
  const scale = 0.92;
  const dw = w * scale;
  const dh = h * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2 + h * 0.02;
  if (contactShadow) drawContactShadow(ctx, img, dx, dy, dw, dh);
  ctx.drawImage(img, dx, dy, dw, dh);
  return canvasToBlob(canvas);
}

export async function removeBackgroundOnly(
  file: File | Blob,
  opts: { model?: 'lite' | 'base'; quality?: 'quality' | 'speed'; onProgress?: (m: string) => void } = {}
): Promise<Blob> {
  opts.onProgress?.('تحميل محرك الإزالة المحلي…');
  const { removeBackground } = await ensureBg0();
  opts.onProgress?.('إزالة الخلفية على جهازك…');
  const result = await removeBackground(file as File, {
    quality: opts.quality ?? 'quality',
    model: opts.model ?? 'lite',
  });
  return result.blob;
}

export async function runCarStudioPipeline(
  file: File,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const steps: string[] = [];
  const onProgress = options.onProgress ?? (() => {});

  onProgress('1/5 إزالة الخلفية…');
  let blob = await removeBackgroundOnly(file, {
    model: options.model ?? 'lite',
    quality: options.quality ?? 'quality',
    onProgress,
  });
  steps.push('background-remove');

  if (options.refineMatte !== false) {
    onProgress('2/5 تنعيم الحواف وإزالة الهالة…');
    blob = await refineCutoutMatte(blob);
    steps.push('matte-refine');
  }

  onProgress('3/5 خلفية استوديو وظل ملامس…');
  blob = await compositeStudio(blob, {
    studioBg: options.studioBg ?? 'white',
    contactShadow: options.contactShadow !== false,
  });
  steps.push('studio-composite');
  if (options.contactShadow !== false) steps.push('contact-shadow');

  if (options.enhanceLight !== false) {
    onProgress('4/5 تحسين الإضاءة…');
    blob = await enhanceLighting(blob, 0.1);
    steps.push('lighting-enhance');
  }

  if (options.plateRegion) {
    onProgress('5/5 طمس اللوحة…');
    blob = await blurPlateRegion(blob, options.plateRegion);
    steps.push('license-plate-blur-region');
  } else {
    onProgress('اكتملت المعالجة');
  }

  const img = await loadImage(blob);
  const url = URL.createObjectURL(blob);
  return { blob, url, width: img.naturalWidth, height: img.naturalHeight, steps };
}

export async function processCarAdImage(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  const result = await runCarStudioPipeline(file, {
    studioBg: 'white',
    contactShadow: true,
    enhanceLight: true,
    refineMatte: true,
    onProgress,
  });
  return result.url;
}
