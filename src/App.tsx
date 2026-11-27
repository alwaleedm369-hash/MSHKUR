import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { deletePhotoRecord, loadPhotoRecords, savePhotoRecord } from './photoStorage';
import { getGroundedSubjectPlacement, inspectAlphaPlane, reviewVehicleMask } from './vehicleImageEngine.mjs';
import { runVehicleBatch } from './vehicleBatchPipeline.mjs';
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Camera, CarFront, Check, ChevronDown,
  CircleHelp, Globe2, ImagePlus, Images, Menu, Play, RotateCcw,
  SlidersHorizontal, Sparkles, X
} from 'lucide-react';

type Locale = 'en' | 'ar';
type Screen = 'studio' | 'library' | 'team' | 'settings';
type Photo = { id: string; file: File; url: string; processedBlob?: Blob; processedUrl?: string; processedBackground?: 'white' | 'transparent'; processingState?: 'queued' | 'processing' | 'ready' | 'needs-review' | 'failed'; processingError?: string };

const messages = {
  en: {
    studio: 'Studio', library: 'My work', team: 'Specialists', settings: 'Settings',
    title: 'Perfect Car Photos', subtitle: 'Clean, consistent vehicle images start here.',
    uploadTitle: 'Bring your car photo', uploadHint: 'Choose from your gallery or take a new photo.',
    gallery: 'Choose photo', camera: 'Take photo', formats: 'JPG, PNG or WEBP · Up to 20 MB each',
    remove: 'Remove background', addMore: 'Add photos', original: 'Original image',
    white: 'Pure white', transparent: 'Transparent', output: 'Background',
    ready: 'Ready to edit', selected: 'Selected photos', removePhoto: 'Remove photo',
    engineUnavailable: 'The background-removal service is not connected in this build. Your original photo is safe.',
    noPhotos: 'No photos yet', noPhotosHint: 'Your imported photos and saved results will appear here.',
    libraryTitle: 'Your Recent Projects', libraryHint: 'Photos imported in this session appear here. Nothing is uploaded by this screen.',
    teamTitle: 'Meet Your Specialists', teamHint: 'Specialist workflows are being prepared. They will appear when their skills are tested and connected.',
    creative: 'Creative direction', vehicle: 'Vehicle retouching', quality: 'Image quality', creativeDetail: 'Art direction, references and consistent visual language.', vehicleDetail: 'Vehicle masking, glass edges, wheels and studio backgrounds.', qualityDetail: 'Resolution, lighting balance and export checks.',
    planned: 'In preparation', settingsTitle: 'Manage Studio Preferences', language: 'Language',
    appearance: 'Appearance', light: 'Light', privacy: 'Local-first storage',
    privacyHint: 'Imported photos remain in this browser session. Nothing is uploaded by this screen.',
    menu: 'Open menu', close: 'Close menu', signIn: 'Google sign in',
    signInNote: 'Account sign-in is not connected yet.', save: 'Save photo', share: 'Share',
    removeSelected: 'Remove selected', photoCount: 'photos selected', back: 'Back to studio',
    whiteHint: 'A clean listing-ready background', transparentHint: 'For further design work',
    before: 'Before', after: 'After', preview: 'Photo preview', change: 'Change photo',
    imageError: 'Please choose a valid image file under 20 MB.',
    processing: 'Preparing your photo', processingHint: 'The AI model runs locally in your browser. The first run may take longer.',
    modelLoading: 'Loading the local model…', cutting: 'Separating the vehicle…', compositing: 'Preparing your background…',
    processed: 'Background removed', compare: 'Before & after', dragHint: 'Drag the handle to compare', tutorial: 'A quick studio tour',
    tourSteps: ['Add a car photo from your gallery or camera.', 'The vehicle is separated locally; your original stays untouched.', 'Drag the comparison handle to inspect the edges.', 'Choose a background, then save your finished image.'],
    previous: 'Previous step', next: 'Next step', skipTour: 'Close guide', restartTour: 'Replay guide',
    resultReady: 'Your result is ready', processError: 'Could not process this image. Try another photo or device.',
    downloadResult: 'Download result', reset: 'Start over', processingNote: 'Keep this tab open while the model runs.', batchWarning: 'Some images need visual review before export.'
  },
  ar: {
    studio: 'الاستوديو', library: 'أعمالي', team: 'المتخصصون', settings: 'الإعدادات',
    title: 'صور سيارات احترافية', subtitle: 'ابدأ بصور سيارات نظيفة ومتناسقة.',
    uploadTitle: 'أضف صورة السيارة', uploadHint: 'اختر صورة من المعرض أو التقط صورة جديدة.',
    gallery: 'اختيار صورة', camera: 'التقاط صورة', formats: 'JPG أو PNG أو WEBP · حتى 20 ميجابايت للصورة',
    remove: 'إزالة الخلفية', addMore: 'إضافة صور', original: 'الصورة الأصلية',
    white: 'أبيض ناصع', transparent: 'شفاف', output: 'الخلفية',
    ready: 'جاهز للتحرير', selected: 'الصور المحددة', removePhoto: 'إزالة الصورة',
    engineUnavailable: 'خدمة إزالة الخلفية غير متصلة في هذه النسخة. صورتك الأصلية محفوظة كما هي.',
    noPhotos: 'لا توجد صور بعد', noPhotosHint: 'ستظهر هنا الصور المستوردة والنتائج المحفوظة.',
    libraryTitle: 'أعمالك ومشاريعك الأخيرة', libraryHint: 'تظهر هنا الصور التي استوردتها خلال هذه الجلسة. لا يتم رفع الصور من هذه الشاشة.',
    teamTitle: 'فريقك الإبداعي المتخصص', teamHint: 'نعمل على تجهيز مسارات المتخصصين. ستظهر عند اختبار مهاراتهم وربطها.',
    creative: 'التوجيه الإبداعي', vehicle: 'تحسين صور السيارات', quality: 'جودة الصور', creativeDetail: 'تحديد الاتجاه الفني والمراجع والهوية البصرية.', vehicleDetail: 'عزل السيارة وحواف الزجاج والعجلات وخلفيات الاستوديو.', qualityDetail: 'الدقة وتوازن الإضاءة وفحص ملفات التصدير.',
    planned: 'قيد التجهيز', settingsTitle: 'إدارة تفضيلات الاستوديو', language: 'اللغة',
    appearance: 'المظهر', light: 'فاتح', privacy: 'تخزين محلي أولاً',
    privacyHint: 'تبقى الصور المستوردة في جلسة المتصفح. هذه الشاشة لا ترفع صورك.',
    menu: 'فتح القائمة', close: 'إغلاق القائمة', signIn: 'الدخول عبر Google',
    signInNote: 'تسجيل الدخول غير متصل بعد.', save: 'حفظ الصورة', share: 'مشاركة',
    removeSelected: 'إزالة المحدد', photoCount: 'صور محددة', back: 'العودة للاستوديو',
    whiteHint: 'خلفية نظيفة مناسبة للإعلانات', transparentHint: 'لمتابعة التصميم لاحقاً',
    before: 'قبل', after: 'بعد', preview: 'معاينة الصورة', change: 'تغيير الصورة',
    imageError: 'اختر صورة صالحة لا يتجاوز حجمها 20 ميجابايت.',
    processing: 'جارٍ تجهيز صورتك', processingHint: 'يعمل نموذج الذكاء الاصطناعي محلياً في المتصفح. قد تستغرق المرة الأولى وقتاً أطول.',
    modelLoading: 'تحميل النموذج المحلي…', cutting: 'فصل السيارة عن الخلفية…', compositing: 'تجهيز الخلفية…',
    processed: 'تمت إزالة الخلفية', compare: 'قبل وبعد', dragHint: 'اسحب الفاصل لمقارنة النتيجة', tutorial: 'جولة سريعة في الاستوديو',
    tourSteps: ['أضف صورة السيارة من المعرض أو الكاميرا.', 'يتم فصل السيارة محلياً مع الحفاظ على الصورة الأصلية.', 'اسحب فاصل المقارنة لفحص الحواف.', 'اختر الخلفية ثم احفظ الصورة النهائية.'],
    previous: 'الخطوة السابقة', next: 'الخطوة التالية', skipTour: 'إغلاق الشرح', restartTour: 'إعادة الشرح',
    resultReady: 'النتيجة جاهزة', processError: 'تعذرت معالجة هذه الصورة. جرّب صورة أو جهازاً آخر.',
    downloadResult: 'تنزيل النتيجة', reset: 'البدء من جديد', processingNote: 'اترك هذه الصفحة مفتوحة أثناء عمل النموذج.', batchWarning: 'بعض الصور تحتاج إلى مراجعة بصرية قبل التصدير.', storageError: 'التخزين المحلي غير متاح. يمكنك متابعة العمل خلال هذه الجلسة.'
  },
} as const;

