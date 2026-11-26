import { removeBackground as imglyRemoveBackground, Config } from '@imgly/background-removal';

export interface BackgroundRemovalOptions {
  model?: 'fast' | 'high-quality' | 'car-optimized';
  backgroundType?: 'transparent' | 'white' | 'studio' | 'outdoor' | 'custom';
  backgroundValue?: string;
  onProgress?: (key: string, current: number, total: number) => void;
}

export interface BackgroundRemovalResult {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  durationMs: number;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

async function compositeBackground(
  foregroundBlob: Blob,
  backgroundType: BackgroundRemovalOptions['backgroundType'],
  backgroundValue?: string
): Promise<{ blob: Blob; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(foregroundBlob);
  try {
    const fgImg = await loadImageElement(objectUrl);
    const width = fgImg.naturalWidth || fgImg.width;
    const height = fgImg.naturalHeight || fgImg.height;

    if (!backgroundType || backgroundType === 'transparent') {
      return { blob: foregroundBlob, width, height };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    if (backgroundType === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundType === 'studio') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f4f4f6');
      grad.addColorStop(0.75, '#e4e4e7');
      grad.addColorStop(1, '#d4d4d8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundType === 'custom' && backgroundValue) {
      ctx.fillStyle = backgroundValue;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(fgImg, 0, 0, width, height);

    const compositedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode composited PNG'))),
        'image/png',
        1.0
      );
    });

    return { blob: compositedBlob, width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function removeVehicleBackground(
  source: Blob | File,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  const startTime = performance.now();

  const config: Config = {
    model: options.model === 'fast' ? 'isnet_quint8' : 'isnet_fp16',
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: options.onProgress,
  };

  const cutoutBlob = await imglyRemoveBackground(source, config);
  const { blob: finalBlob, width, height } = await compositeBackground(
    cutoutBlob,
    options.backgroundType ?? 'transparent',
    options.backgroundValue
  );
  const previewUrl = await blobToDataUrl(finalBlob);
  const durationMs = Math.round(performance.now() - startTime);

  return {
    blob: finalBlob,
    previewUrl,
    width,
    height,
    durationMs,
  };
}
