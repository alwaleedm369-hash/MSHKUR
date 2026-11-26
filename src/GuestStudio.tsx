/**
 * GuestStudio — استوديو الزائر
 * يستخدم mshkurImageEngine (SEGMENT + MATTE refine + استوديو) وليس BG0 مباشرة.
 * العلامة المائية عند التصدير فقط (قابلة للتعطيل من الأدمن).
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ImagePlus,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  Upload,
  WandSparkles,
} from 'lucide-react';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import { runCarStudioPipeline } from './mshkurImageEngine';
import { applyFreeWatermark, isFreeWatermarkEnabled } from './mshkurWatermark';
import { compressImageFile } from './compressImage';
import { buildCarAdMessage, getSavedWaNumber, openWhatsAppShare } from './whatsappShare';

type Result = { name: string; beforeUrl: string; url: string };
type Props = { onAccount?: () => void; onDone?: () => void };

export default function GuestStudio({ onAccount, onDone }: Props) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, 3 - Number(localStorage.getItem('mshkur_guest_' + today) || 0))
  );
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const resultsRef = useRef<Result[]>([]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(
    () => () => {
      resultsRef.current.forEach((r) => {
        URL.revokeObjectURL(r.url);
        URL.revokeObjectURL(r.beforeUrl);
      });
    },
    []
  );

  function clearResults() {
    resultsRef.current.forEach((r) => {
      URL.revokeObjectURL(r.url);
      URL.revokeObjectURL(r.beforeUrl);
    });
    resultsRef.current = [];
    setResults([]);
  }

  function choose(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).slice(0, 3);
    if (next.some((f) => !f.type.startsWith('image/') || f.size > 12 * 1024 * 1024)) {
      setError('اختر صوراً صالحة، حجم كل صورة أقل من 12 ميجابايت.');
      return;
    }
    setFiles(next);
    clearResults();
    setError('');
    setProgress('');
  }

  async function process() {
    if (!files.length) return;
    if (files.length > remaining) {
      setError('المتبقي من رصيدك المجاني اليوم ' + remaining + ' صورة.');
      return;
    }
    setBusy(true);
    setError('');
    clearResults();
    try {
      const done: Result[] = [];
      for (let i = 0; i < files.length; i++) {
        const raw = files[i];
        setProgress(`صورة ${i + 1}/${files.length} — ضغط للجوال...`);
        const file = await compressImageFile(raw, { maxEdge: 1600, quality: 0.85 });
        const beforeUrl = URL.createObjectURL(raw);
        try {
          const result = await runCarStudioPipeline(file, {
            studioBg: 'white',
            contactShadow: true,
            enhanceLight: true,
            refineMatte: true,
            onProgress: (msg) => setProgress(`صورة ${i + 1}/${files.length} — ${msg}`),
          });
          done.push({ name: file.name, beforeUrl, url: result.url });
          setResults([...done]);
          resultsRef.current = [...done];
          const used = Number(localStorage.getItem('mshkur_guest_' + today) || 0) + 1;
          localStorage.setItem('mshkur_guest_' + today, String(used));
          setRemaining(Math.max(0, 3 - used));
        } catch (inner) {
          URL.revokeObjectURL(beforeUrl);
          throw inner;
        }
      }
      setProgress('اكتملت المعالجة عبر محرك مشكور المحلي');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذرت معالجة الصور على هذا الجهاز.');
    } finally {
      setBusy(false);
    }
  }

  async function downloadResult(url: string, filename: string) {
    try {
      let blob: Blob;
      if (isFreeWatermarkEnabled()) {
        blob = await applyFreeWatermark(url, {
          mode: 'signature',
          position: 'bottom-right',
          opacity: 0.7,
        });
      } else {
        const res = await fetch(url);
        blob = await res.blob();
      }
      const a = document.createElement('a');
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التنزيل');
    }
  }

  return (
    <main className="guest-studio" dir="rtl">
      <header>
        <div className="guest-brand">
          مشكور <small>MSHKUR</small>
        </div>
        {onDone && (
          <button type="button" onClick={onDone}>
            رجوع
          </button>
        )}
        {onAccount && (
          <button type="button" onClick={onAccount}>
            <LogIn size={16} /> تسجيل / حفظ أعمالي
          </button>
        )}
      </header>

      <section className="guest-intro">
        <span>
          <WandSparkles size={15} /> محرك مشكور · SEGMENT + MATTE + استوديو
        </span>
        <h1>ابدأ بصور سيارتك.</h1>
        <p>
          حتى 3 صور يومياً. إزالة خلفية محلية، تنعيم الحواف، خلفية بيضاء وظل — ثم مقارنة وتنزيل.
        </p>
      </section>

      <label className="guest-upload">
        <Upload size={25} />
        <b>اختر صور السيارة</b>
        <small>المتبقي اليوم: {remaining} من 3 · PNG / JPG / WebP · 12MB للصورة</small>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => choose(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <div className="guest-file-list">
          {files.map((f, i) => (
            <div key={i}>
              <ImagePlus size={17} />
              <span>{f.name}</span>
              <small>{(f.size / 1024 / 1024).toFixed(1)} MB</small>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="guest-process" disabled={!files.length || busy} onClick={process}>
        {busy ? <LoaderCircle className="spin" size={17} /> : <WandSparkles size={17} />}
        {busy ? 'جارٍ تجهيز الصور...' : 'معالجة بمحرك مشكور'}
      </button>

      {progress && <p className="guest-progress">{progress}</p>}
      {error && <p className="guest-error">{error}</p>}

      {results.length > 0 && (
        <section className="guest-results">
          <h2>نتائجك جاهزة</h2>
          {results.map((r, i) => (
            <article key={i}>
              <BeforeAfterSlider before={r.beforeUrl} after={r.url} label={'مقارنة ' + r.name} />
              <div className="guest-dl-row">
                <button
                  type="button"
                  className="guest-dl"
                  onClick={() => downloadResult(r.url, 'mshkur-' + (i + 1) + '.png')}
                >
                  <ArrowDownToLine size={15} /> تنزيل PNG
                  {isFreeWatermarkEnabled() ? ' · علامة مشكور' : ''}
                </button>
                <button
                  type="button"
                  className="guest-dl guest-wa"
                  onClick={() => {
                    const msg = buildCarAdMessage({
                      notes: 'صورة سيارة جاهزة بعد إزالة الخلفية عبر مشكور. أرفق الصورة يدوياً من المعرض بعد التنزيل.',
                    });
                    openWhatsAppShare(getSavedWaNumber(), msg);
                  }}
                >
                  واتساب
                </button>
              </div>
              <small>{r.name}</small>
            </article>
          ))}
          {onAccount && (
            <button type="button" onClick={onAccount}>
              أنشئ حساباً لحفظ السيارة ومتابعة التجهيز <LogIn size={15} />
            </button>
          )}
        </section>
      )}

      <footer>
        <ShieldCheck size={15} /> المعالجة على جهازك عبر mshkurImageEngine — لا رفع لخدمات مدفوعة.
        الحفظ يتطلب حساباً. العلامة (إن وُجدت) عند التنزيل فقط ويمكن تعطيلها من الإدارة.
      </footer>
    </main>
  );
}
