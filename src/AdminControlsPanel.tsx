/**
 * AdminControlsPanel.tsx
 * شاشة الأدمن: إخفاء المساعد العائم، تخصيص، تدريب بسيط، حدود الاستخدام
 */
import { useState } from 'react';
import { Settings2, Eye, EyeOff, ShieldCheck, Sparkles, Save } from 'lucide-react';

type Props = {
  aiFloatVisible: boolean;
  onToggleAiFloat: (visible: boolean) => void;
  whatsappNumber: string;
  onSaveWhatsapp: (num: string) => void;
};

export default function AdminControlsPanel({
  aiFloatVisible,
  onToggleAiFloat,
  whatsappNumber,
  onSaveWhatsapp,
}: Props) {
  const [wa, setWa] = useState(whatsappNumber || '');
  const [saved, setSaved] = useState(false);

  function saveWa() {
    onSaveWhatsapp(wa.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="ops-panel" dir="rtl" style={{ padding: 16 }}>
      <div className="ops-heading" style={{ marginBottom: 16 }}>
        <div>
          <span>مركز المالك</span>
          <h2 style={{ margin: '4px 0' }}>التحكم والتخصيص</h2>
          <small>كل إعدادات التجربة من هنا</small>
        </div>
        <Settings2 size={20} />
      </div>

      <article style={{ background: '#fff', border: '1px solid #e8eeea', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#1d4942" />
            <div>
              <b style={{ fontSize: 13 }}>زر المساعد العائم</b>
              <div style={{ fontSize: 11, color: '#7a8b82' }}>إظهار أو إخفاء المساعد الذكي في كل الشاشات</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleAiFloat(!aiFloatVisible)}
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
        <p style={{ fontSize: 11, color: '#8a9a93', marginTop: 8 }}>يُستخدم فقط لروابط wa.me. لا يوجد إرسال تلقائي.</p>
      </article>

      <article style={{ background: '#f8faf9', border: '1px solid #e8eeea', borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <ShieldCheck size={16} color="#5a8a72" />
          <div style={{ fontSize: 12, color: '#4a5c54', lineHeight: 1.7 }}>
            <b>التدريب والتخصيص</b>
            <br />
            المساعد يعتمد حالياً على قواعد محلية + Maestro. يمكن لاحقاً إضافة جمل تدريب مخصصة من هنا دون ربط نماذج مدفوعة إجبارياً.
          </div>
        </div>
      </article>
    </section>
  );
}
