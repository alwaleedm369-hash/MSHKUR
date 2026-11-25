/**
 * GuestLanding — واجهة الزائر التجارية (مستوى Spyne / CarFlow / CarBg)
 * قبل/بعد بصورة سيارة حقيقية · قوالب خلفيات · مساعد مشكور · زر ابدأ
 */
import { useState } from 'react';
import {
  ArrowLeft, Camera, ImagePlus, ShieldCheck, Sparkles, WandSparkles, Bot
} from 'lucide-react';
import { useLocale } from './i18n';

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
  { id: 'white', labelKey: 'white', color: '#f8fafc', border: '#e2e8f0' },
  { id: 'warm', labelKey: 'warm', color: '#f5e6d3', border: '#e7d5b8' },
  { id: 'dark', labelKey: 'dark', color: '#1e293b', border: '#0f172a' },
  { id: 'silver', labelKey: 'silver', color: '#e2e8f0', border: '#cbd5e1' },
  { id: 'showroom', labelKey: 'showroom', color: '#eef2ff', border: '#c7d2fe' },
];

export default function GuestLanding({ onStartStudio, onRegister }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState('white');
  const [sliderPos, setSliderPos] = useState(48);
  const [activeThumb, setActiveThumb] = useState(0);
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="guest-landing gl-v2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <header className="gl-header">
        <div className="gl-brand">
          مشكور
          <small>MSHKUR CARS</small>
        </div>
        <div className="gl-header-actions">
          <button type="button" className="gl-language-toggle" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} aria-label={locale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}>
            {locale === 'en' ? 'عربي' : 'English'}
          </button>
          <button type="button" className="gl-login-pill" onClick={onRegister}>
            {t('guestLogin')}
          </button>
        </div>
      </header>

      <section className="gl-hero-copy">
        <span className="gl-kicker">
          <Sparkles size={13} /> {t('guestKicker')}
        </span>
        <h1>
          {t('guestTitleA')} <em>{t('guestTitleB')}</em>
        </h1>
        <p>
          {t('guestCopy')}
        </p>
      </section>

      <section className="gl-compare" aria-label="قبل وبعد">
        <div className="gl-compare-frame">
          <div className="gl-compare-after">
            <img src={DEMO.after} alt="بعد إزالة الخلفية" />
            <span className="gl-badge after">{t('after')}</span>
          </div>
          <div className="gl-compare-before" style={{ width: `${sliderPos}%` }}>
            <img src={DEMO.before} alt="الصورة الأصلية" />
            <span className="gl-badge before">{t('before')}</span>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="gl-compare-range"
            aria-label={t('compare')}
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
        <div className="gl-section-label">{t('studioTemplates')}</div>
        <div className="gl-template-row">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`gl-template ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <span
                className="gl-template-swatch"
                style={{ background: template.color, borderColor: template.border }}
              />
              <small>{t(template.labelKey)}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="gl-actions">
        <button type="button" className="gl-btn-primary" onClick={onStartStudio}>
          <WandSparkles size={18} />
          {t('startPreparing')}
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="gl-btn-secondary" onClick={onStartStudio}>
          <Camera size={16} />
          {t('directCapture')}
        </button>
      </div>

      <aside className="gl-assistant-card">
        <div className="gl-assistant-avatar">
          <Bot size={22} />
        </div>
        <div className="gl-assistant-body">
          <b>{t('assistantName')}</b>
          <p>{t('assistantCopy')}</p>
        </div>
        <button type="button" className="gl-assistant-go" onClick={onStartStudio}>
          {t('start')}
        </button>
      </aside>

      <section className="gl-how">
        <h2>{t('howItWorks')}</h2>
        <ol>
          <li><strong>{t('stepUpload')}</strong> {t('stepUploadCopy')}</li>
          <li><strong>{t('stepChoose')}</strong> {t('stepChooseCopy')}</li>
          <li><strong>{t('stepReview')}</strong> {t('stepReviewCopy')}</li>
        </ol>
        <div className="gl-trust">
          <ShieldCheck size={15} />
          {t('localTrust')}
        </div>
      </section>

      <div className="gl-footer-actions">
        <button type="button" className="gl-btn-primary wide" onClick={onRegister}>
          {t('createWorkspace')}
        </button>
        <button type="button" className="gl-btn-ghost" onClick={onStartStudio}>
          {t('tryWithoutAccount')}
        </button>
      </div>
    </div>
  );
}
