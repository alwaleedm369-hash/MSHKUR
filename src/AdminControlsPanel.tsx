/**
 * AdminControlsPanel — إخفاء المساعد · واتساب · هوية حراج · علامة التصدير
 */
import { useEffect, useState } from 'react';
import { Settings2, Eye, EyeOff, ShieldCheck, Sparkles, Save, ExternalLink, Link2 } from 'lucide-react';
import { isFreeWatermarkEnabled, setFreeWatermarkEnabled } from './mshkurWatermark';

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
  const [wmEnabled, setWmEnabled] = useState(true);

  useEffect(() => {
    setWmEnabled(isFreeWatermarkEnabled());
  }, []);

  function toggleWm() {
    const next = !wmEnabled;
    setWmEnabled(next);
    setFreeWatermarkEnabled(next);
  }

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
    <div dir="rtl" style={{ padding: 16, maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '4px 0' }}>التحكم والتخصيص</h2>
          <small>المساعد · العلامة · واتساب · هوية حراج</small>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color="#1d4942" />
            <div>
              <b style={{ fontSize: 13 }}>علامة مشكور على التصدير المجاني</b>
              <div style={{ fontSize: 11, color: '#7a8b82' }}>
                توقيع صغير أسفل الصورة فقط — لا يغيّر العزل ولا المعاينة. يمكن إيقافها للمدفوع.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleWm}
            style={{
              border: 0,
              background: wmEnabled ? '#edf5ef' : '#f4f4f4',
              color: wmEnabled ? '#1d4942' : '#888',
              borderRadius: 20,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {wmEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            {wmEnabled ? 'مفعّلة' : 'معطّلة'}
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
          <HarajIcon />
          <div>
            <b style={{ fontSize: 13 }}>هوية حراج</b>
            <div style={{ fontSize: 11, color: '#7a8b82' }}>ربط حساب/معرّف للتسجيل اليدوي والتدريب</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={harajId}
            onChange={(e) => setHarajId(e.target.value)}
            placeholder="معرّف أو رابط صفحة حراج"
            style={{ flex: 1, height: 40, border: '1px solid #e5ebe6', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
          />
          <button type="button" onClick={saveHaraj} style={{ height: 40, padding: '0 14px', border: 0, borderRadius: 8, background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Link2 size={14} /> حفظ
          </button>
        </div>
        {harajSaved && <small style={{ color: '#3d6b55', fontSize: 11 }}>تم حفظ الهوية</small>}
        <a href={HARAJ_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: '#0d9488' }}>
          <ExternalLink size={14} /> فتح حراج للتسجيل
        </a>
      </article>
    </div>
  );
}
