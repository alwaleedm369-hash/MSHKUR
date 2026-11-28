import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { deletePhotoRecord, loadPhotoRecords, savePhotoRecord } from './photoStorage';
import { applyAlphaRegion, getCenteredSubjectPlacement, getGroundedSubjectPlacement, inspectAlphaPlane, parseImageCommand, reviewVehicleMask } from './vehicleImageEngine.mjs';
import { runVehicleBatch } from './vehicleBatchPipeline.mjs';
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Camera, CarFront, Check, ChevronDown,
  CircleHelp, Globe2, ImagePlus, Images, Menu, Play, RotateCcw,
  SlidersHorizontal, Sparkles, X
} from 'lucide-react';

type Locale = 'en' | 'ar';
type Screen = 'studio' | 'assistant' | 'library' | 'tasks' | 'profile' | 'settings';
const showcaseImages = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1800&q=88',
];

type Photo = { id: string; file: File; url: string; processedBlob?: Blob; processedUrl?: string; processedBackground?: 'white' | 'transparent'; cutoutBlob?: Blob; processingState?: 'queued' | 'processing' | 'ready' | 'needs-review' | 'failed'; processingError?: string; approved?: boolean };

const messages = {
  en: {
    studio: 'Studio', assistant: 'MSHKUR AI', library: 'My work', tasks: 'Tasks', profile: 'Profile', settings: 'Settings',
    title: 'Perfect Car Photos', subtitle: 'Clean, consistent vehicle images start here.',
    uploadTitle: 'Bring your car photo', uploadHint: 'Choose from your gallery or take a new photo.',
    gallery: 'Choose photo', camera: 'Take photo', formats: 'JPG, PNG or WEBP · Up to 20 MB each',
    remove: 'Remove background', addMore: 'Add photos', original: 'Original image',
    white: 'Pure white', transparent: 'Transparent', output: 'Background',
    ready: 'Ready to edit', selected: 'Selected photos', removePhoto: 'Remove photo',
    engineUnavailable: 'The background-removal service is not connected in this build. Your original photo is safe.',
    storageError: 'Local storage is unavailable. You can continue working in this session.',
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
    downloadResult: 'Download result', reset: 'Start over', processingNote: 'Keep this tab open while the model runs.', batchWarning: 'Some images need visual review before export.', command: 'AIBG commands', commandHint: 'REMOVE/ 0.1,0.2,0.2,0.3', runCommand: 'Apply command', commandNeedsCutout: 'Run background removal first to enable mask commands.', commandApplied: 'Command applied.', approve: 'Approve result', approved: 'Approved for export', approvalRequired: 'Review and approve this image before downloading.'
  },
  ar: {
    studio: 'الاستوديو', assistant: 'مشكور iAI', library: 'أعمالي', tasks: 'المهام', profile: 'شخصيتي', settings: 'الإعدادات',
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
    downloadResult: 'تنزيل النتيجة', reset: 'البدء من جديد', processingNote: 'اترك هذه الصفحة مفتوحة أثناء عمل النموذج.', batchWarning: 'بعض الصور تحتاج إلى مراجعة بصرية قبل التصدير.', command: 'أوامر AIBG', commandHint: 'REMOVE/ 0.1,0.2,0.2,0.3', runCommand: 'تنفيذ الأمر', commandNeedsCutout: 'ابدأ بإزالة الخلفية أولاً لتفعيل أوامر القناع.', commandApplied: 'تم تنفيذ الأمر.', approve: 'اعتماد النتيجة', approved: 'معتمدة للتصدير', approvalRequired: 'راجع الصورة واعتمدها قبل التنزيل.', storageError: 'التخزين المحلي غير متاح. يمكنك متابعة العمل خلال هذه الجلسة.'
  },
} as const;

type Key = Exclude<keyof typeof messages.en, 'tourSteps'>;

function CarMark() {
  return <span className="brand-mark"><CarFront size={20} strokeWidth={1.8} /></span>;
}


