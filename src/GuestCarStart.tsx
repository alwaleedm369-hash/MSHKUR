import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, ChevronLeft, FileText, ImagePlus, LogIn, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';

type Photo = { file: File; url: string };
type Props = {
  onContinue: (files: File[], scene: 'silver'|'dark'|'warm'|'white') => void;
  onSignIn: () => void;
  onQuickTool: () => void;
  onOpenTask: (screen: 'studio' | 'cars') => void;
};

const scenes = [
  { id: 'silver', label: 'استوديو فضي' },
  { id: 'dark', label: 'استوديو داكن' },
  { id: 'warm', label: 'استوديو دافئ' },
  { id: 'white', label: 'خلفية بيضاء' },
];

export default function GuestCarStart({ onContinue, onSignIn, onQuickTool, onOpenTask }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [active, setActive] = useState(0);
  const [scene, setScene] = useState('silver');
  const [error, setError] = useState('');
  const photosRef = useRef<Photo[]>([]);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    if (incoming.some(file => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024)) {
      setError('الصيغ المدعومة PNG وJPG وWebP، بحد أقصى 12 ميجابايت للصورة.');
      return;
    }
    setPhotos(current => {
      const available = Math.max(0, 12 - current.length);
      const additions = incoming.slice(0, available).map(file => ({ file, url: URL.createObjectURL(file) }));
      if (!additions.length) setError('وصلت إلى الحد الأقصى: 12 صورة للسيارة.');
      else setError('');
      return [...current, ...additions];
    });
    setActive(Math.min(photos.length, 11));
  }

  function removePhoto(index: number) {
    const removed = photos[index];
    if (removed) URL.revokeObjectURL(removed.url);
    setPhotos(current => current.filter((_, i) => i !== index));
    setActive(current => current > index ? current - 1 : Math.min(current, Math.max(0, photos.length - 2)));
  }

  const currentPhoto = photos[active];

  return (
    <main className="car-start" dir="rtl">
      <header className="car-start-header">
        <div className="car-start-brand"><span>م</span><div><b>مشكور</b><small>MSHKUR CARS</small></div></div>
        <button className="car-start-login" onClick={onSignIn}><LogIn size={16}/> دخول</button>
      </header>

      <section className="car-start-intro">
        <div className="car-start-kicker"><Sparkles size={14}/> استوديو تجهيز السيارات</div>
        <h1>سيارتك، بصورة تليق بها.</h1>
        <p>أضف صور السيارة، اختر مظهر الاستوديو، ثم أكمل تجهيزها.</p>
      </section>

      <section className="car-start-studio" aria-label="معاينة استوديو السيارة">
        <div className="car-start-stage" data-scene={scene}>
          <div className="car-start-stage-glow"/>
          {currentPhoto ? (
            <img className="car-start-photo" src={currentPhoto.url} alt="الصورة الأصلية للسيارة"/>
          ) : (
            <div className="car-start-empty-car">
              <div className="car-start-car-icon"><ImagePlus size={34}/></div>
              <b>أضف صور سيارتك</b>
              <span>ستظهر هنا معاينة السيارة</span>
            </div>
          )}
          <div className="car-start-stage-top"><span><i/> معاينة الاستوديو</span><small>{photos.length ? `${photos.length} صور` : 'بانتظار الصور'}</small></div>
          <div className="car-start-stage-bottom">
            <span>{scenes.find(item => item.id === scene)?.label}</span>
            <span>تبديل الخلفية عند التجهيز</span>
          </div>
        </div>

        <div className="car-start-compare">
          <span>الصورة الأصلية</span>
          <button type="button" disabled title="تظهر المقارنة بعد تنفيذ التجهيز"><span className="compare-mark"/> مقارنة</button>
        </div>

        <div className="car-start-scene-row">
          <div className="car-start-row-heading"><b>خلفية الاستوديو</b><small>اختر المظهر</small></div>
          <div className="car-start-scenes">
            {scenes.map(item => (
              <button key={item.id} type="button" className={scene === item.id ? 'active' : ''} onClick={() => setScene(item.id)} aria-pressed={scene === item.id}>
                <span className={`scene-swatch scene-${item.id}`}/><small>{item.label}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="car-start-angle-row">
          <div className="car-start-row-heading"><b>صور السيارة</b><small>{photos.length ? 'اختر صورة للعرض' : 'أضف أكثر من زاوية'}</small></div>
          {photos.length ? (
            <div className="car-start-thumbs">
              {photos.map((photo, index) => (
                <div className={`car-start-thumb-wrap ${active === index ? 'active' : ''}`} key={photo.url}>
                  <button type="button" className="car-start-thumb" onClick={() => setActive(index)} aria-label={`عرض الصورة ${index + 1}`}>
                    <img src={photo.url} alt={`صورة السيارة ${index + 1}`}/>
                    <small>{`صورة ${String(index + 1).padStart(2, '0')}`}</small>
                  </button>
                  <button type="button" className="car-start-remove" onClick={() => removePhoto(index)} aria-label="حذف الصورة"><X size={12}/></button>
                </div>
              ))}
              {photos.length < 12 && <button type="button" className="car-start-add-thumb" onClick={() => libraryRef.current?.click()}><Plus size={18}/><small>إضافة</small></button>}
            </div>
          ) : (
            <div className="car-start-angle-empty"><ImagePlus size={18}/> صور الأمام والجانب والخلف والتفاصيل تظهر هنا بعد إضافتها</div>
          )}
        </div>
      </section>

      <section className="car-start-upload-actions">
        <button type="button" className="car-start-camera" onClick={() => cameraRef.current?.click()}><Camera size={19}/> تصوير السيارة</button>
        <button type="button" className="car-start-gallery" onClick={() => libraryRef.current?.click()}><ImagePlus size={18}/> اختيار الصور</button>
        <input ref={cameraRef} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={event => { addFiles(event.target.files); event.currentTarget.value = ''; }} hidden/>
        <input ref={libraryRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={event => { addFiles(event.target.files); event.currentTarget.value = ''; }} hidden/>
      </section>

      {error && <p className="car-start-error">{error}</p>}

      <button type="button" className="car-start-continue" disabled={!photos.length} onClick={() => onContinue(photos.map(photo => photo.file), scene as 'silver'|'dark'|'warm'|'white')}>
        متابعة تجهيز السيارة <ArrowLeft size={18}/>
      </button>

      <div className="car-start-note"><ShieldCheck size={16}/><span>صورك تبقى على جهازك أثناء الاختيار. عند المتابعة تنتقل للتسجيل ثم حفظ السيارة وصورها في حسابك.</span></div>
      <button type="button" className="car-start-quick" onClick={onQuickTool}>تجربة إزالة الخلفية مباشرة دون تسجيل <ChevronLeft size={15}/></button>

      <section className="car-start-below" aria-label="أدوات مشكور">
        <div className="car-start-below-heading">
          <span>MSHKUR TOOLS</span>
          <h2>كل ما تحتاجه لتجهيز صور سيارتك</h2>
          <p>تصفح الأدوات، اختر المهمة، وابدأ مباشرة.</p>
        </div>
        <div className="car-start-tool-grid">
          <button type="button" className="car-start-tool-card" onClick={onQuickTool}>
            <span className="car-start-tool-icon"><Sparkles size={20}/></span>
            <b>إزالة الخلفية</b>
            <small>قص السيارة من صورتها وتجهيزها بخلفية شفافة</small>
            <em>جرّب الآن <ChevronLeft size={14}/></em>
          </button>
          <button type="button" className="car-start-tool-card" onClick={() => onOpenTask('studio')}>
            <span className="car-start-tool-icon"><ShieldCheck size={20}/></span>
            <b>طمس اللوحة</b>
            <small>حدد منطقة اللوحة وراجع النتيجة قبل حفظها</small>
            <em>فتح الأداة <ChevronLeft size={14}/></em>
          </button>
          <button type="button" className="car-start-tool-card" onClick={() => onOpenTask('studio')}>
            <span className="car-start-tool-icon"><ImagePlus size={20}/></span>
            <b>قص وتحسين الصور</b>
            <small>قص النسب وتحسين الصورة مع حفظ الأصل</small>
            <em>فتح الأدوات <ChevronLeft size={14}/></em>
          </button>
          <button type="button" className="car-start-tool-card" onClick={() => onOpenTask('cars')}>
            <span className="car-start-tool-icon"><Camera size={20}/></span>
            <b>ألبوم السيارة</b>
            <small>اجمع صور السيارة الأصلية ونسخها المجهزة</small>
            <em>إضافة سيارة <ChevronLeft size={14}/></em>
          </button>
          <button type="button" className="car-start-tool-card" onClick={() => onOpenTask('cars')}>
            <span className="car-start-tool-icon"><Check size={20}/></span>
            <b>بيانات السيارة</b>
            <small>سجل الماركة والطراز والسنة والسعر والتفاصيل</small>
            <em>إدخال البيانات <ChevronLeft size={14}/></em>
          </button>
          <button type="button" className="car-start-tool-card" onClick={() => onOpenTask('cars')}>
            <span className="car-start-tool-icon"><FileText size={20}/></span>
            <b>مسودة الإعلان</b>
            <small>أنشئ وصفاً من بيانات السيارة التي أدخلتها</small>
            <em>تجهيز الإعلان <ChevronLeft size={14}/></em>
          </button>
        </div>

        <div className="car-start-below-flow">
          <div><span>01</span><b>أضف صور سيارتك</b><small>كاميرا أو معرض الصور</small></div>
          <ChevronLeft size={17}/>
          <div><span>02</span><b>جهّز الصور</b><small>اختر الأدوات التي تحتاجها</small></div>
          <ChevronLeft size={17}/>
          <div><span>03</span><b>جهّز الإعلان</b><small>راجع البيانات والنتيجة</small></div>
        </div>
        <div className="car-start-below-privacy"><ShieldCheck size={16}/><span>أنت تحتفظ بالأصل، وتراجع المخرجات. لا يتم النشر من هذا المسار.</span></div>
      </section>

      <footer className="car-start-footer">مشكور <span>صور أفضل. إعلان أوضح.</span></footer>
    </main>
  );
}