type Key = keyof typeof messages.en;

function CarMark() {
  return <span className="brand-mark"><CarFront size={20} strokeWidth={1.8} /></span>;
}


async function normalizeVehicleOutput(input: Blob, background: 'white' | 'transparent') {
  const bitmap = await createImageBitmap(input);
  try {
    const source = document.createElement('canvas');
    source.width = bitmap.width; source.height = bitmap.height;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) throw new Error('Image inspection is unavailable.');
    sourceContext.drawImage(bitmap, 0, 0);
    const pixels = sourceContext.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const alpha = new Uint8Array(bitmap.width * bitmap.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    const report = inspectAlphaPlane(alpha, bitmap.width, bitmap.height);
    if (!report.bounds) throw new Error('The vehicle mask is empty. Try another image.');
    const placement = getGroundedSubjectPlacement(bitmap.width, bitmap.height, report.bounds);
    const output = document.createElement('canvas');
    output.width = placement.canvas.width; output.height = placement.canvas.height;
    const context = output.getContext('2d');
    if (!context) throw new Error('Canvas export is unavailable.');
    if (background === 'white') { context.fillStyle = '#fff'; context.fillRect(0, 0, output.width, output.height); }
    const s = placement.source, d = placement.destination;
    // A soft contact shadow anchors the tires to the studio floor instead of leaving the car visually airborne.
    context.save();
    context.filter = 'blur(16px)';
    context.fillStyle = 'rgba(18, 24, 32, 0.16)';
    context.beginPath();
    context.ellipse(d.x + d.width / 2, placement.baseline + 9, d.width * 0.36, Math.max(7, d.height * 0.025), 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
    context.drawImage(bitmap, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
    const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed.')), 'image/png'));
    return { blob, review: reviewVehicleMask(report, bitmap.width, bitmap.height) };
  } finally { bitmap.close(); }
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('mshkur.locale') === 'ar' ? 'ar' : 'en');
  const [screen, setScreen] = useState<Screen>('studio');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [background, setBackground] = useState<'white' | 'transparent'>('white');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [processError, setProcessError] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [tourStep, setTourStep] = useState(0);
  const [tourOpen, setTourOpen] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderDragging = useRef(false);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<Photo[]>([]);
  const t = (key: Key) => messages[locale][key];
  const activePhoto = photos.find(photo => photo.id === activeId) ?? photos[0] ?? null;
  const isArabic = locale === 'ar';

  useEffect(() => {
    localStorage.setItem('mshkur.locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [locale, isArabic]);

  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach(photo => {
    URL.revokeObjectURL(photo.url);
    if (photo.processedUrl) URL.revokeObjectURL(photo.processedUrl);
  }), []);
  useEffect(() => {
    let cancelled = false;
    loadPhotoRecords().then(records => {
      if (cancelled || !records.length) return;
      const restored = records.map(record => ({
        id: record.id,
        file: new File([record.original], record.name, { type: record.type, lastModified: record.lastModified }),
        url: URL.createObjectURL(record.original),
        processedBlob: record.processed,
        processedUrl: record.processed ? URL.createObjectURL(record.processed) : undefined,
        processedBackground: record.background,
      }));
      setPhotos(restored);
      setActiveId(restored[0].id);
      if (restored[0].processedUrl) setResultUrl(restored[0].processedUrl);
      if (restored[0].processedBackground) setBackground(restored[0].processedBackground);
    }).catch(error => {
      console.warn('Local photo library could not be restored:', error);
      if (!cancelled) setNotice(t('storageError'));
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!activePhoto || resultUrl || !tourOpen) return;
    const timer = window.setInterval(() => setTourStep(step => (step + 1) % 4), 6500);
    return () => window.clearInterval(timer);
  }, [activePhoto, resultUrl, tourOpen]);

  function importPhotos(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    const valid = incoming.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 20 * 1024 * 1024);
    if (valid.length !== incoming.length) setNotice(t('imageError'));
    if (valid.length) {
      const added = valid.map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
      setPhotos(current => [...current, ...added]);
      added.forEach(photo => savePhotoRecord({ id: photo.id, name: photo.file.name, type: photo.file.type, lastModified: photo.file.lastModified, original: photo.file, updatedAt: Date.now() }).catch(error => {
        console.warn('Could not persist imported photo:', error);
        setNotice(t('storageError'));
      }));
      setActiveId(added[0].id);
      setResultUrl(null);
      setTourStep(0);
      setTourOpen(true);
      setScreen('studio');
      setNotice('');
    }
    event.target.value = '';
  }

  function removePhoto(id: string) {
    const target = photos.find(photo => photo.id === id);
    if (target) { URL.revokeObjectURL(target.url); if (target.processedUrl) URL.revokeObjectURL(target.processedUrl); }
    deletePhotoRecord(id).catch(error => console.warn('Could not delete local photo record:', error));
    const next = photos.filter(photo => photo.id !== id);
    setPhotos(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
      setResultUrl(next[0]?.processedUrl ?? null);
      setBackground(next[0]?.processedBackground ?? 'white');
    }
  }

  async function handleRemoveBackground() {
    if (!photos.length || busy) return;
    const queue = photos.filter(photo => !photo.processedBlob || photo.processedBackground !== background);
    if (!queue.length) { setNotice(isArabic ? 'كل الصور المحددة لديها نتائج بهذه الخلفية.' : 'All selected photos already have results with this background.'); return; }
    setBusy(true); setProcessError(''); setNotice(''); setProcessStatus(t('modelLoading'));
    setPhotos(current => current.map(photo => queue.some(item => item.id === photo.id) ? { ...photo, processingState: 'queued', processingError: undefined } : photo));
    try {
      const [{ removeBackground }, { env }] = await Promise.all([import('@bg0/browser'), import('@huggingface/transformers')]);
      const runtime = env as unknown as { backends?: { onnx?: { wasm?: { wasmPaths?: string } } } };
      if (runtime.backends?.onnx?.wasm) runtime.backends.onnx.wasm.wasmPaths = '/onnx/';
      const batch = await runVehicleBatch(queue, async (photo, index) => {
        setProcessStatus(isArabic ? 'معالجة الصورة ' + (index + 1) + ' من ' + queue.length : 'Processing image ' + (index + 1) + ' of ' + queue.length);
        setPhotos(current => current.map(item => item.id === photo.id ? { ...item, processingState: 'processing' } : item));
        const cutout = await removeBackground(photo.file);
        const normalized = await normalizeVehicleOutput(cutout.blob, background);
        const nextUrl = URL.createObjectURL(normalized.blob);
        setPhotos(current => current.map(item => {
          if (item.id !== photo.id) return item;
          if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
          return { ...item, processedBlob: normalized.blob, processedUrl: nextUrl, processedBackground: background, processingState: normalized.review.status === 'passed' ? 'ready' : 'needs-review' };
        }));
        try { await savePhotoRecord({ id: photo.id, name: photo.file.name, type: photo.file.type, lastModified: photo.file.lastModified, original: photo.file, processed: normalized.blob, background, updatedAt: Date.now() }); }
        catch (storageError) { console.warn('Processed output could not be persisted:', storageError); }
        if (photo.id === activeId) setResultUrl(nextUrl);
        return { blob: normalized.blob, review: normalized.review };
      }, { onProgress: event => setProcessStatus((isArabic ? 'معالجة الصورة ' : 'Processing image ') + (event.index + 1) + (isArabic ? ' من ' : ' of ') + event.total) });
      const failed = batch.results.filter(item => item.status === 'failed').length;
      const review = batch.results.filter(item => item.status === 'needs-review').length;
      setPhotos(current => current.map(photo => { const result = batch.results.find(item => item.id === photo.id); return result ? { ...photo, processingState: result.status, processingError: result.error ?? undefined } : photo; }));
      if (failed) setProcessError(isArabic ? 'تعذرت معالجة ' + failed + ' صورة.' : failed + ' image(s) failed.');
      if (review) setNotice(t('batchWarning'));
      setProcessStatus(isArabic ? 'اكتملت ' + batch.completed + ' من ' + batch.total + ' صور' : 'Completed ' + batch.completed + ' of ' + batch.total + ' images');
      if (activeId && queue.some(photo => photo.id === activeId) && batch.results.some(item => item.id === activeId && item.result)) setTourOpen(false);
    } catch (error) { console.error('Vehicle background removal failed', error); setProcessError(error instanceof Error ? error.message : t('processError')); }
    finally { setBusy(false); }
  }
  function downloadResult() {
    if (!resultUrl || !activePhoto) return;
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = activePhoto.file.name.replace(/\\.[^/.]+$/, '') + (background === 'white' ? '-white-background.png' : '-transparent.png');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function updateSlider(clientX: number) {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }

  function goTo(next: Screen) {
    setScreen(next);
    setMenuOpen(false);
    setNotice('');
  }

  return (
    <div className={`app-shell ${isArabic ? 'rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="topbar">
        <button className="brand" onClick={() => goTo('studio')} aria-label="MSHKUR home">
          <CarMark /><span>mshkur<span className="brand-period">.</span></span>
        </button>
        <div className="top-actions">
          <button className="language-toggle" onClick={() => setLocale(isArabic ? 'en' : 'ar')} aria-label={t('language')}>
            <Globe2 size={17} /><span>{isArabic ? 'English' : 'العربية'}</span>
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-label={t('menu')}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}>
        <nav className="menu-sheet" onClick={event => event.stopPropagation()}>
          <div className="menu-sheet-head"><strong>MSHKUR</strong><button onClick={() => setMenuOpen(false)} aria-label={t('close')}><X size={19}/></button></div>
          {(['studio', 'library', 'team', 'settings'] as Screen[]).map(item =>
            <button key={item} className={`menu-link ${screen === item ? 'active' : ''}`} onClick={() => goTo(item)}>
              <span>{t(item)}</span><ArrowUpRight size={17}/>
            </button>
          )}
          <p className="menu-footnote">{t('privacyHint')}</p>
        </nav>
      </div>}

      <main className="main-content">
        {screen === 'studio' && <>
          <section className="intro-row">
            <div><span className="eyebrow">VEHICLE PHOTO STUDIO</span><h1>{t('title')}</h1><p>{t('subtitle')}</p></div>
            <span className="studio-index">01 / 04</span>
          </section>

          <section className={`workbench ${activePhoto ? 'has-photo' : ''}`}>
            <div className="canvas-column">
              <div className="section-head"><span>{t('preview')}</span><span className="ready-state"><i />{activePhoto ? t('ready') : '01 — START'}</span></div>
              <div className={`photo-canvas ${activePhoto ? 'with-image' : ''} ${resultUrl ? 'comparison-canvas' : ''}`}>
                {activePhoto ? resultUrl ? <div className="comparison-stage" ref={sliderRef} onPointerDown={event => { sliderDragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); updateSlider(event.clientX); }} onPointerMove={event => { if (sliderDragging.current) updateSlider(event.clientX); }} onPointerUp={() => { sliderDragging.current = false; }} onPointerCancel={() => { sliderDragging.current = false; }}>
                  <img src={activePhoto.url} alt={t('original')} className="compare-image compare-original" draggable={false}/>
                  <div className="compare-after-clip" style={{clipPath: `inset(0 ${100-sliderPosition}% 0 0)`}}><img src={resultUrl} alt={t('processed')} className="compare-image" draggable={false}/></div>
                  <div className="compare-divider" style={{left: `${sliderPosition}%`}}><span>↔</span></div>
                  <span className="compare-label compare-before">{t('before')}</span><span className="compare-label compare-after">{t('after')}</span>
                  <input className="compare-range" aria-label={t('dragHint')} onPointerDown={event => event.stopPropagation()} type="range" min="0" max="100" value={sliderPosition} onChange={event => setSliderPosition(Number(event.target.value))}/>
                </div> : <>
                  <img src={activePhoto.url} alt={activePhoto.file.name} className="vehicle-preview" />
                  <div className="image-overlay"><span>{activePhoto.file.name}</span><button onClick={() => removePhoto(activePhoto.id)} aria-label={t('removePhoto')}><X size={16}/></button></div>
                </> : <div className="empty-canvas">
                  <div className="car-outline"><CarFront size={72} strokeWidth={1.1}/></div>
                  <strong>{t('uploadTitle')}</strong><p>{t('uploadHint')}</p>
                  <div className="upload-actions">
                    <button className="button-primary" onClick={() => galleryRef.current?.click()}><ImagePlus size={18}/>{t('gallery')}</button>
                    <button className="button-secondary" onClick={() => cameraRef.current?.click()}><Camera size={18}/>{t('camera')}</button>
                  </div>
                  <small>{t('formats')}</small>
                </div>}
              </div>

              {photos.length > 0 && <div className="photo-strip">
                <div className="strip-label">{t('selected')} <span>{photos.length}</span></div>
                <div className="thumb-list">
                  {photos.map(photo => <button key={photo.id} className={`photo-thumb ${activePhoto?.id === photo.id ? 'selected' : ''}`} onClick={() => { setActiveId(photo.id); setResultUrl(photo.processedUrl ?? null); setBackground(photo.processedBackground ?? 'white'); setProcessStatus(''); }} aria-label={photo.file.name}>
                    <img src={photo.url} alt="" /><span className="thumb-check"><Check size={11}/></span>{photo.processingState && <span className={"thumb-status " + photo.processingState} title={photo.processingError || photo.processingState}>{photo.processingState === "ready" ? "✓" : photo.processingState === "needs-review" ? "!" : photo.processingState === "failed" ? "×" : photo.processingState === "processing" ? "…" : "·"}</span>}
                  </button>)}
                  <button className="add-thumb" onClick={() => galleryRef.current?.click()} aria-label={t('addMore')}><ImagePlus size={19}/></button>
                </div>
              </div>}

              {activePhoto && !resultUrl && <div className="edit-panel">
                <div className="panel-top"><div><span className="eyebrow">{t('output')}</span><strong>{background === 'white' ? t('white') : t('transparent')}</strong></div><span className="panel-icon"><SlidersHorizontal size={18}/></span></div>
                <div className="background-options">
                  <button className={background === 'white' ? 'chosen' : ''} onClick={() => setBackground('white')}><span className="swatch white-swatch"/><span><strong>{t('white')}</strong><small>{t('whiteHint')}</small></span>{background === 'white' && <Check size={17}/>}</button>
                  <button className={background === 'transparent' ? 'chosen' : ''} onClick={() => setBackground('transparent')}><span className="swatch transparent-swatch"/><span><strong>{t('transparent')}</strong><small>{t('transparentHint')}</small></span>{background === 'transparent' && <Check size={17}/>}</button>
                </div>
                <button className="remove-button" disabled={busy} onClick={handleRemoveBackground}>{busy ? <span className="spinner"/> : <Sparkles size={18}/>} {busy ? processStatus : t('remove')}<ArrowUpRight size={17}/></button>
                <p className="processing-note">{t('processingHint')}</p>
                {processError && <div className="notice" role="alert">{processError}</div>}
              </div>}
              {activePhoto && resultUrl && <div className="edit-panel result-panel">
                <div className="panel-top"><div><span className="eyebrow">{t('processed')}</span><strong>{t('resultReady')}</strong></div><span className="panel-icon"><Check size={18}/></span></div>
                <div className="result-actions"><button className="remove-button" onClick={downloadResult}><ArrowDownToLine size={18}/>{t('downloadResult')}</button><button className="button-secondary" onClick={() => {if (activePhoto.processedUrl) URL.revokeObjectURL(activePhoto.processedUrl);setResultUrl(null);setPhotos(current => current.map(photo => photo.id === activePhoto.id ? { ...photo, processedBlob: undefined, processedUrl: undefined, processedBackground: undefined } : photo));deletePhotoRecord(activePhoto.id).then(() => savePhotoRecord({ id: activePhoto.id, name: activePhoto.file.name, type: activePhoto.file.type, lastModified: activePhoto.file.lastModified, original: activePhoto.file, updatedAt: Date.now() })).catch(error => console.warn('Could not reset saved result:', error));setProcessStatus('');}}><RotateCcw size={17}/>{t('reset')}</button></div>
              </div>}
              {activePhoto && !resultUrl && tourOpen && <section className="guided-tour" aria-live="polite">
                <div className="tour-top"><span className="eyebrow">{t('tutorial')}</span><button onClick={() => setTourOpen(false)} aria-label={t('skipTour')}><X size={16}/></button></div>
                <div className="tour-progress">{[0,1,2,3].map(index => <span key={index} className={index===tourStep?'active':''}/>)}</div>
                <p>{(messages[locale].tourSteps as readonly string[])[tourStep]}</p>
                <div className="tour-controls"><button onClick={() => setTourStep(step => (step+3)%4)} aria-label={t('previous')}><ArrowLeft size={16}/></button><span>{tourStep+1} / 4</span><button onClick={() => setTourStep(step => (step+1)%4)} aria-label={t('next')}><ArrowRight size={16}/></button><button className="tour-replay" onClick={() => setTourStep(0)}><Play size={14}/>{t('restartTour')}</button></div>
              </section>}
              {busy && <div className="processing-banner" role="status"><span className="spinner"/><div><strong>{t('processing')}</strong><small>{processStatus || t('processingNote')}</small></div></div>}
              {notice && <div className="notice" role="status"><CircleHelp size={17}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label={t('close')}><X size={15}/></button></div>}
            </div>

            {!activePhoto && <aside className="side-column">
              <div className="side-card">
                <span className="eyebrow">START IN SECONDS</span><h2>{t('uploadTitle')}</h2><p>{t('uploadHint')}</p>
                <button className="side-upload" onClick={() => galleryRef.current?.click()}><Images size={18}/>{t('gallery')}<ArrowUpRight size={16}/></button>
                <button className="side-camera" onClick={() => cameraRef.current?.click()}><Camera size={18}/>{t('camera')}</button>
                <small>{t('formats')}</small>
              </div>
              <div className="side-note"><span className="note-mark"><Check size={16}/></span><div><strong>{t('privacy')}</strong><p>{t('privacyHint')}</p></div></div>
            </aside>}
          </section>
        </>}

        {screen === 'library' && <section className="secondary-screen"><span className="eyebrow">YOUR WORKSPACE</span><h1>{t('libraryTitle')}</h1><p>{t('libraryHint')}</p>
          {photos.length ? <div className="library-grid">{photos.map(photo => <button className="library-item" key={photo.id} onClick={() => {setResultUrl(photo.processedUrl ?? null);setBackground(photo.processedBackground ?? 'white');setActiveId(photo.id);goTo('studio')}}><img src={photo.url} alt={photo.file.name}/><span>{photo.file.name}</span></button>)}</div> : <div className="empty-state"><Images size={32}/><strong>{t('noPhotos')}</strong><p>{t('noPhotosHint')}</p><button className="button-primary" onClick={() => goTo('studio')}>{t('back')}</button></div>}
        </section>}

        {screen === 'team' && <section className="secondary-screen"><span className="eyebrow">SPECIALIST WORKFLOWS</span><h1>{t('teamTitle')}</h1><p>{t('teamHint')}</p>
          <div className="specialist-list">{[{icon:Sparkles,name:t('creative'),detail:t('creativeDetail')},{icon:CarFront,name:t('vehicle'),detail:t('vehicleDetail')},{icon:SlidersHorizontal,name:t('quality'),detail:t('qualityDetail')}].map(({icon:Icon,name,detail})=><article className="specialist-row" key={name}><span className="specialist-icon"><Icon size={21}/></span><div><strong>{name}</strong><p>{detail}</p></div><span className="planned-tag">{t('planned')}</span></article>)}</div>
        </section>}

        {screen === 'settings' && <section className="secondary-screen"><span className="eyebrow">PREFERENCES</span><h1>{t('settingsTitle')}</h1>
          <div className="settings-list"><div className="settings-row"><div><strong>{t('language')}</strong><small>English / العربية</small></div><button className="setting-control" onClick={() => setLocale(isArabic ? 'en' : 'ar')}>{isArabic ? 'العربية' : 'English'} <ChevronDown size={16}/></button></div><div className="settings-row"><div><strong>{t('appearance')}</strong><small>{t('light')}</small></div><span className="light-chip">☼ {t('light')}</span></div><div className="settings-row"><div><strong>{t('privacy')}</strong><small>{t('privacyHint')}</small></div><Check size={18} color="#64806b"/></div></div>
        </section>}
      </main>

      <input ref={galleryRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={importPhotos}/>
      <input ref={cameraRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={importPhotos}/>
    </div>
  );
}
