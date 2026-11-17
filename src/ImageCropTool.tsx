import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { getCenteredCrop, getCropFromDrag, resolveCropRatio } from './imageCropGeometry.mjs';

type Props = { src: string; onExport: (dataUrl: string) => void };
type Ratio = 'free' | 'original' | 'square' | 'landscape' | 'wide';
type Crop = { x:number; y:number; width:number; height:number };
const ratios: { id: Ratio; label: string; value: number | null }[] = [
  { id: 'free', label: 'حر', value: null },
  { id: 'original', label: 'الأصلية', value: null },
  { id: 'square', label: 'مربع 1:1', value: 1 },
  { id: 'landscape', label: 'معرض 4:3', value: 4 / 3 },
  { id: 'wide', label: 'عريض 16:9', value: 16 / 9 },
];

export default function ImageCropTool({ src, onExport }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{x:number;y:number}|null>(null);
  const [ratio, setRatio] = useState<Ratio>('free');
  const [crop, setCrop] = useState<Crop|null>(null);
  const [history, setHistory] = useState<Crop[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [exportedPreview, setExportedPreview] = useState('');
  const [previewMode, setPreviewMode] = useState<'result'|'original'>('result');

  function selectedRatio() {
    return ratios.find(item => item.id === ratio)?.value ?? null;
  }
  function commitCrop(next: Crop) {
    setCrop(next);
    setHistory(previous => [...previous.slice(0, historyIndex + 1), next].slice(-30));
    setHistoryIndex(previous => Math.min(previous + 1, 29));
    setExportedPreview('');
    onExport('');
  }
  function setPreset(next: Ratio) {
    setRatio(next);
    const image = imageRef.current;
    if (!image?.naturalWidth || !image?.naturalHeight) return;
    commitCrop(getCenteredCrop(image.naturalWidth, image.naturalHeight, ratios.find(item => item.id === next)?.value ?? null));
  }
  function undo() {
    if (historyIndex <= 0) return;
    const index = historyIndex - 1;
    setHistoryIndex(index);
    setCrop(history[index]);
    setExportedPreview('');
    onExport('');
  }
  function redo() {
    if (historyIndex >= history.length - 1) return;
    const index = historyIndex + 1;
    setHistoryIndex(index);
    setCrop(history[index]);
    setExportedPreview('');
    onExport('');
  }
  function pointFromEvent(event: PointerEvent<HTMLDivElement>) {
    const image = imageRef.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!image || !bounds.width || !bounds.height) return null;
    return {
      x: Math.max(0, Math.min(image.naturalWidth, (event.clientX - bounds.left) * image.naturalWidth / bounds.width)),
      y: Math.max(0, Math.min(image.naturalHeight, (event.clientY - bounds.top) * image.naturalHeight / bounds.height)),
    };
  }
  function beginCrop(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const point = pointFromEvent(event);
    if (!point || !imageRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = point;
    setCrop({x:point.x,y:point.y,width:1,height:1});
    setExportedPreview('');
    onExport('');
    setDragging(true);
  }
  function moveCrop(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current || !imageRef.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    const image = imageRef.current;
    try {
      setCrop(getCropFromDrag(image.naturalWidth,image.naturalHeight,dragStart.current.x,dragStart.current.y,point.x,point.y,selectedRatio()));
    } catch { /* Keep the last valid selection while dragging. */ }
  }
  function endCrop(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    moveCrop(event);
    const point = pointFromEvent(event);
    const start = dragStart.current;
    const image = imageRef.current;
    if (point && image) {
      try {
        commitCrop(getCropFromDrag(image.naturalWidth,image.naturalHeight,start.x,start.y,point.x,point.y,selectedRatio()));
      } catch { /* Keep the last valid crop. */ }
    }
    dragStart.current = null;
    setDragging(false);
  }
  async function exportCrop() {
    const image = imageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight || !crop) return;
    setBusy(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('تعذر تجهيز مساحة القص في المتصفح.');
      context.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height);
      const output = canvas.toDataURL('image/png');
      setExportedPreview(output);
      setPreviewMode('result');
      onExport(output);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر قص الصورة.');
    } finally {
      setBusy(false);
    }
  }
  const selection = crop && imageRef.current?.naturalWidth ? {
    left: crop.x / imageRef.current.naturalWidth * 100,
    top: crop.y / imageRef.current.naturalHeight * 100,
    width: crop.width / imageRef.current.naturalWidth * 100,
    height: crop.height / imageRef.current.naturalHeight * 100,
  } : null;

  return <section className="crop-tool" aria-label="قص الصورة">
    <div className="crop-tool-heading">
      <div><b>قص وتجهيز المقاس</b><small>اسحب داخل الصورة لتحديد القص. الأصل يبقى كما هو.</small></div>
      <div className="crop-ratios" role="group" aria-label="نسبة القص">
        {ratios.map(item => <button key={item.id} type="button" className={ratio === item.id ? 'is-active' : ''} aria-pressed={ratio === item.id} onClick={() => setPreset(item.id)}>{item.label}</button>)}
      </div>
    </div>
    <div className="crop-history" aria-label="سجل التعديلات">
      <button type="button" className="button-outline" onClick={undo} disabled={historyIndex <= 0 || dragging}>تراجع</button>
      <button type="button" className="button-outline" onClick={redo} disabled={historyIndex < 0 || historyIndex >= history.length - 1 || dragging}>إعادة</button>
      <small>{history.length ? `تعديل ${historyIndex + 1} من ${history.length}` : 'لا توجد تعديلات محفوظة'}</small>
    </div>
    <div className="crop-preview">
      <div className="crop-stage">
        <img ref={imageRef} src={src} alt="معاينة الصورة الأصلية" onLoad={event => {
          const image = event.currentTarget;
          const initial = getCenteredCrop(image.naturalWidth,image.naturalHeight,resolveCropRatio(ratio,image.naturalWidth,image.naturalHeight));
          setCrop(initial);
          setHistory([initial]);
          setHistoryIndex(0);
        }}/>
        <div className="crop-interaction" role="group" aria-label="اسحب لتحديد منطقة القص" onPointerDown={beginCrop} onPointerMove={moveCrop} onPointerUp={endCrop} onPointerCancel={endCrop} style={{cursor:'crosshair'}}>
          {selection && <div className="crop-selection" style={{left:selection.left+'%',top:selection.top+'%',width:selection.width+'%',height:selection.height+'%'}}/>}
        </div>
      </div>
    </div>
    <div className="crop-tool-actions">
      <small>{crop ? `المقاس: ${Math.round(crop.width)} × ${Math.round(crop.height)} بكسل` : 'حدد منطقة القص بالسحب'}</small>
      <button type="button" className="button-outline" disabled={busy || !crop} onClick={exportCrop}>{busy ? 'جارٍ تجهيز النسخة...' : 'إنشاء نسخة بالمقاس المحدد'}</button>
    </div>
    {exportedPreview && <div className="crop-after">
      <div className="crop-after-heading"><b>معاينة قبل / بعد</b><div>
        <button type="button" className={previewMode==='original'?'is-active':''} onClick={()=>setPreviewMode('original')}>قبل</button>
        <button type="button" className={previewMode==='result'?'is-active':''} onClick={()=>setPreviewMode('result')}>بعد</button>
      </div></div>
      <img src={previewMode==='original'?src:exportedPreview} alt={previewMode==='original'?'الصورة الأصلية':'نتيجة القص'}/>
    </div>}
    {error && <p role="alert" className="crop-error">{error}</p>}
  </section>;
}
