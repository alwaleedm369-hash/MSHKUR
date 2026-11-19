/**
 * HarajPublishPanel — تجهيز نشر حراج مع تدريب مساعد + موافقة نهائية
 * من carAI/MSHKUR_Haraj_Publish — بدون نشر تلقائي
 */
import { useState } from 'react';
import { Check, ChevronLeft, Sparkles, ShieldCheck } from 'lucide-react';

type VehicleOpt = { id: string; title: string; price?: string; city?: string };

type Props = {
  vehicles?: VehicleOpt[];
  onBack?: () => void;
  onApprovedPublish?: (payload: {
    vehicleId: string;
    title: string;
    price: string;
    city: string;
    description: string;
  }) => void;
};

const DEMO_VEHICLES: VehicleOpt[] = [
  { id: '1', title: 'تويوتا كامري 2022', price: '85,000', city: 'الرياض' },
  { id: '2', title: 'هيونداي النترا 2021', price: '55,000', city: 'جدة' },
];

const STEPS = [
  'اختيار الفئة: سيارات مستعملة → سيارات خاصة',
  'تعبئة المواصفات: السنة، العداد، اللون، الحالة',
  'كتابة الوصف (المساعد يقترح)',
  'تحديد السعر حسب السوق',
  'المراجعة والموافقة قبل النشر',
];

export default function HarajPublishPanel({ vehicles, onBack, onApprovedPublish }: Props) {
  const list = vehicles?.length ? vehicles : DEMO_VEHICLES;
  const [selected, setSelected] = useState(list[0]?.id || '');
  const [title, setTitle] = useState(list[0]?.title || '');
  const [price, setPrice] = useState(list[0]?.price || '');
  const [city, setCity] = useState(list[0]?.city || 'الرياض');
  const [description, setDescription] = useState(
    'سيارة نظيفة، فحص دوري، جاهزة للتسليم. الصور مجهّزة عبر مشكور.'
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [trainLevel] = useState(3);

  function pick(v: VehicleOpt) {
    setSelected(v.id);
    setTitle(v.title);
    setPrice(v.price || '');
    setCity(v.city || '');
  }

  function submitApprove() {
    onApprovedPublish?.({
      vehicleId: selected,
      title,
      price,
      city,
      description,
    });
    setConfirmOpen(false);
  }

  return (
    <section className="haraj-panel" dir="rtl">
      <header className="hp-head">
        {onBack && (
          <button type="button" className="hp-back" onClick={onBack} aria-label="رجوع">
            <ChevronLeft size={18} />
          </button>
        )}
        <div>
          <h2>نشر على حراج</h2>
          <p>المساعد يقترح · أنت توافق</p>
        </div>
      </header>

      <div className="hp-train">
        <Sparkles size={16} />
        <div>
          <b>مساعد النشر</b>
          <small>مستوى التدريب: {trainLevel}/5 — يتعلم من تكرارك دون نشر تلقائي</small>
        </div>
      </div>

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
        <h3>خطوات يتذكرها المساعد</h3>
        <ol className="hp-steps">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="hp-section">
        <h3>مسودة الإعلان</h3>
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
          الوصف
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>

      <div className="hp-trust">
        <ShieldCheck size={15} />
        لن يُفتح رابط النشر أو يُرسل شيء دون ضغط «موافق ونشر»
      </div>

      <button type="button" className="hp-submit" onClick={() => setConfirmOpen(true)}>
        مراجعة قبل النشر
      </button>

      {confirmOpen && (
        <div className="hp-modal" role="dialog">
          <div className="hp-modal-card">
            <h3>الموافقة النهائية</h3>
            <p>
              <b>{title}</b>
              <br />
              {price} ريال · {city}
            </p>
            <p className="hp-desc">{description}</p>
            <button type="button" className="hp-submit" onClick={submitApprove}>
              <Check size={16} /> موافق ونشر
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
