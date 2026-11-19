/**
 * HarajPublishPanel — نشر حراج بمساعدة ذكية + تدريب بشري + ربط الهوية
 * - أيقونة حراج + رابط تسجيل
 * - تكرار نمط إعلان سابق بعد موافقة
 * - لا نشر تلقائي بدون «موافق ونشر»
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Check, ChevronLeft, ExternalLink, Link2, Sparkles, ShieldCheck, BookOpen, Repeat2
} from 'lucide-react';

type VehicleOpt = { id: string; title: string; price?: string; city?: string };

export type HarajTrainingMemory = {
  category: string;
  descriptionTemplate: string;
  lastTitle?: string;
  lastPrice?: string;
  lastCity?: string;
  trainedCount: number;
  updatedAt: string;
};

type Props = {
  vehicles?: VehicleOpt[];
  onBack?: () => void;
  harajIdentity?: string;
  onSaveHarajIdentity?: (value: string) => void;
  onApprovedPublish?: (payload: {
    vehicleId: string;
    title: string;
    price: string;
    city: string;
    description: string;
    openHaraj: boolean;
  }) => void;
};

const HARAJ_URL = 'https://haraj.com.sa';
const HARAJ_REGISTER = 'https://haraj.com.sa';
const STORAGE_KEY = 'mshkur_haraj_train_v1';
const IDENTITY_KEY = 'mshkur_haraj_identity_v1';

const DEMO_VEHICLES: VehicleOpt[] = [
  { id: '1', title: 'تويوتا كامري 2022', price: '85,000', city: 'الرياض' },
  { id: '2', title: 'هيونداي النترا 2021', price: '55,000', city: 'جدة' },
];

const STEPS = [
  'اختيار الفئة: سيارات مستعملة → سيارات خاصة',
  'تعبئة المواصفات: السنة، العداد، اللون، الحالة',
  'كتابة الوصف (من تدريب سابق إن وُجد)',
  'تحديد السعر والمدينة',
  'مراجعتك وموافقة صريحة قبل أي فتح لحراج',
];

function loadMemory(): HarajTrainingMemory | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HarajTrainingMemory) : null;
  } catch {
    return null;
  }
}

function saveMemory(m: HarajTrainingMemory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

function HarajIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0d9488" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="#fff"
        fontFamily="Tahoma, Arial, sans-serif"
      >
        ح
      </text>
    </svg>
  );
}

export default function HarajPublishPanel({
  vehicles,
  onBack,
  harajIdentity: harajIdentityProp,
  onSaveHarajIdentity,
  onApprovedPublish,
}: Props) {
  const list = vehicles?.length ? vehicles : DEMO_VEHICLES;
  const [memory, setMemory] = useState<HarajTrainingMemory | null>(null);
  const [selected, setSelected] = useState(list[0]?.id || '');
  const [title, setTitle] = useState(list[0]?.title || '');
  const [price, setPrice] = useState(list[0]?.price || '');
  const [city, setCity] = useState(list[0]?.city || 'الرياض');
  const [description, setDescription] = useState(
    'سيارة نظيفة، فحص دوري، جاهزة للتسليم. الصور مجهّزة عبر مشكور.'
  );
  const [category, setCategory] = useState('سيارات مستعملة / سيارات خاصة');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [identity, setIdentity] = useState('');
  const [identitySaved, setIdentitySaved] = useState(false);
  const [usePrior, setUsePrior] = useState(false);

  useEffect(() => {
    setMemory(loadMemory());
    const id = harajIdentityProp || localStorage.getItem(IDENTITY_KEY) || '';
    setIdentity(id);
  }, [harajIdentityProp]);

  const trainLevel = useMemo(() => {
    const n = memory?.trainedCount || 0;
    return Math.min(5, Math.max(1, 1 + Math.floor(n / 2)));
  }, [memory]);

  function pick(v: VehicleOpt) {
    setSelected(v.id);
    setTitle(v.title);
    setPrice(v.price || '');
    setCity(v.city || '');
  }

  function applyPriorTraining() {
    if (!memory) return;
    setUsePrior(true);
    setCategory(memory.category || category);
    if (memory.descriptionTemplate) {
      const filled = memory.descriptionTemplate
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{city\}\}/g, city || memory.lastCity || '')
        .replace(/\{\{price\}\}/g, price || memory.lastPrice || '');
      setDescription(filled);
    }
    if (!price && memory.lastPrice) setPrice(memory.lastPrice);
    if (!city && memory.lastCity) setCity(memory.lastCity);
  }

  function saveIdentity() {
    const v = identity.trim();
    try {
      localStorage.setItem(IDENTITY_KEY, v);
    } catch {
      /* ignore */
    }
    onSaveHarajIdentity?.(v);
    setIdentitySaved(true);
    setTimeout(() => setIdentitySaved(false), 2000);
  }

  function submitApprove() {
    const template =
      description.includes(title)
        ? description.replace(title, '{{title}}')
        : `${description}\n\n{{title}} — {{city}} — {{price}}`;

    const next: HarajTrainingMemory = {
      category,
      descriptionTemplate: template,
      lastTitle: title,
      lastPrice: price,
      lastCity: city,
      trainedCount: (memory?.trainedCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    saveMemory(next);
    setMemory(next);

    onApprovedPublish?.({
      vehicleId: selected,
      title,
      price,
      city,
      description,
      openHaraj: true,
    });
    setConfirmOpen(false);
    window.open(HARAJ_URL, '_blank', 'noopener,noreferrer');
  }

  return (
    <section className="haraj-panel" dir="rtl">
      <header className="hp-head">
        {onBack && (
          <button type="button" className="hp-back" onClick={onBack} aria-label="رجوع">
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="hp-brand-row">
          <HarajIcon size={32} />
          <div>
            <h2>نشر على حراج</h2>
            <p>تدريب بشري · تكرار ذكي · موافقة قبل الفتح</p>
          </div>
        </div>
      </header>

      <div className="hp-identity">
        <div className="hp-identity-top">
          <HarajIcon size={22} />
          <div>
            <b>ربط هوية حراج</b>
            <small>أيقونة الموقع للتسجيل وإضافته لهوية المعرض</small>
          </div>
          <a className="hp-haraj-link" href={HARAJ_REGISTER} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> تسجيل / دخول حراج
          </a>
        </div>
        <label className="hp-id-field">
          معرّف أو جوال حساب حراج (اختياري)
          <div className="hp-id-row">
            <input
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="مثال: اسم المستخدم أو 05xxxxxxxx"
              dir="auto"
            />
            <button type="button" className="hp-id-save" onClick={saveIdentity}>
              <Link2 size={14} /> {identitySaved ? 'تم الحفظ' : 'حفظ للهوية'}
            </button>
          </div>
        </label>
      </div>

      <div className="hp-train">
        <Sparkles size={16} />
        <div style={{ flex: 1 }}>
          <b>مساعد النشر · مستوى التدريب {trainLevel}/5</b>
          <small>
            يتعلّم من إعلاناتك المعتمدة سابقاً. لا ينشر وحده — يكرر النمط بعد موافقتك.
            {memory?.trainedCount
              ? ` · ${memory.trainedCount} مرة تدريب محفوظة`
              : ' · لا يوجد تدريب بعد — أول موافقة تبدأ الذاكرة'}
          </small>
        </div>
        {memory && (
          <button type="button" className="hp-prior-btn" onClick={applyPriorTraining}>
            <Repeat2 size={14} /> استخدم آخر نمط
          </button>
        )}
      </div>

      {usePrior && memory && (
        <div className="hp-prior-hint">
          <BookOpen size={14} />
          طُبّق قالب التدريب السابق (الفئة: {memory.category}). راجع النص قبل الموافقة.
        </div>
      )}

      <div className="hp-section">
        <h3>اختر السيارة</h3>
        <div className="hp-vehicles">
          {list.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`hp-vehicle ${selected === v.id ? 'on' : ''}`}
              onClick={() => pick(v)}
            >
              <b>{v.title}</b>
              <small>
                {v.price ? `${v.price} ريال` : ''} {v.city ? `· ${v.city}` : ''}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className="hp-section">
        <h3>خطوات يتعلّمها المساعد بالتكرار</h3>
        <ol className="hp-steps">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="hp-section">
        <h3>مسودة الإعلان</h3>
        <label>
          الفئة على حراج
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <label>
          العنوان
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="hp-row">
          <label>
            السعر
            <input value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            المدينة
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>
        <label>
          الوصف (يُحفظ كقالب تدريب بعد الموافقة)
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>

      <div className="hp-trust">
        <ShieldCheck size={15} />
        بعد «موافق ونشر» فقط: يُحفظ التدريب ويُفتح موقع حراج — أنت من يكمل الإعلان هناك.
      </div>

      <button type="button" className="hp-submit" onClick={() => setConfirmOpen(true)}>
        <HarajIcon size={18} /> مراجعة والموافقة على فتح حراج
      </button>

      {confirmOpen && (
        <div className="hp-modal" role="dialog">
          <div className="hp-modal-card">
            <div className="hp-modal-brand">
              <HarajIcon size={28} />
              <h3>الموافقة النهائية</h3>
            </div>
            <p>
              <b>{title}</b>
              <br />
              {price} ريال · {city}
              <br />
              <small>{category}</small>
            </p>
            <p className="hp-desc">{description}</p>
            <p className="hp-modal-note">
              سيتم: 1) حفظ هذا النمط لتدريب المساعد 2) فتح haraj.com.sa في نافذة جديدة
            </p>
            <button type="button" className="hp-submit" onClick={submitApprove}>
              <Check size={16} /> موافق · درّب وافتح حراج
            </button>
            <button type="button" className="hp-cancel" onClick={() => setConfirmOpen(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
