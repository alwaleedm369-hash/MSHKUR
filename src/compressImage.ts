/** ضغط صورة على الجهاز قبل المعالجة — بدون رفع لخادم */
export async function compressImageFile(
  file: File,
  opts: { maxEdge?: number; quality?: number; mime?: string } = {}
): Promise<File> {
  const maxEdge = opts.maxEdge ?? 1600;
  const quality = opts.quality ?? 0.82;
  const mime = opts.mime ?? 'image/jpeg';

  if (!file.type.startsWith('image/')) return file;
  if (file.size < 400_000) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), mime, quality)
  );
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.\w+$/, '') + (mime === 'image/webp' ? '.webp' : '.jpg');
  return new File([blob], name, { type: mime, lastModified: Date.now() });
}
