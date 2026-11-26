import { ImageFile, ExportOptions } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function convertBlobToFormat(
  sourcePreview: string,
  format: 'png' | 'jpg' | 'webp',
  quality: number,
  targetWidth?: number,
  targetHeight?: number,
  maintainAspectRatio = true
): Promise<Blob> {
  const img = await loadImage(sourcePreview);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  let outW = origW;
  let outH = origH;

  if (targetWidth && targetHeight) {
    if (maintainAspectRatio) {
      const ratio = Math.min(targetWidth / origW, targetHeight / origH);
      outW = Math.round(origW * ratio);
      outH = Math.round(origH * ratio);
    } else {
      outW = targetWidth;
      outH = targetHeight;
    }
  } else if (targetWidth) {
    outW = targetWidth;
    outH = maintainAspectRatio ? Math.round((origH / origW) * targetWidth) : origH;
  } else if (targetHeight) {
    outH = targetHeight;
    outW = maintainAspectRatio ? Math.round((origW / origH) * targetHeight) : origW;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
  }

  ctx.drawImage(img, 0, 0, outW, outH);

  const mime =
    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const normalizedQuality = Math.max(0.1, Math.min(1, quality / 100));

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode exported image'))),
      mime,
      normalizedQuality
    );
  });
}

function buildOutputFilename(
  originalName: string,
  suffix: string,
  format: 'png' | 'jpg' | 'webp',
  options: ExportOptions
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpg' ? 'jpg' : format;
  if (options.namingPattern === 'original') {
    return `${baseName}${suffix === 'original' ? '-original' : ''}.${ext}`;
  }
  if (options.namingPattern === 'timestamp') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${baseName}-${stamp}.${ext}`;
  }
  if (options.namingPattern === 'custom') {
    const prefix = options.customPrefix || 'mshkur-';
    return `${prefix}${baseName}-${suffix}.${ext}`;
  }
  return `${baseName}-${suffix}.${ext}`;
}

export async function exportProcessedImages(
  images: ImageFile[],
  options: ExportOptions
): Promise<number> {
  let exportedCount = 0;

  for (const image of images) {
    const nonOriginal = image.processedBlobs.filter((b) => !b.isOriginal);
    const itemsToExport = options.includeAllVersions
      ? image.processedBlobs.filter((b) => options.includeOriginal || !b.isOriginal)
      : nonOriginal.length > 0
      ? [nonOriginal[nonOriginal.length - 1]]
      : options.includeOriginal
      ? [image.processedBlobs[0]]
      : [];

    for (const item of itemsToExport) {
      if (!item) continue;
      const converted = await convertBlobToFormat(
        item.preview,
        options.format,
        options.quality,
        options.width,
        options.height,
        options.maintainAspectRatio
      );
      const suffix = item.isOriginal ? 'original' : item.toolId;
      const filename = buildOutputFilename(image.name, suffix, options.format, options);
      triggerDownload(converted, filename);
      exportedCount++;
    }
  }

  return exportedCount;
}
