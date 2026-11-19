/**
 * CarAdWorkflow — سير عمل تجهيز إعلان السيارة (أداة أولاً)
 * تسلسل: رفع → محرك مشكور المحلي → خطوة تالية → مسودة → راجع ووافق → نشر
 */
import { useCallback, useRef, useState } from 'react';
import {
  ArrowLeft, Camera, Check, ChevronLeft, ImagePlus, LoaderCircle,
  ShieldCheck, Sparkles, Upload, WandSparkles
} from 'lucide-react';
import {
  processCarAdImage,
  enhanceLighting,
  blurPlateRegion,
  compositeStudio,
} from './mshkurImageEngine';

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
    setProgressMsg('تحضير محرك مشكور المحلي...');
    try {
      if (onRemoveBackground) {
        setProgress(30);
        setProgressMsg('إزالة الخلفية (مخصص)...');
        const out = await onRemoveBackground(file);
        setResultUrl(out);
      } else {
        const out = await processCarAdImage(file, (msg) => {
          setProgressMsg(msg);
          if (msg.includes('1/')) setProgress(25);
          else if (msg.includes('2/')) setProgress(55);
          else if (msg.includes('3/')) setProgress(80);
          else setProgress(100);
        });
        setResultUrl(out);
      }
      setDoneActions(['bg', 'light']);
      setProgress(100);
      setProgressMsg('اكتملت المعالجة المحلية');
      setStep('next');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذرت المعالجة';
      alert(
        msg +
          '\n\nتأكد من اتصال أول مرة لتنزيل نموذج BiRefNet lite المحلي، ثم تعمل بدون إنترنت للصور.'
      );
      setStep('upload');
    } finally {
      setBusy(false);
    }
  }

  async function applyExtraAction(id: string) {
    if (!resultUrl && !previewUrl) return;
    if (doneActions.includes(id) && id !== 'plate') {
      setDoneActions((prev) => prev.filter((x) => x !== id));
      return;
    }
    setBusy(true);
    try {
      const srcUrl = resultUrl || previewUrl;
      const res = await fetch(srcUrl);
      const blob = await res.blob();
      if (id === 'light') {
        setProgressMsg('تحسين الإضاءة...');
        const out = await enhanceLighting(blob, 0.14);
        setResultUrl(URL.createObjectURL(out));
        setDoneActions((p) => (p.includes('light') ? p : [...p, 'light']));
      } else if (id === 'bg') {
        setProgressMsg('توحيد خلفية الاستوديو...');
        const out = await compositeStudio(blob, { studioBg: 'white', contactShadow: true });
        setResultUrl(URL.createObjectURL(out));
        setDoneActions((p) => (p.includes('bg') ? p : [...p, 'bg']));
      } else if (id === 'plate') {
        setProgressMsg('طمس منطقة اللوحة (وسط-أسفل تقريبي)...');
        const out = await blurPlateRegion(blob, { x: 0.35, y: 0.62, w: 0.3, h: 0.12 });
        setResultUrl(URL.createObjectURL(out));
        setDoneActions((p) => (p.includes('plate') ? p : [...p, 'plate']));
      } else if (id === 'ad') {
        setStep('draft');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'تعذر تطبيق الخطوة');
    } finally {
      setBusy(false);
      setProgressMsg('');
    }
  }

  function toggleAction(id: string) {
    if (id === 'ad') {
      setStep('draft');
      return;
    }
    void applyExtraAction(id);
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
        {onBack && (
          <button type="button" className="caw-back" onClick={onBack} aria-label="رجوع">
            <ChevronLeft size={18} />
          </button>
        )}
        <div>
          <h1>تجهيز إعلان سيارة</h1>
          <p>أداة أولاً · معالجة محلية · راجع ووافق</p>
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
          <button
            type="button"
            className="caw-drop"
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={28} />
            <b>ارفع صورة السيارة</b>
            <small>PNG / JPG / WebP · حتى 12MB</small>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
          <p className="caw-hint">
            <WandSparkles size={14} /> إزالة الخلفية والظل والإضاءة تتم على جهازك (BG0 + Canvas)
          </p>
        </section>
      )}

      {step === 'process' && (
        <section className="caw-process">
          {previewUrl && <img className="caw-preview" src={previewUrl} alt="الأصل" />}
          {!busy && (
            <button type="button" className="caw-btn primary wide" onClick={runProcess}>
              <WandSparkles size={16} /> ابدأ المعالجة المحلية
            </button>
          )}
          {busy && (
            <div className="caw-progress-block">
              <LoaderCircle className="spin" size={22} />
              <b>{progressMsg || 'جارٍ المعالجة...'}</b>
              <div className="caw-bar"><i style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </section>
      )}

      {step === 'next' && (
        <section className="caw-next">
          <h2>النتيجة والخطوات التالية</h2>
          <div className="caw-compare">
            {previewUrl && <img src={previewUrl} alt="قبل" />}
            {(resultUrl || previewUrl) && <img src={resultUrl || previewUrl} alt="بعد" />}
          </div>
          {progressMsg && <p className="caw-hint">{progressMsg}</p>}
          <div className="caw-actions-grid">
            {NEXT_ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`caw-action ${doneActions.includes(a.id) ? 'done' : ''}`}
                disabled={busy}
                onClick={() => toggleAction(a.id)}
              >
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
