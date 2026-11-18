/**
 * GuestLanding.tsx — الصفحة الرئيسية للجوال (زائر + دخول سريع)
 * مستوحاة من Spyne.ai / CarFlow.ai مع فلسفة مشكور: الأداة أولاً، الشروحات بالأسفل.
 * خلفية بيضاء، صف مصغّرات، قوالب خلفيات، زر ابدأ بارز، قبل/بعد.
 */
import { useState } from 'react';
import { ArrowLeft, Camera, ImagePlus, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';

type Props = {
  onStartStudio: () => void;
  onRegister: () => void;
};

const BACKGROUND_TEMPLATES = [
  { id: 'white', label: 'أبيض استوديو', preview: '#f8fafc' },
  { id: 'silver', label: 'رمادي', preview: '#e2e8f0' },
  { id: 'dark', label: 'داكن', preview: '#1e293b' },
  { id: 'warm', label: 'دافئ', preview: '#fef3c7' },
  { id: 'showroom', label: 'معرض', preview: '#f1f5f9' },
];

export default function GuestLanding({ onStartStudio, onRegister }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState('white');
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="guest-landing" dir="rtl">
      {/* ===== منطقة العمل العلوية — بدون كلام كثير ===== */}
      <header className="gl-header">
        <div className="gl-brand">مشكور <small>MSHKUR</small></div>
        <button className="gl-menu" aria-label="القائمة">☰</button>
      </header>

      {/* معاينة قبل / بعد كبيرة */}
      <section className="gl-hero-preview" aria-label="معاينة قبل وبعد">
        <div className="gl-before-after">
          <div className="gl-ba-before" style={{ width: `${sliderPos}%` }}>
            {/* صورة أصلية حقيقية تُستبدل لاحقاً بصورة من الألبوم أو مثال */}
            <div className="gl-ba-placeholder before">قبل</div>
          </div>
          <div className="gl-ba-after">
            <div className="gl-ba-placeholder after" style={{ background: BACKGROUND_TEMPLATES.find(t => t.id === selectedTemplate)?.preview }}>
              بعد · استوديو
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="gl-ba-slider"
            aria-label="مقارنة قبل وبعد"
          />
          <div className="gl-ba-handle" style={{ left: `${sliderPos}%` }} />
        </div>
      </section>

      {/* صف مصغّرات الصور الأصلية */}
      <section className="gl-thumbs-row" aria-label="الصور الأصلية">
        <div className="gl-thumbs-scroll">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} className="gl-thumb" aria-label={`صورة ${i}`}>
              <span>{i}</span>
            </button>
          ))}
          <button className="gl-thumb add" onClick={onStartStudio} aria-label="إضافة صورة">
            <ImagePlus size={20} />
          </button>
        </div>
      </section>

      {/* زر ابدأ الرئيسي */}
      <div className="gl-cta">
        <button className="gl-start-btn" onClick={onStartStudio}>
          <WandSparkles size={18} />
          ابدأ التجهيز الآن
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* قوالب الخلفيات — مثل Spyne */}
      <section className="gl-templates" aria-label="قوالب الخلفيات">
        <div className="gl-templates-label">قوالب الاستوديو</div>
        <div className="gl-templates-scroll">
          {BACKGROUND_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`gl-template-card ${selectedTemplate === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(t.id)}
              style={{ background: t.preview }}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== الشروحات في الأسفل (Scroll) ===== */}
      <section className="gl-explain">
        <h2>كيف يعمل مشكور؟</h2>
        <ol>
          <li>ارفع صور السيارة أو التقطها.</li>
          <li>اختر قالباً أو اترك الخلفية البيضاء + ظل تماس.</li>
          <li>راجع النتيجة ووافق قبل أي نشر.</li>
        </ol>

        <div className="gl-trust">
          <ShieldCheck size={16} />
          <span>الأصل محفوظ دائماً · لا نشر دون موافقتك · معالجة محلية قدر الإمكان</span>
        </div>

        <div className="gl-secondary-actions">
          <button onClick={onRegister}>إنشاء مساحة معرض</button>
          <button onClick={onStartStudio}>جرّب بدون تسجيل</button>
        </div>
      </section>
    </div>
  );
}
