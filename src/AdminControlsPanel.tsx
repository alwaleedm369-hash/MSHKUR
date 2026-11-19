/**
 * AdminControlsPanel — إخفاء المساعد · واتساب · هوية حراج · تدريب
 */
import { useEffect, useState } from 'react';
import { Settings2, Eye, EyeOff, ShieldCheck, Sparkles, Save, ExternalLink, Link2 } from 'lucide-react';

type Props = {
  aiFloatVisible: boolean;
  onAiFloatChange?: (visible: boolean) => void;
  onToggleAiFloat?: (visible: boolean) => void;
  whatsappNumber: string;
  onWhatsappChange?: (num: string) => void;
  onSaveWhatsapp?: (num: string) => void;
  harajIdentity?: string;
  onHarajIdentityChange?: (value: string) => void;
};

const HARAJ_URL = 'https://haraj.com.sa';
const IDENTITY_KEY = 'mshkur_haraj_identity_v1';

function HarajIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0d9488" />
      <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="Tahoma, Arial, sans-serif">
        ح
      </text>
    </svg>
  );
}

export default function AdminControlsPanel({
  aiFloatVisible,
  onAiFloatChange,
  onToggleAiFloat,
  whatsappNumber,
  onWhatsappChange,
  onSaveWhatsapp,
  harajIdentity,
  onHarajIdentityChange,
}: Props) {
  const [wa, setWa] = useState(whatsappNumber || '');
  const [saved, setSaved] = useState(false);
  const [harajId, setHarajId] = useState(harajIdentity || '');
  const [harajSaved, setHarajSaved] = useState(false);

  useEffect(() => {
    if (!harajIdentity) {
      try {
        setHarajId(localStorage.getItem(IDENTITY_KEY) || '');
      } catch {
        /* ignore */
      }
    } else {
      setHarajId(harajIdentity);
    }
  }, [harajIdentity]);

  function toggleAi() {
    const next = !aiFloatVisible;
    onAiFloatChange?.(next);
    onToggleAiFloat?.(next);
  }

  function saveWa() {
    const v = wa.trim();
    onWhatsappChange?.(v);
    onSaveWhatsapp?.(v);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveHaraj() {
    const v = harajId.trim();
    try {
      localStorage.setItem(IDENTITY_KEY, v);
    } catch {
      /* ignore */
    }
    onHarajIdentityChange?.(v);
    setHarajSaved(true);
    setTimeout(() => setHarajSaved(false), 2000);
  }

  return (
    <section className="ops-panel" dir="rtl" style={{ padding: 16 }}>
      <div className="ops-heading" style={{ marginBottom: 16 }}>
        <div>
          <span>مركز المالك</span>
          <h2 style={{ margin: '4px 0' }}>التحكم والتخصيص</h2>
          <small>المساعد · واتساب · هوية حراج · تدريب النشر</small>
        </div>
        <Settings2 size={20} />
      </div>

      <article style={{ background: '#fff', border: '1px solid #e8eeea', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#1d4942" />
            <div>
              <b style={{ fontSize: 13 }}>زر المساعد العائم</b>
              <div style={{ fontSize: 11, color: '#7a8b82' }}>إظهار أو إخفاء المساعد في كل الشاشات</div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAi}
            style={{
              border: 0,
              background: aiFloatVisible ? '#edf5ef' : '#f4f4f4',
              color: aiFloatVisible ? '#1d4942' : '#888',
              borderRadius: 20,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {aiFloatVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            {aiFloatVisible ? 'ظاهر' : 'مخفي'}
          </button>
        </div>
      </article>

      <article style={{ background: '#fff', border: '1px solid #e8eeea', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <b style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>رقم واتساب للمعرض (wa.me)</b>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            placeholder="9665xxxxxxxx"
            dir="ltr"
            style={{ flex: 1, height: 40, border: '1px solid #e5ebe6', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
          />
          <button type="button" onClick={saveWa} style={{ height: 40, padding: '0 14px', border: 0, borderRadius: 8, background: '#1d4942', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Save size={14} /> حفظ
          </button>
        </div>
        {saved && <small style={{ color: '#3d6b55', fontSize: 11 }}>تم الحفظ</small>}
        <p style={{ fontSize: 11, color: '#8a9a93', marginTop: 8 }}>روابط wa.me فقط — لا إرسال تلقائي.</p>
      </article>

      <article style={{ background: '#fff', border: '1px solid #e8eeea', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <HarajIcon size={28} />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13 }}>هوية حراج</b>
            <div style={{ fontSize: 11, color: '#7a8b82' }}>أيقونة الموقع · تسجيل · ربط بالحساب</div>
          </div>
          <a
            href={HARAJ_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: '#0d9488',
              textDecoration: 'none',
              background: '#ecfdf5',
              padding: '6px 10px',
              borderRadius: 999,
            }}
          >
            <ExternalLink size={14} /> فتح حراج
          </a>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#3d534c', display: 'block', marginBottom: 6 }}>
          معرّف / جوال حساب حراج (يُحفظ في الهوية محلياً)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={harajId}
            onChange={(e) => setHarajId(e.target.value)}
            placeholder="اسم المستخدم أو 05xxxxxxxx"
            style={{ flex: 1, height: 40, border: '1px solid #e5ebe6', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
          />
          <button
            type="button"
            onClick={saveHaraj}
            style={{ height: 40, padding: '0 12px', border: 0, borderRadius: 8, background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}
          >
            <Link2 size={14} /> {harajSaved ? 'تم' : 'ربط'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#8a9a93', marginTop: 8 }}>
          لا يوجد API رسمي للنشر الآلي. المساعد يتدرّب على تكرار خطواتك بموافقتك، ثم يفتح حراج لتكمل يدوياً.
        </p>
      </article>

      <article style={{ background: '#f8faf9', border: '1px solid #e8eeea', borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <ShieldCheck size={16} color="#5a8a72" />
          <div style={{ fontSize: 12, color: '#4a5c54', lineHeight: 1.7 }}>
            <b>تدريب مساعد النشر</b>
            <br />
            كل موافقة على مسودة حراج تُحفظ كقالب محلي. «استخدم آخر نمط» يعيد التطبيق على سيارة جديدة دون نشر تلقائي.
          </div>
        </div>
      </article>
    </section>
  );
}
