/**
 * CarAdWorkflow — سير عمل تجهيز إعلان السيارة (أداة أولاً)
 * تسلسل: رفع → معالجة → اقتراح الخطوة التالية → مسودة → راجع ووافق → نشر
 */
import { useCallback, useRef, useState } from 'react';
import {
  ArrowLeft, Camera, Check, ChevronLeft, ImagePlus, LoaderCircle,
  ShieldCheck, Sparkles, Upload, WandSparkles
} from 'lucide-react';

type Step = 'upload' | 'process' | 'next' | 'draft' | 'review';

type Props = {
  onBack?: () => void;
  onRequestPublish?: (payload: {
    title: string;
    draft: string;
    imageUrl?: string;
  }) => void;
  onRemoveBackground?: (file: File) => Promise<string>;
};

const NEXT_ACTIONS = [
  { id: 'plate', label: 'طمس اللوحة', desc: 'إخفاء رقم اللوحة قبل النشر' },
  { id: 'light', label: 'تحسين الإضاءة', desc: 'ضبط التعريض والحدة' },
  { id: 'bg', label: 'توحيد الخلفية', desc: 'خلفية استوديو بيضاء أو معرض' },
  { id: 'ad', label: 'تجهيز الإعلان', desc: 'مسودة نص + صور جاهزة' },
];

