import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  ArrowUpRight, Camera, CarFront, Check, ChevronDown,
  CircleHelp, Globe2, ImagePlus, Images, Menu,
  SlidersHorizontal, Sparkles, X
} from 'lucide-react';

type Locale = 'en' | 'ar';
type Screen = 'studio' | 'library' | 'team' | 'settings';
type Photo = { id: string; file: File; url: string };

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
    creative: 'Creative direction', vehicle: 'Vehicle retouching', quality: 'Image quality',
    planned: 'In preparation', settingsTitle: 'Manage Studio Preferences', language: 'Language',
    appearance: 'Appearance', light: 'Light', privacy: 'Local-first storage',
    privacyHint: 'Imported photos remain in this browser session. Nothing is uploaded by this screen.',
    menu: 'Open menu', close: 'Close menu', signIn: 'Google sign in',
    signInNote: 'Account sign-in is not connected yet.', save: 'Save photo', share: 'Share',
    removeSelected: 'Remove selected', photoCount: 'photos selected', back: 'Back to studio',
    whiteHint: 'A clean listing-ready background', transparentHint: 'For further design work',
    before: 'Before', after: 'After', preview: 'Photo preview', change: 'Change photo',
    imageError: 'Please choose a valid image file under 20 MB.',
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
    libraryTitle: 'مشاريعك الأخيرة', libraryHint: 'تظهر هنا الصور التي استوردتها خلال هذه الجلسة. لا يتم رفع الصور من هذه الشاشة.',
    teamTitle: 'فريقك الإبداعي المتخصص', teamHint: 'نعمل على تجهيز مسارات المتخصصين. ستظهر عند اختبار مهاراتهم وربطها.',
    creative: 'التوجيه الإبداعي', vehicle: 'تحسين صور السيارات', quality: 'جودة الصور',
    planned: 'قيد التجهيز', settingsTitle: 'إدارة تفضيلات الاستوديو', language: 'اللغة',
    appearance: 'المظهر', light: 'فاتح', privacy: 'تخزين محلي أولاً',
    privacyHint: 'تبقى الصور المستوردة في جلسة المتصفح. هذه الشاشة لا ترفع صورك.',
    menu: 'فتح القائمة', close: 'إغلاق القائمة', signIn: 'الدخول عبر Google',
    signInNote: 'تسجيل الدخول غير متصل بعد.', save: 'حفظ الصورة', share: 'مشاركة',
    removeSelected: 'إزالة المحدد', photoCount: 'صور محددة', back: 'العودة للاستوديو',
    whiteHint: 'خلفية نظيفة مناسبة للإعلانات', transparentHint: 'لمتابعة التصميم لاحقاً',
    before: 'قبل', after: 'بعد', preview: 'معاينة الصورة', change: 'تغيير الصورة',
    imageError: 'اختر صورة صالحة لا يتجاوز حجمها 20 ميجابايت.',
  },
} as const;

type Key = keyof typeof messages.en;

function CarMark() {
  return <span className="brand-mark"><CarFront size={20} strokeWidth={1.8} /></span>;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('mshkur.locale') === 'ar' ? 'ar' : 'en');
  const [screen, setScreen] = useState<Screen>('studio');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [background, setBackground] = useState<'white' | 'transparent'>('white');
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const t = (key: Key) => messages[locale][key];
  const activePhoto = photos.find(photo => photo.id === activeId) ?? photos[0] ?? null;
  const isArabic = locale === 'ar';

  useEffect(() => {
    localStorage.setItem('mshkur.locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [locale, isArabic]);

  useEffect(() => () => photos.forEach(photo => URL.revokeObjectURL(photo.url)), []);

  function importPhotos(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    const valid = incoming.filter(file => file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024);
    if (valid.length !== incoming.length) setNotice(t('imageError'));
    if (valid.length) {
      const added = valid.map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
      setPhotos(current => [...current, ...added]);
      setActiveId(added[0].id);
      setScreen('studio');
      setNotice('');
    }
    event.target.value = '';
  }

  function removePhoto(id: string) {
    setPhotos(current => {
      const target = current.find(photo => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter(photo => photo.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  }

  function handleRemoveBackground() {
    setNotice(t('engineUnavailable'));
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
              <div className={`photo-canvas ${activePhoto ? 'with-image' : ''}`}>
                {activePhoto ? <>
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
                  {photos.map(photo => <button key={photo.id} className={`photo-thumb ${activePhoto?.id === photo.id ? 'selected' : ''}`} onClick={() => setActiveId(photo.id)} aria-label={photo.file.name}>
                    <img src={photo.url} alt="" /><span className="thumb-check"><Check size={11}/></span>
                  </button>)}
                  <button className="add-thumb" onClick={() => galleryRef.current?.click()} aria-label={t('addMore')}><ImagePlus size={19}/></button>
                </div>
              </div>}

              {activePhoto && <div className="edit-panel">
                <div className="panel-top"><div><span className="eyebrow">{t('output')}</span><strong>{t('white')}</strong></div><span className="panel-icon"><SlidersHorizontal size={18}/></span></div>
                <div className="background-options">
                  <button className={background === 'white' ? 'chosen' : ''} onClick={() => setBackground('white')}><span className="swatch white-swatch"/><span><strong>{t('white')}</strong><small>{t('whiteHint')}</small></span>{background === 'white' && <Check size={17}/>}</button>
                  <button className={background === 'transparent' ? 'chosen' : ''} onClick={() => setBackground('transparent')}><span className="swatch transparent-swatch"/><span><strong>{t('transparent')}</strong><small>{t('transparentHint')}</small></span>{background === 'transparent' && <Check size={17}/>}</button>
                </div>
                <button className="remove-button" onClick={handleRemoveBackground}><Sparkles size={18}/>{t('remove')}<ArrowUpRight size={17}/></button>
              </div>}
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
          {photos.length ? <div className="library-grid">{photos.map(photo => <button className="library-item" key={photo.id} onClick={() => {setActiveId(photo.id);goTo('studio')}}><img src={photo.url} alt={photo.file.name}/><span>{photo.file.name}</span></button>)}</div> : <div className="empty-state"><Images size={32}/><strong>{t('noPhotos')}</strong><p>{t('noPhotosHint')}</p><button className="button-primary" onClick={() => goTo('studio')}>{t('back')}</button></div>}
        </section>}

        {screen === 'team' && <section className="secondary-screen"><span className="eyebrow">SPECIALIST WORKFLOWS</span><h1>{t('teamTitle')}</h1><p>{t('teamHint')}</p>
          <div className="specialist-list">{[{icon:Sparkles,name:t('creative'),detail:'Art direction, references and consistent visual language.'},{icon:CarFront,name:t('vehicle'),detail:'Vehicle masking, glass edges, wheels and studio backgrounds.'},{icon:SlidersHorizontal,name:t('quality'),detail:'Resolution, lighting balance and export checks.'}].map(({icon:Icon,name,detail})=><article className="specialist-row" key={name}><span className="specialist-icon"><Icon size={21}/></span><div><strong>{name}</strong><p>{detail}</p></div><span className="planned-tag">{t('planned')}</span></article>)}</div>
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