async function normalizeVehicleOutput(input: Blob, background: 'white' | 'transparent', composition: 'ground' | 'center' = 'ground') {
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
    const placement = composition === 'center' ? getCenteredSubjectPlacement(bitmap.width, bitmap.height, report.bounds) : getGroundedSubjectPlacement(bitmap.width, bitmap.height, report.bounds);
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
    const tireBaseline = 'baseline' in placement ? placement.baseline : d.y + d.height;
    context.ellipse(d.x + d.width / 2, tireBaseline + 9, d.width * 0.36, Math.max(7, d.height * 0.025), 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
    context.drawImage(bitmap, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
    const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed.')), 'image/png'));
    return { blob, review: reviewVehicleMask(report, bitmap.width, bitmap.height) };
  } finally { bitmap.close(); }
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('mshkur.locale') === 'ar' ? 'ar' : 'en');
  const [screen, setScreen] = useState<Screen>('assistant');
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [profileName, setProfileName] = useState(() => localStorage.getItem('mshkur.profile.name') || 'مساعدي');
  const [workspaceTheme, setWorkspaceTheme] = useState(() => localStorage.getItem('mshkur.workspace.theme') || 'sage');
  const [autoProcessAfterUpload, setAutoProcessAfterUpload] = useState(false);
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
  const [commandText, setCommandText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseMode, setShowcaseMode] = useState<'before' | 'after'>('after');
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
    localStorage.setItem('mshkur.profile.name', profileName);
    localStorage.setItem('mshkur.workspace.theme', workspaceTheme);
  }, [locale, isArabic, profileName, workspaceTheme]);
  }, [locale, isArabic]);

  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => {
    if (!autoProcessAfterUpload || !photos.length || busy) return;
    setAutoProcessAfterUpload(false);
    window.setTimeout(() => { void handleRemoveBackground(); }, 0);
  }, [autoProcessAfterUpload, photos.length, busy]);


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
        cutoutBlob: record.cutout,
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
    if (!incoming.length) { setAutoProcessAfterUpload(false); return; }
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
      if (runtime.backends?.onnx?.wasm) runtime.backends.onnx.wasm.wasmPaths = `${import.meta.env.BASE_URL}onnx/`;
      const batch = await runVehicleBatch(queue, async (photo, index) => {
        setProcessStatus(isArabic ? 'معالجة الصورة ' + (index + 1) + ' من ' + queue.length : 'Processing image ' + (index + 1) + ' of ' + queue.length);
        setPhotos(current => current.map(item => item.id === photo.id ? { ...item, processingState: 'processing' } : item));
        const cutout = await removeBackground(photo.file);
        const normalized = await normalizeVehicleOutput(cutout.blob, background);
        const nextUrl = URL.createObjectURL(normalized.blob);
        setPhotos(current => current.map(item => {
          if (item.id !== photo.id) return item;
          if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
          return { ...item, processedBlob: normalized.blob, processedUrl: nextUrl, processedBackground: background, cutoutBlob: cutout.blob, processingState: normalized.review.status === 'passed' ? 'ready' : 'needs-review', approved: false };
        }));
        try { await savePhotoRecord({ id: photo.id, name: photo.file.name, type: photo.file.type, lastModified: photo.file.lastModified, original: photo.file, processed: normalized.blob, cutout: cutout.blob, background, updatedAt: Date.now() }); }
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
    if (!resultUrl || !activePhoto || !activePhoto.approved) { setNotice(t('approvalRequired')); return; }
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = activePhoto.file.name.replace(/\\.[^/.]+$/, '') + (background === 'white' ? '-white-background.png' : '-transparent.png');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function executeImageCommand() {
    if (!activePhoto) return;
    try {
      const command = parseImageCommand(commandText);
      const targetBackground = command.action === 'WHITE' ? 'white' : command.action === 'TRANSPARENT' ? 'transparent' : background;
      if (command.action === 'WHITE' || command.action === 'TRANSPARENT') setBackground(targetBackground);
      const sourceBlob = activePhoto.cutoutBlob;
      if (!sourceBlob) { setNotice(t('commandNeedsCutout')); return; }
      const bitmap = await createImageBitmap(sourceBlob);
      try {
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const context = canvas.getContext('2d', {willReadFrequently:true});
        if (!context) throw new Error('Image editing is unavailable.');
        context.drawImage(bitmap,0,0);
        const imageData = context.getImageData(0,0,bitmap.width,bitmap.height);
        const alpha = new Uint8Array(bitmap.width*bitmap.height);
        for (let i=0;i<alpha.length;i++) alpha[i]=imageData.data[i*4+3];
        if (command.action === 'REVIEW') {
          const report = reviewVehicleMask(inspectAlphaPlane(alpha,bitmap.width,bitmap.height),bitmap.width,bitmap.height);
          setNotice(report.status + ': ' + (report.issues.map(issue=>issue.message).join(' ') || 'No geometry warnings.')); return;
        }
        if (command.action === 'REMOVE' || command.action === 'KEEP') {
          if (!command.region) throw new Error('A region is required for REMOVE/ and KEEP/.');
          applyAlphaRegion(alpha,bitmap.width,bitmap.height,{action:command.action,region:command.region});
          for (let i=0;i<alpha.length;i++) imageData.data[i*4+3]=alpha[i];
          context.putImageData(imageData,0,0);
        } else if (!['CENTER','FIT','WHITE','TRANSPARENT'].includes(command.action)) throw new Error('Unsupported AIBG command.');
        const edited = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not encode edited mask.')),'image/png'));
        const normalized = await normalizeVehicleOutput(edited,targetBackground,command.action === 'CENTER' ? 'center' : 'ground');
        const url = URL.createObjectURL(normalized.blob);
        if (activePhoto.processedUrl) URL.revokeObjectURL(activePhoto.processedUrl);
        setPhotos(current=>current.map(photo=>photo.id===activePhoto.id?{...photo,cutoutBlob:edited,processedBlob:normalized.blob,processedUrl:url,processedBackground:targetBackground,processingState:normalized.review.status==='passed'?'ready':'needs-review',approved:false}:photo));
        setResultUrl(url);
        await savePhotoRecord({id:activePhoto.id,name:activePhoto.file.name,type:activePhoto.file.type,lastModified:activePhoto.file.lastModified,original:activePhoto.file,processed:normalized.blob,cutout:edited,background:targetBackground,updatedAt:Date.now()});
        setNotice(t('commandApplied'));
      } finally { bitmap.close(); }
    } catch (error) { setNotice(error instanceof Error ? error.message : t('processError')); }
  }

  function updateSlider(clientX: number) {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }

  function runSmartAction(action: 'upload' | 'white' | 'transparent' | 'process' | 'guide') {
    setSmartOpen(false);
    if (action === 'upload') { galleryRef.current?.click(); return; }
    if (action === 'white' || action === 'transparent') { setBackground(action); setNotice(isArabic ? 'تم اختيار الخلفية. أضف صورة أو تابع المعالجة.' : 'Background selected. Add a photo or continue processing.'); return; }
    if (action === 'process') { if (photos.length) { void handleRemoveBackground(); } else { setNotice(isArabic ? 'أضف صورة أولاً لبدء المعالجة.' : 'Add a photo first to start processing.'); galleryRef.current?.click(); } return; }
    setTourOpen(true); setTourStep(0); setNotice(isArabic ? 'بدأ الشرح المرئي خطوة بخطوة.' : 'The visual guide has started.');
  }

  function goTo(next: Screen) {
    setScreen(next);
    setMenuOpen(false);
    setNotice('');
  }

  function submitAssistantPrompt(promptValue = assistantPrompt) {
    const prompt = promptValue.trim();
    if (!prompt) return;
    setAssistantPrompt(prompt);
    setAssistantReply('');
    const wantsLibrary = /أعمالي|المحفوظات|المكتبة|library|my work/i.test(prompt);
    const wantsSettings = /إعدادات|settings/i.test(prompt);
    const wantsUpload = /ارفع|أضف صورة|اضف صورة|تحميل صورة|upload|add photo|choose photo/i.test(prompt);
    const wantsTransparent = /شفاف|شفافة|transparent/i.test(prompt);
    const wantsWhite = /أبيض|بيضاء|white/i.test(prompt);
    const wantsRemove = /إزالة|ازل|أزل|احذف|حذف|قص الخلفية|بدون خلفية|remove background|remove bg|background removal/i.test(prompt);

    if (wantsLibrary) { setAssistantReply(isArabic ? 'فتحت لك أعمالك المحفوظة.' : 'Opening your saved work.'); goTo('library'); return; }
    if (wantsSettings) { setAssistantReply(isArabic ? 'فتحت الإعدادات.' : 'Opening settings.'); goTo('settings'); return; }
    if (wantsUpload) {
      setAssistantReply(isArabic ? 'اختر صورة من جهازك، وستظهر في الاستوديو.' : 'Choose an image from your device. It will open in the studio.');
      goTo('studio'); window.setTimeout(() => galleryRef.current?.click(), 80); return;
    }
    if (wantsWhite || wantsTransparent) {
      const nextBackground = wantsTransparent ? 'transparent' : 'white';
      setBackground(nextBackground);
      if (photos.length) {
        setAssistantReply(isArabic ? 'تم اختيار الخلفية. أبدأ الآن تجهيز الصورة.' : 'Background selected. Preparing your image now.');
        goTo('studio'); window.setTimeout(() => { void handleRemoveBackground(); }, 80);
      } else {
        setAssistantReply(isArabic ? 'اختر صورة وسأبدأ تجهيزها بالخلفية المطلوبة تلقائياً.' : 'Choose an image and I will prepare it with the selected background.');
        setAutoProcessAfterUpload(true); goTo('studio'); window.setTimeout(() => galleryRef.current?.click(), 80);
      }
      return;
    }
    if (wantsRemove) {
      if (photos.length) {
        setAssistantReply(isArabic ? 'بدأت إزالة الخلفية من صورك. يمكنك متابعة التقدم في الاستوديو.' : 'Background removal has started. Follow the progress in the studio.');
        goTo('studio'); window.setTimeout(() => { void handleRemoveBackground(); }, 80);
      } else {
        setAssistantReply(isArabic ? 'اختر صورة أولاً، وسأبدأ إزالة الخلفية تلقائياً بعد إضافتها.' : 'Choose an image first. I will start removing its background automatically after upload.');
        setAutoProcessAfterUpload(true); goTo('studio'); window.setTimeout(() => galleryRef.current?.click(), 80);
      }
      return;
    }
    setAssistantReply(isArabic
      ? 'أستطيع الآن تنفيذ: رفع صورة، إزالة الخلفية، تجهيز خلفية بيضاء أو شفافة، وفتح أعمالك أو الإعدادات. جرّب أحد هذه الطلبات.'
      : 'I can currently: upload a photo, remove its background, prepare a white or transparent background, and open your work or settings. Try one of those requests.');
  }

  return (
    <div className={`app-shell ${isArabic ? 'rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="topbar topbar-minimal">
        <span className="topbar-spacer" aria-hidden="true" />
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
          <div className="menu-sheet-head"><strong>{isArabic ? "استكشف الخدمات" : "Explore services"}</strong><button onClick={() => setMenuOpen(false)} aria-label={t('close')}><X size={19}/></button></div>
          {(['assistant', 'studio', 'tasks', 'library', 'profile', 'settings'] as Screen[]).map(item =>
            <button key={item} className={`menu-link ${screen === item ? 'active' : ''}`} onClick={() => goTo(item)}>
              <span>{t(item as Key)}</span><ArrowUpRight size={17}/>
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
                  <div className="image-overlay"><span>{activePhoto.file.name}</span><button disabled={busy} onClick={() => removePhoto(activePhoto.id)} aria-label={t('removePhoto')}><X size={16}/></button></div>
                </> : <div className="empty-canvas">
                  <div className="car-outline"><CarFront size={72} strokeWidth={1.1}/></div>
                  <strong>{t('uploadTitle')}</strong><p>{t('uploadHint')}</p>
                  <div className="upload-actions">
                    <button className="button-primary" onClick={() => galleryRef.current?.click()}><ImagePlus size={18}/>{t('gallery')}</button>
                    <button className="button-secondary" onClick={() => cameraRef.current?.click()}><Camera size={18}/>{t('camera')}</button>
                  </div>
                  <small>{t('formats')}</small>
                  <div className="visual-inspiration" aria-label={isArabic ? 'أمثلة مرئية للنتائج' : 'Visual result examples'}>
                    <div className="visual-inspiration-title">{isArabic ? 'شاهد ما يمكنك إنجازه' : 'See what you can create'}</div>
                    <div className="visual-inspiration-grid">
                      <figure><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=420&q=80" alt={isArabic ? 'سيارة جاهزة بخلفية نظيفة' : 'Car with a clean studio look'} loading="lazy"/><figcaption>{isArabic ? 'صورة جاهزة للإعلان' : 'Listing-ready photo'}</figcaption></figure>
                      <figure><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=420&q=80" alt={isArabic ? 'تفاصيل سيارة' : 'Vehicle detail'} loading="lazy"/><figcaption>{isArabic ? 'تفاصيل أوضح' : 'Sharper details'}</figcaption></figure>
                      <figure><img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=420&q=80" alt={isArabic ? 'سيارة في مشهد خارجي' : 'Car in an outdoor scene'} loading="lazy"/><figcaption>{isArabic ? 'خلفية موحدة' : 'Consistent background'}</figcaption></figure>
                    </div>
                  </div>
                </div>}
              </div>

              {photos.length > 0 && <div className="photo-strip">
                <div className="strip-label">{t('selected')} <span>{photos.length}</span></div>
                <div className="thumb-list">
                  {photos.map(photo => <button key={photo.id} className={`photo-thumb ${activePhoto?.id === photo.id ? 'selected' : ''}`} disabled={busy} onClick={() => { setActiveId(photo.id); setResultUrl(photo.processedUrl ?? null); setBackground(photo.processedBackground ?? 'white'); setProcessStatus(''); }} aria-label={photo.file.name}>
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
                <div className="aibg-command-panel">
                  <label className="eyebrow" htmlFor="aibg-command">{t('command')}</label>
                  <div className="aibg-command-row">
                    <input id="aibg-command" value={commandText} onChange={event => setCommandText(event.target.value)} placeholder={t('commandHint')} />
                    <button className="button-secondary" onClick={executeImageCommand} disabled={busy || !commandText.trim()}>{t('runCommand')}</button>
                  </div>
                </div>
                <div className="result-actions"><button className="button-secondary" onClick={() => setPhotos(current => current.map(photo => photo.id === activePhoto.id ? { ...photo, approved: true } : photo))} disabled={!!activePhoto.approved}><Check size={17}/>{activePhoto.approved ? t('approved') : t('approve')}</button><button className="remove-button" onClick={downloadResult} disabled={!activePhoto.approved}><ArrowDownToLine size={18}/>{t('downloadResult')}</button><button className="button-secondary" onClick={() => {if (activePhoto.processedUrl) URL.revokeObjectURL(activePhoto.processedUrl);setResultUrl(null);setPhotos(current => current.map(photo => photo.id === activePhoto.id ? { ...photo, processedBlob: undefined, processedUrl: undefined, processedBackground: undefined, cutoutBlob: undefined, approved: false } : photo));deletePhotoRecord(activePhoto.id).then(() => savePhotoRecord({ id: activePhoto.id, name: activePhoto.file.name, type: activePhoto.file.type, lastModified: activePhoto.file.lastModified, original: activePhoto.file, updatedAt: Date.now() })).catch(error => console.warn('Could not reset saved result:', error));setProcessStatus('');}}><RotateCcw size={17}/>{t('reset')}</button></div>
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

        {screen === 'assistant' && <section className="visual-first-home" aria-label={isArabic ? 'الواجهة الرئيسية' : 'Home'}>
          <div className="visual-first-stage">
            <img className="visual-first-image" src={showcaseImages[showcaseIndex]} alt={isArabic ? 'صورة سيارة نموذجية للعرض' : 'Sample vehicle image'} />
            <div className="visual-first-shade" />
            <div className="visual-first-topline">
              <span className="visual-first-sample">{isArabic ? 'عينة توضيحية' : 'SAMPLE PREVIEW'}</span>
              <button type="button" className="visual-first-more" onClick={() => setMenuOpen(true)}>{isArabic ? 'تفاصيل أكثر' : 'Explore'} <ArrowUpRight size={15}/></button>
            </div>
            <div className="visual-first-copy">
              <h1>{isArabic ? 'حوّل صور سيارتك إلى صور احترافية تجيب سعر أفضل' : 'Turn your car photos into professional images that help you get a better price'}</h1>
              <p>{isArabic ? 'ابدأ بصورة واحدة، وشاهد كيف يمكن تجهيزها للإعلان.' : 'Start with one photo and prepare it for your listing.'}</p>
            </div>
            <div className="visual-first-controls">
              <div className="visual-first-compare" role="group" aria-label={isArabic ? 'وضع المعاينة' : 'Preview mode'}>
                <button type="button" className={showcaseMode === 'before' ? 'active' : ''} onClick={() => setShowcaseMode('before')}>{isArabic ? 'قبل' : 'Before'}</button>
                <button type="button" className={showcaseMode === 'after' ? 'active' : ''} onClick={() => setShowcaseMode('after')}>{isArabic ? 'بعد' : 'After'}</button>
              </div>
              <button type="button" className="visual-first-upload" onClick={() => runSmartAction('upload')}><ImagePlus size={19}/><Camera size={17}/><span>{isArabic ? 'أضف صورة' : 'Add photo'}</span></button>
            </div>
            <div className="visual-first-thumbs">
              {showcaseImages.map((src,index)=><button type="button" key={src} className={showcaseIndex===index?'active':''} onClick={()=>setShowcaseIndex(index)} aria-label={isArabic ? 'عرض عينة سيارة' : 'Show car sample'}><img src={src} alt="" loading="lazy"/></button>)}
            </div>
            <span className="visual-first-disclaimer">{isArabic ? 'الصور أمثلة للعرض فقط؛ جرّب صورتك لرؤية المعالجة الفعلية.' : 'Sample imagery only. Upload your photo to see actual processing.'}</span>
          </div>
          <div className="visual-first-actions">
            <button type="button" className="visual-first-register" onClick={() => { goTo('profile'); setNotice(isArabic ? 'إعداد الملف متاح محلياً؛ ربط التسجيل بالحساب ما زال ضمن العمل.' : 'Local profile setup is available; account registration is not connected yet.'); }}>{isArabic ? 'تسجيل' : 'Sign up'}</button>
            <button type="button" className="visual-first-details" onClick={() => setMenuOpen(true)}>{isArabic ? 'تفاصيل أكثر والخدمات' : 'More details & services'} <ArrowLeft size={16}/></button>
          </div>
        </section>}

        {screen === 'tasks' && <section className="secondary-screen workspace-tasks">
          <span className="eyebrow">MSHKUR WORKSPACE</span>
          <h1>{isArabic ? 'مساحة المهام' : 'Your tasks'}</h1>
          <p>{isArabic ? 'تابع الصور التي تعمل عليها وحالة كل نتيجة. لا نعرض مهمة على أنها تعمل ما لم تبدأ فعلياً.' : 'Track your image work and each result. A task is only shown as running when processing has actually started.'}</p>
          <div className="task-summary-grid">
            <article><span>{photos.length}</span><small>{isArabic ? 'صور في مساحة العمل' : 'Photos in workspace'}</small></article>
            <article><span>{photos.filter(photo => photo.processingState === 'ready').length}</span><small>{isArabic ? 'نتائج جاهزة' : 'Ready results'}</small></article>
            <article><span>{photos.filter(photo => photo.processingState === 'needs-review').length}</span><small>{isArabic ? 'تحتاج مراجعة' : 'Need review'}</small></article>
          </div>
          <div className="task-list">{photos.length ? photos.map(photo => <article className="task-row" key={photo.id}>
            <img src={photo.processedUrl || photo.url} alt={photo.file.name}/>
            <div className="task-row-copy"><strong>{photo.file.name}</strong><small>{photo.processingState === 'processing' ? (isArabic ? 'قيد المعالجة' : 'Processing') : photo.processingState === 'ready' ? (isArabic ? 'جاهزة للمراجعة والاعتماد' : 'Ready for review and approval') : photo.processingState === 'needs-review' ? (isArabic ? 'تحتاج مراجعة قبل التنزيل' : 'Review required before download') : photo.processingState === 'failed' ? (isArabic ? 'تعذرت المعالجة' : 'Processing failed') : (isArabic ? 'لم تبدأ المعالجة بعد' : 'Not processed yet')}</small></div>
            <button className="task-open" onClick={() => {setActiveId(photo.id);setResultUrl(photo.processedUrl ?? null);setBackground(photo.processedBackground ?? 'white');goTo('studio')}}>{isArabic ? 'فتح' : 'Open'} <ArrowUpRight size={15}/></button>
          </article>) : <div className="empty-state"><Images size={30}/><strong>{isArabic ? 'لا توجد مهام بعد' : 'No tasks yet'}</strong><p>{isArabic ? 'أضف صورة من الاستوديو لتظهر هنا مراحل عملها.' : 'Add a photo in the studio and its workflow will appear here.'}</p><button className="button-primary" onClick={() => goTo('studio')}>{isArabic ? 'افتح الاستوديو' : 'Open studio'}</button></div>}</div>
          <div className="task-honesty-note"><Check size={16}/>{isArabic ? 'كل حالة مرتبطة بحالة الصورة الفعلية داخل الاستوديو.' : 'Every status reflects the actual photo state in the studio.'}</div>
        </section>}

        {screen === 'profile' && <section className="secondary-screen profile-screen">
          <span className="eyebrow">YOUR MSHKUR</span><h1>{isArabic ? 'شخصيتك ومساحتك' : 'Your space, your style'}</h1>
          <p>{isArabic ? 'خصص اسم مساعدك ومظهر مساحة العمل. ستُحفظ التفضيلات على هذا الجهاز.' : 'Personalize your assistant name and workspace appearance. Preferences are saved on this device.'}</p>
          <div className="persona-card"><div className="persona-avatar"><Sparkles size={28}/></div><div><strong>{profileName || (isArabic ? 'مساعدي' : 'My assistant')}</strong><small>{isArabic ? 'شخصية مساحة العمل' : 'Your workspace companion'}</small></div></div>
          <label className="profile-field"><span>{isArabic ? 'اسم الشخصية' : 'Assistant name'}</span><input value={profileName} maxLength={28} onChange={event => setProfileName(event.target.value)} placeholder={isArabic ? 'اكتب اسماً قصيراً' : 'Choose a short name'}/></label>
          <div className="theme-picker"><strong>{isArabic ? 'لون المساحة' : 'Workspace theme'}</strong><div>{([{id:'sage',label:isArabic?'أخضر هادئ':'Sage'},{id:'violet',label:isArabic?'بنفسجي':'Violet'},{id:'ocean',label:isArabic?'أزرق':'Ocean'}]).map(theme => <button key={theme.id} className={workspaceTheme===theme.id?'selected':''} onClick={()=>setWorkspaceTheme(theme.id)}><i className={'theme-swatch '+theme.id}/>{theme.label}</button>)}</div></div>
          <div className="profile-note"><Check size={16}/>{isArabic ? 'التخصيص محلي على هذا المتصفح، وليس مزامنة حساب بعد.' : 'Personalization is local to this browser; account sync is not connected yet.'}</div>
        </section>}

        {screen === 'library' && <section className="secondary-screen"><span className="eyebrow">YOUR WORKSPACE</span><h1>{t('libraryTitle')}</h1><p>{t('libraryHint')}</p>
          {photos.length ? <div className="library-grid">{photos.map(photo => <button className="library-item" key={photo.id} onClick={() => {setResultUrl(photo.processedUrl ?? null);setBackground(photo.processedBackground ?? 'white');setActiveId(photo.id);goTo('studio')}}><img src={photo.url} alt={photo.file.name}/><span>{photo.file.name}</span></button>)}</div> : <div className="empty-state"><Images size={32}/><strong>{t('noPhotos')}</strong><p>{t('noPhotosHint')}</p><button className="button-primary" onClick={() => goTo('studio')}>{t('back')}</button></div>}
        </section>}

        {screen === 'team' && <section className="secondary-screen"><span className="eyebrow">MSHKUR AIBG ASSISTANTS</span><h1>{t('teamTitle')}</h1><p>{t('teamHint')}</p>
          <div className="specialist-list">{[
            {id:'vehicle-retoucher',icon:CarFront,name:isArabic?'مساعد تحسين صور السيارات':'Vehicle Retoucher',detail:isArabic?'عزل الخلفية وتعديل القناع وتوحيد التمركز والخلفية.':'Segmentation, mask editing, grounded placement and background output.',active:true},
            {id:'quality-inspector',icon:SlidersHorizontal,name:isArabic?'مساعد مراجعة الجودة':'Quality Inspector',detail:isArabic?'فحص الحواف والقناع والتنبيه إلى القص والتسرب.':'Checks mask geometry, edge contact, crop risk and leakage.',active:true},
            {id:'batch-operator',icon:Images,name:isArabic?'مساعد معالجة الدفعات':'Batch Operator',detail:isArabic?'يعالج الصور بالتتابع ويعرض حالة مستقلة لكل صورة.':'Processes images sequentially with per-image status.',active:true},
            {id:'workflow-orchestrator',icon:Sparkles,name:isArabic?'منسق سير العمل':'Workflow Orchestrator',detail:isArabic?'ينظم خطوات المعالجة والمراجعة والاعتماد البشري.':'Coordinates processing, review and human approval.',active:false}
          ].map(({id,icon:Icon,name,detail,active})=><article className="specialist-row" key={id}><span className="specialist-icon"><Icon size={21}/></span><div><strong>{name}</strong><p>{detail}</p></div><span className="planned-tag">{active?(isArabic?'متصل بالاستوديو':'Studio connected'):(isArabic?'عقد سير عمل':'Workflow contract')}</span></article>)}</div>
        </section>}

        {screen === 'settings' && <section className="secondary-screen"><span className="eyebrow">PREFERENCES</span><h1>{t('settingsTitle')}</h1>
          <div className="settings-list"><div className="settings-row"><div><strong>{t('language')}</strong><small>English / العربية</small></div><button className="setting-control" onClick={() => setLocale(isArabic ? 'en' : 'ar')}>{isArabic ? 'العربية' : 'English'} <ChevronDown size={16}/></button></div><div className="settings-row"><div><strong>{t('appearance')}</strong><small>{t('light')}</small></div><span className="light-chip">☼ {t('light')}</span></div><div className="settings-row"><div><strong>{t('privacy')}</strong><small>{t('privacyHint')}</small></div><Check size={18} color="#64806b"/></div></div>
        </section>}
      </main>

      <button className={`smart-orb ${smartOpen ? 'is-open' : ''}`} onClick={() => setSmartOpen(value => !value)} aria-label={isArabic ? 'افتح مساعد مشكور الذكي' : 'Open MSHKUR smart assistant'} aria-expanded={smartOpen}>
        {smartOpen ? <X size={22}/> : <><Sparkles size={23}/><span className="smart-orb-pulse"/></>}
      </button>
      {smartOpen && <div className="smart-backdrop" onClick={() => setSmartOpen(false)}>
        <section className="smart-sheet" role="dialog" aria-modal="true" aria-label={isArabic ? 'مساعد مشكور' : 'MSHKUR assistant'} onClick={event => event.stopPropagation()}>
          <div className="smart-sheet-handle"/>
          <div className="smart-sheet-head">
            <span className="smart-sheet-mark"><Sparkles size={19}/></span>
            <div><strong>{isArabic ? 'مشكور معك' : 'MSHKUR is here'}</strong><small>{isArabic ? 'مساعدة ذكية حسب الشاشة التي تعمل عليها' : 'Context-aware help for this screen'}</small></div>
            <button onClick={() => setSmartOpen(false)} aria-label={t('close')}><X size={19}/></button>
          </div>
          <p className="smart-sheet-prompt">{isArabic ? (activePhoto ? 'صورتك جاهزة. ماذا تريد أن تفعل؟' : 'ابدأ بخطوة واحدة، وسأرشدك بصرياً.') : (activePhoto ? 'Your photo is ready. What would you like to do?' : 'Start with one simple step. I’ll guide you visually.')}</p>
          <div className="smart-action-grid">
            <button onClick={() => runSmartAction('upload')}><span className="smart-action-image upload-art"><ImagePlus size={23}/></span><strong>{isArabic ? 'أضف صورة' : 'Add a photo'}</strong><small>{isArabic ? 'من المعرض أو الكاميرا' : 'Gallery or camera'}</small></button>
            <button onClick={() => runSmartAction('process')}><span className="smart-action-image process-art"><Sparkles size={23}/></span><strong>{isArabic ? 'أزل الخلفية' : 'Remove background'}</strong><small>{isArabic ? 'ابدأ المعالجة مباشرة' : 'Start processing'}</small></button>
            <button onClick={() => runSmartAction('white')}><span className="smart-action-image white-art"><span/></span><strong>{isArabic ? 'خلفية بيضاء' : 'White background'}</strong><small>{isArabic ? 'مناسبة للإعلانات' : 'Ready for listings'}</small></button>
            <button onClick={() => runSmartAction('guide')}><span className="smart-action-image guide-art"><Play size={23}/></span><strong>{isArabic ? 'أرني كيف أبدأ' : 'Show me how'}</strong><small>{isArabic ? 'جولة مرئية قصيرة' : 'A short visual tour'}</small></button>
          </div>
          <div className="smart-sheet-foot"><span className="smart-live-dot"/>{isArabic ? 'الأوامر هنا تنفّذ إجراءات فعلية داخل الاستوديو' : 'Actions run directly in the studio'}</div>
        </section>
      </div>}
      <input ref={galleryRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={importPhotos}/>
      <input ref={cameraRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={importPhotos}/>
    </div>
  );
}