export default function CarAdWorkflow({
  onBack,
  onRequestPublish,
  onRemoveBackground,
}: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [doneActions, setDoneActions] = useState<string[]>(['bg']);
  const [draft, setDraft] = useState({
    make: '', model: '', year: '', price: '', city: 'جدة', notes: '',
  });
  const [adText, setAdText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((f: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    if (f.size > 12 * 1024 * 1024) {
      alert('الحد الأقصى 12 ميجابايت');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl('');
    setStep('process');
  }, []);

  async function runProcess() {
    if (!file) return;
    setBusy(true);
    setProgress(8);
    setProgressMsg('تحضير الصورة...');
    try {
      if (onRemoveBackground) {
        setProgress(25);
        setProgressMsg('إزالة الخلفية محلياً...');
        const out = await onRemoveBackground(file);
        setResultUrl(out);
      } else {
        for (const [p, m] of [
          [30, 'تحليل الصورة...'],
          [55, 'عزل السيارة...'],
          [80, 'توليد ظل التماس...'],
          [100, 'اكتملت المعالجة'],
        ] as const) {
          setProgress(p as number);
          setProgressMsg(m as string);
          await new Promise((r) => setTimeout(r, 350));
        }
        setResultUrl(previewUrl);
      }
      setDoneActions(['bg']);
      setStep('next');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'تعذرت المعالجة');
      setStep('upload');
    } finally {
      setBusy(false);
    }
  }

  function toggleAction(id: string) {
    setDoneActions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function buildAdText() {
    const parts = [
      draft.make && draft.model
        ? `${draft.make} ${draft.model}${draft.year ? ' ' + draft.year : ''}`
        : 'سيارة للبيع',
      draft.price ? `السعر: ${draft.price} ريال` : '',
      draft.city ? `المدينة: ${draft.city}` : '',
      draft.notes || '',
      '',
      'الصور مجهّزة عبر مشكور · للاستفسار تواصل عبر واتساب',
    ].filter(Boolean);
    setAdText(parts.join('\n'));
    setStep('review');
  }

  function approvePublish() {
    const title =
      draft.make && draft.model
        ? `${draft.make} ${draft.model}`
        : 'إعلان سيارة';
    onRequestPublish?.({
      title,
      draft: adText,
      imageUrl: resultUrl || previewUrl,
    });
  }

  return (
    <div className="car-ad-workflow" dir="rtl">
      <header className="caw-header">
        <button type="button" className="caw-back" onClick={onBack} aria-label="رجوع">
          <ChevronLeft size={20} />
        </button>
        <div>
          <b>تجهيز إعلان السيارة</b>
          <small>أداة أولاً · راجع ووافق قبل النشر</small>
        </div>
        <span className="caw-step-pill">
          {step === 'upload' && '1/5'}
          {step === 'process' && '2/5'}
          {step === 'next' && '3/5'}
          {step === 'draft' && '4/5'}
          {step === 'review' && '5/5'}
        </span>
      </header>

      {step === 'upload' && (
        <section className="caw-upload">
          <div
            className="caw-drop"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] || null);
            }}
          >
            <Upload size={28} />
            <b>ارفع صورة السيارة</b>
            <p>JPG أو PNG أو WebP · أقل من 12 ميجابايت</p>
            <div className="caw-upload-actions">
              <button type="button" className="caw-btn primary">
                <ImagePlus size={16} /> اختيار من الجهاز
              </button>
              <button type="button" className="caw-btn ghost" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                <Camera size={16} /> كاميرا
              </button>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pickFile(e.target.files?.[0] || null)} />
          <p className="caw-hint">
            <ShieldCheck size={14} /> المعالجة محلية قدر الإمكان · لا نشر بدون موافقتك
          </p>
        </section>
      )}

      {step === 'process' && (
        <section className="caw-process">
          <div className="caw-preview">{previewUrl && <img src={previewUrl} alt="معاينة" />}</div>
          {!busy && (
            <button type="button" className="caw-btn primary wide" onClick={runProcess}>
              <WandSparkles size={18} /> ابدأ إزالة الخلفية والتجهيز
            </button>
          )}
          {busy && (
            <div className="caw-progress">
              <LoaderCircle className="spin" size={22} />
              <div>
                <b>{progressMsg}</b>
                <div className="caw-bar"><span style={{ width: `${progress}%` }} /></div>
              </div>
            </div>
          )}
        </section>
      )}

      {step === 'next' && (
        <section className="caw-next">
          <div className="caw-compare-mini">
            {previewUrl && <img src={previewUrl} alt="قبل" />}
            {(resultUrl || previewUrl) && <img src={resultUrl || previewUrl} alt="بعد" />}
          </div>
          <h2><Sparkles size={16} /> الخطوة التالية المقترحة</h2>
          <p className="caw-sub">اختر ما تحتاجه — أو انتقل مباشرة لتجهيز الإعلان</p>
          <div className="caw-actions-grid">
            {NEXT_ACTIONS.map((a) => (
              <button key={a.id} type="button" className={`caw-action-card ${doneActions.includes(a.id) ? 'on' : ''}`} onClick={() => toggleAction(a.id)}>
                <span className="caw-check">{doneActions.includes(a.id) && <Check size={14} />}</span>
                <b>{a.label}</b>
                <small>{a.desc}</small>
              </button>
            ))}
          </div>
          <button type="button" className="caw-btn primary wide" onClick={() => setStep('draft')}>
            متابعة لتجهيز الإعلان <ArrowLeft size={16} />
          </button>
        </section>
      )}

      {step === 'draft' && (
        <section className="caw-draft">
          <h2>بيانات الإعلان</h2>
          <div className="caw-form">
            <label>الماركة<input value={draft.make} onChange={(e) => setDraft({ ...draft, make: e.target.value })} placeholder="تويوتا" /></label>
            <label>الموديل<input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} placeholder="كامري" /></label>
            <label>السنة<input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="2022" /></label>
            <label>السعر<input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="85000" /></label>
            <label>المدينة<input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></label>
            <label className="full">ملاحظات<textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={3} placeholder="حالة السيارة، الممشى..." /></label>
          </div>
          <button type="button" className="caw-btn primary wide" onClick={buildAdText}>إنشاء مسودة الإعلان</button>
        </section>
      )}

      {step === 'review' && (
        <section className="caw-review">
          <h2>راجع ووافق قبل النشر</h2>
          {(resultUrl || previewUrl) && <img className="caw-review-img" src={resultUrl || previewUrl} alt="صورة الإعلان" />}
          <textarea className="caw-ad-text" value={adText} onChange={(e) => setAdText(e.target.value)} rows={8} />
          <div className="caw-trust">
            <ShieldCheck size={15} />
            لن يُنشر شيء باسمك إلا بعد ضغط «راجع ووافق على النشر»
          </div>
          <button type="button" className="caw-btn primary wide" onClick={approvePublish}>
            <Check size={18} /> راجع ووافق على النشر
          </button>
          <button type="button" className="caw-btn ghost wide" onClick={() => setStep('draft')}>تعديل البيانات</button>
        </section>
      )}
    </div>
  );
}
