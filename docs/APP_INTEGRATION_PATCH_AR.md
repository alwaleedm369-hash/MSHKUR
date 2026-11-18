# دمج المكونات الجديدة في App.tsx

## الملفات الجاهزة

- `GuestLanding.tsx`
- `PublishBottomSheet.tsx`
- `AIChatSheet.tsx`
- `AdminControlsPanel.tsx`
- `CommercialShell.tsx`
- `styles-guest-landing.css` (مستورد في main.tsx)

## التغييرات المطلوبة داخل App.tsx

### 1. الاستيراد
```ts
import GuestLanding from './GuestLanding';
import CommercialShell from './CommercialShell';
import AdminControlsPanel from './AdminControlsPanel';
```

### 2. الحالة
```ts
const [aiFloatVisible, setAiFloatVisible] = useState(true);
const [publishOpen, setPublishOpen] = useState(false);
const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('mshkur_wa') || '');
```

### 3. استبدال دخول الزائر (guestMode)
```tsx
if (guestMode && !user) {
  return (
    <GuestLanding
      onStartStudio={() => { setGuestMode(false); setQuickTool(true); }}
      onRegister={() => { setGuestMode(false); setAuthMode('register'); }}
    />
  );
}
```

### 4. لفّ مساحة العمل بعد تسجيل الدخول
```tsx
return (
  <CommercialShell
    aiFloatVisible={aiFloatVisible}
    whatsappNumber={whatsappNumber}
    publishOpen={publishOpen}
    onPublishClose={() => setPublishOpen(false)}
    onPublishApprove={() => { setMessage('تمت الموافقة على النشر'); setPublishOpen(false); }}
    onAssistantSend={async (text) => {
      try {
        const plan = await api('/api/assistant/plan', { method: 'POST', body: JSON.stringify({ request: text }) });
        return plan?.summary || 'تم تحليل الطلب';
      } catch { return 'تعذر الاتصال بالمساعد'; }
    }}
  >
    {/* المحتوى الحالي لـ workspace */}
  </CommercialShell>
);
```

### 5. شاشة الأدمن
```tsx
{screen === 'admin' && (user.role === 'owner' || user.role === 'admin') && (
  <>
    <AdminControlsPanel
      aiFloatVisible={aiFloatVisible}
      onToggleAiFloat={setAiFloatVisible}
      whatsappNumber={whatsappNumber}
      onSaveWhatsapp={(n) => { setWhatsappNumber(n); localStorage.setItem('mshkur_wa', n); }}
    />
    <OperationsPanel />
  </>
)}
```

بعد تطبيق هذه الخطوات يصبح المشروع متصلاً بالكامل.
