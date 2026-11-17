import { useState } from 'react';

type Props = { src: string; onExport: (dataUrl: string) => void };
type Ratio = 'original' | 'square' | 'landscape' | 'wide';

const ratios: { id: Ratio; label: string; value: number | null }[] = [
  { id: 'original', label: 'الأصلية', value: null },
  { id: 'square', label: 'مربع 1:1', value: 1 },
  { id: 'landscape', label: 'معرض 4:3', value: 4 / 3 },
  { id: 'wide', label: 'عريض 16:9', value: 16 / 9 },
];

export default function ImageCropTool({ src, onExport }: Props) {
  const [ratio, setRatio] = useState<Ratio>('original');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function exportCrop() {
    setBusy(true);
    setError('');
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      await image.decode();
      const selected = ratios.find(item => item.id === ratio);
      const targetRatio = selected?.value;
      let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight;
      if (targetRatio) {
        const sourceRatio = sw / sh;
        if (sourceRatio > targetRatio) {
          sw = Math.round(sh * targetRatio);
          sx = Math.round((image.naturalWidth - sw) / 2);
        } else {
          sh = Math.round(sw / targetRatio);
          sy = Math.round((image.naturalHeight - sh) / 2);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('تعذر تجهيز مساحة القص في المتصفح.');
      context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
      onExport(canvas.toDataURL('image/png'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر قص الصورة.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="crop-tool" aria-label="قص الصورة">
    <div className="crop-tool-heading">
      <div><b>قص وتجهيز المقاس</b><small>قص مركزي محلي دون رفع الصورة أو تعديل الأصل.</small></div>
      <div className="crop-ratios" role="group" aria-label="نسبة القص">
        {ratios.map(item => <button key={item.id} type="button" className={ratio === item.id ? 'is-active' : ''} aria-pressed={ratio === item.id} onClick={() => setRatio(item.id)}>{item.label}</button>)}
      </div>
    </div>
    <div className="crop-preview" data-ratio={ratio}><img src={src} alt="معاينة القص"/></div>
    {error && <p role="alert" className="crop-error">{error}</p>}
    <button type="button" className="button-outline" disabled={busy} onClick={exportCrop}>{busy ? 'جارٍ تجهيز النسخة...' : 'إنشاء نسخة بالمقاس المحدد'}</button>
  </section>;
}
