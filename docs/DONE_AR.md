# إشعار انتهاء — مشكور commercial-0.4

تاريخ: 2026-11-18

## تم تطبيق App.tsx الكامل على الفرع

`src/App.tsx` الآن يتضمن:

- **GuestLanding** للزائر (قبل/بعد · قوالب · زر ابدأ)
- **GuestStudio** للتجربة السريعة
- **تسجيل دخول / إنشاء حساب** كامل
- **DashboardHome** + قائمة سيارات + إضافة سيارة
- **الاستوديو** + AssetHistoryPanel + OfflineAdKit
- **المهارات والمهام**
- **CommercialShell** (زر المساعد العائم + بطاقة النشر)
- **AdminControlsPanel** (إخفاء المساعد + واتساب wa.me)
- **OperationsPanel** للإدارة

## الملفات التجارية على الفرع

- src/GuestLanding.tsx
- src/PublishBottomSheet.tsx
- src/AIChatSheet.tsx
- src/AdminControlsPanel.tsx
- src/CommercialShell.tsx
- src/styles-guest-landing.css
- src/main.tsx (يستورد الـ CSS)
- src/App.tsx (BUILD commercial-0.4)

## للتشغيل

```bash
git checkout docs/mobile-and-commercial-launch
npm install
npm run dev
```

## ملاحظات

- واتساب: wa.me فقط
- لا API مدفوع إجباري
- المساعد قابل للإخفاء من شاشة الإدارة
- النسخة الأقدم الكاملة جداً محفوظة في artifacts/App.tsx.integrated-full إن احتجت كل دوال الطمس/التحسين القديمة سطراً بسطر
