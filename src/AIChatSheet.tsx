/**
 * AIChatSheet.tsx — مساعد مشكور العائم
 * Bottom Sheet غير مزاحم لمنطقة العمل
 * يمكن إخفاؤه من شاشة الأدمن
 */
import { useState } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { useLocale } from './i18n';

type Props = {
  open: boolean;
  onClose: () => void;
  onSend?: (text: string) => Promise<string> | string;
};

const SUGGESTIONS = {
  en: [
    'Remove the background and add a contact shadow',
    'Write a listing draft for this vehicle',
    'What is the next recommended step?',
    'Blur plates in the selected photos',
  ],
  ar: [
    'أزل الخلفية وأضف ظل تماس',
    'اكتب مسودة إعلان لهذه السيارة',
    'ما الخطوة التالية المقترحة؟',
    'طمس اللوحات في الصور الحالية',
  ],
};

export default function AIChatSheet({ open, onClose, onSend }: Props) {
  const { locale } = useLocale();
  const en = locale === 'en';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: en ? 'Hi, I am MSHKUR Assistant. Ask for help preparing a vehicle or listing.' : 'مرحباً، أنا مساعد مشكور. اطلب أي مهمة متعلقة بتجهيز السيارة أو الإعلان.' },
  ]);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setBusy(true);
    try {
      const reply = onSend ? await onSend(msg) : (en ? 'Request received. Local workflow processing will be available when configured.' : 'تم استلام طلبك. سيتم ربطه بـ Maestro قريباً.');
      setMessages((m) => [...m, { role: 'assistant', text: String(reply) }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: en ? 'The request could not be completed. Try again.' : 'تعذر تنفيذ الطلب حالياً. حاول مرة أخرى.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="publish-sheet-overlay" onClick={onClose}>
      <div className="publish-sheet ai-chat-sheet" onClick={(e) => e.stopPropagation()} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="publish-sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#1d4942" />
            <b style={{ fontSize: 14 }}>{en ? 'MSHKUR Assistant' : 'مساعد مشكور'}</b>
          </div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'none', color: '#8a9a93' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 12, display: 'grid', gap: 8 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                lineHeight: 1.6,
                background: m.role === 'user' ? '#edf5ef' : '#f4f7f5',
                color: '#2a3e35',
                justifySelf: m.role === 'user' ? 'start' : 'stretch',
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {SUGGESTIONS[locale].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              style={{
                border: '1px solid #d5e2d8',
                background: '#fff',
                borderRadius: 20,
                padding: '5px 10px',
                fontSize: 10,
                color: '#3d6b55',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={en ? 'Type your request...' : 'اكتب طلبك...'}
            style={{
              flex: 1,
              height: 42,
              border: '1px solid #e5ebe6',
              borderRadius: 10,
              padding: '0 12px',
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            style={{
              width: 42,
              height: 42,
              border: 0,
              borderRadius: 10,
              background: '#1d4942',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
