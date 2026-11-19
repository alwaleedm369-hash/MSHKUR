/**
 * mshkurImageEngine — محرك صور مشكور المحلي (بدون API مدفوع)
 *
 * - إزالة خلفية: @bg0/browser (BiRefNet lite)
 * - خلفية استوديو + ظل ملامس: Canvas 2D
 * - تحسين إضاءة: منحنيات Canvas
 * - طمس لوحة: منطقة يحددها المستخدم
 *
 * كل المعالجة داخل المتصفح.
 */

export type StudioBg = 'white' | 'light-gray' | 'showroom';

export type PipelineOptions = {
  model?: 'lite' | 'base';
  quality?: 'quality' | 'speed';
  studioBg?: StudioBg;
  contactShadow?: boolean;
  enhanceLight?: boolean;
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
        env.backends.onnx.wasm.wasmPaths = '/onnx/';
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

  onProgress('1/4 إزالة الخلفية…');
  let blob = await removeBackgroundOnly(file, {
    model: options.model ?? 'lite',
    quality: options.quality ?? 'quality',
    onProgress,
  });
  steps.push('background-remove');

  onProgress('2/4 خلفية استوديو وظل ملامس…');
  blob = await compositeStudio(blob, {
    studioBg: options.studioBg ?? 'white',
    contactShadow: options.contactShadow !== false,
  });
  steps.push('studio-composite');
  if (options.contactShadow !== false) steps.push('contact-shadow');

  if (options.enhanceLight !== false) {
    onProgress('3/4 تحسين الإضاءة…');
    blob = await enhanceLighting(blob, 0.1);
    steps.push('lighting-enhance');
  }

  if (options.plateRegion) {
    onProgress('4/4 طمس اللوحة…');
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
    onProgress,
  });
  return result.url;
}
