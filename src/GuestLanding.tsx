/**
 * GuestLanding — واجهة الزائر التجارية (مستوى Spyne / CarFlow / CarBg)
 * قبل/بعد بصورة سيارة حقيقية · قوالب خلفيات · مساعد مشكور · زر ابدأ
 */
import { useState } from 'react';
import {
  ArrowLeft, Camera, ImagePlus, ShieldCheck, Sparkles, WandSparkles, Bot
} from 'lucide-react';

type Props = {
  onStartStudio: () => void;
  onRegister: () => void;
};

/** صور تجريبية عالية الجودة — استوديو / شارع */
const DEMO = {
  before:
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
  after:
    'https://images.unsplash.com/photo-1617531653332-bd46c24f7391?auto=format&fit=crop&w=1200&q=80',
  thumbs: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=70',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=70',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=200&q=70',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=200&q=70',
  ],
};

const TEMPLATES = [
  { id: 'white', label: 'أبيض استوديو', color: '#f8fafc', border: '#e2e8f0' },
  { id: 'warm', label: 'دافئ', color: '#f5e6d3', border: '#e7d5b8' },
  { id: 'dark', label: 'داكن', color: '#1e293b', border: '#0f172a' },
  { id: 'silver', label: 'رمادي', color: '#e2e8f0', border: '#cbd5e1' },
  { id: 'showroom', label: 'معرض', color: '#eef2ff', border: '#c7d2fe' },
];

export default function GuestLanding({ onStartStudio, onRegister }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState('white');
  const [sliderPos, setSliderPos] = useState(48);
  const [activeThumb, setActiveThumb] = useState(0);

  return (
    <div className="guest-landing gl-v2" dir="rtl">
      <header className="gl-header">
        <div className="gl-brand">
          مشكور
          <small>MSHKUR CARS</small>
        </div>
        <button type="button" className="gl-login-pill" onClick={onRegister}>
          دخول
        </button>
      </header>

      <section className="gl-hero-copy">
        <span className="gl-kicker">
          <Sparkles size={13} /> استوديو تجهيز السيارات · بلا مفاتيح
        </span>
        <h1>
          سيارتك، <em>بصورة تليق بها.</em>
        </h1>
        <p>
          ارفع الصورة · أزل الخلفية · أخفِ اللوحة · جهّز الإعلان.
          المعالجة محلية على جهازك.
        </p>
      </section>

      <section className="gl-compare" aria-label="قبل وبعد">
        <div className="gl-compare-frame">
          <div className="gl-compare-after">
            <img src={DEMO.after} alt="بعد إزالة الخلفية" />
            <span className="gl-badge after">بعد</span>
          </div>
          <div className="gl-compare-before" style={{ width: `${sliderPos}%` }}>
            <img src={DEMO.before} alt="الصورة الأصلية" />
            <span className="gl-badge before">قبل</span>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="gl-compare-range"
            aria-label="اسحب للمقارنة"
          />
          <div className="gl-compare-handle" style={{ left: `${sliderPos}%` }}>
            <span />
          </div>
        </div>

        <div className="gl-thumbs">
          {DEMO.thumbs.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`gl-thumb-img ${activeThumb === i ? 'active' : ''}`}
              onClick={() => setActiveThumb(i)}
            >
              <img src={src} alt={`عينة ${i + 1}`} />
            </button>
          ))}
          <button type="button" className="gl-thumb-img add" onClick={onStartStudio}>
            <ImagePlus size={18} />
          </button>
        </div>
      </section>

      <section className="gl-templates" aria-label="قوالب الخلفية">
        <div className="gl-section-label">خلفيات الاستوديو</div>
        <div className="gl-template-row">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`gl-template ${selectedTemplate === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(t.id)}
            >
              <span
                className="gl-template-swatch"
                style={{ background: t.color, borderColor: t.border }}
              />
              <small>{t.label}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="gl-actions">
        <button type="button" className="gl-btn-primary" onClick={onStartStudio}>
          <WandSparkles size={18} />
          ابدأ التجهيز
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="gl-btn-secondary" onClick={onStartStudio}>
          <Camera size={16} />
          تصوير مباشر
        </button>
      </div>

      <aside className="gl-assistant-card">
        <div className="gl-assistant-avatar">
          <Bot size={22} />
        </div>
        <div className="gl-assistant-body">
          <b>مساعد مشكور</b>
          <p>ارفع صورة السيارة وسأقترح إزالة الخلفية، طمس اللوحة، وتجهيز مسودة الإعلان.</p>
        </div>
        <button type="button" className="gl-assistant-go" onClick={onStartStudio}>
          ابدأ
        </button>
      </aside>

      <section className="gl-how">
        <h2>كيف يعمل مشكور؟</h2>
        <ol>
          <li><strong>ارفع</strong> صور السيارة أو التقطها.</li>
          <li><strong>اختر</strong> قالباً أو اترك الخلفية البيضاء.</li>
          <li><strong>راجع ووافق</strong> قبل أي نشر.</li>
        </ol>
        <div className="gl-trust">
          <ShieldCheck size={15} />
          العمل محفوظ محلياً · لا نرفع صورك بدون حسابك
        </div>
      </section>

      <div className="gl-footer-actions">
        <button type="button" className="gl-btn-primary wide" onClick={onRegister}>
          إنشاء مساحة معرض
        </button>
        <button type="button" className="gl-btn-ghost" onClick={onStartStudio}>
          جرّب بدون تسجيل
        </button>
      </div>
    </div>
  );
}
