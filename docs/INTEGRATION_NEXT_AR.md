# دليل التكامل السريع — ما تبقى لربط كل شيء في App.tsx

## الملفات الجديدة الجاهزة

- `src/GuestLanding.tsx`
- `src/PublishBottomSheet.tsx`
- `src/AIChatSheet.tsx`
- `src/AdminControlsPanel.tsx`
- `src/styles-guest-landing.css`

## في main.tsx

أضف:
```ts
import './styles-guest-landing.css';
```

## في App.tsx — الحالة المطلوبة

```ts
const [aiFloatVisible, setAiFloatVisible] = useState(true);
const [aiChatOpen, setAiChatOpen] = useState(false);
const [publishOpen, setPublishOpen] = useState(false);
const [whatsappNumber, setWhatsappNumber] = useState('');
```

## الاستيراد

```ts
import GuestLanding from './GuestLanding';
import PublishBottomSheet from './PublishBottomSheet';
import AIChatSheet from './AIChatSheet';
import AdminControlsPanel from './AdminControlsPanel';
import { MessageCircle } from 'lucide-react';
```

## عرض GuestLanding للزائر

عندما `!user && guestMode` اعرض:
```tsx
<GuestLanding
  onStartStudio={() => { setGuestMode(false); setScreen('studio'); }}
  onRegister={() => setAuthMode('register')}
/>
```

## الزر العائم + الشيتات

```tsx
{aiFloatVisible && (
  <button className="ai-float-btn" onClick={() => setAiChatOpen(true)} aria-label="المساعد">
    <MessageCircle size={22} />
  </button>
)}

<AIChatSheet open={aiChatOpen} onClose={() => setAiChatOpen(false)} />

<PublishBottomSheet
  open={publishOpen}
  carTitle={...}
  whatsappNumber={whatsappNumber}
  onApprove={() => { /* تسجيل موافقة ثم نشر */ setPublishOpen(false); }}
  onClose={() => setPublishOpen(false)}
/>
```

## شاشة الأدمن

في `screen === 'admin'` أضف:
```tsx
<AdminControlsPanel
  aiFloatVisible={aiFloatVisible}
  onToggleAiFloat={setAiFloatVisible}
  whatsappNumber={whatsappNumber}
  onSaveWhatsapp={setWhatsappNumber}
/>
```

## ملاحظة

App.tsx كبير جداً. التغييرات أعلاه محدودة ولا تكسر المنطق الحالي. بعد الدمج اختبر:
1. الزائر يرى GuestLanding
2. الزر العائم يظهر/يختفي من الأدمن
3. بطاقة النشر تعمل مع موافقة
