# خطة التنفيذ النهائية — مشكور MSHKUR

تاريخ: 2026-11-19  
المصدر: مستودع GitHub + carAI.zip + تقارير الجلسات السابقة  
القاعدة: **لا تصاميم متفرقة جديدة · لا مهارات نصية بلا تشغيل · أداة أولاً · راجع ووافق**

---

## 1) تقرير موحّد (الوضع الحالي)

### ما يعمل على `main`
| المكوّن | الوظيفة |
|---------|--------|
| GuestLanding v2 | دخول زائر · قبل/بعد · قوالب · ابدأ |
| CarAdWorkflow | رفع → معالجة → خطوة تالية → مسودة → موافقة |
| CommercialShell | زر عائم + شات + بطاقة نشر |
| PublishBottomSheet | واتساب wa.me + موافقة |
| AdminControlsPanel | إخفاء المساعد + رقم واتساب |
| ApprovalQueue | قائمة المراجعات (من carAI HTML) |
| HarajPublishPanel | نشر حراج بعد موافقة (من carAI HTML) |
| skills حقيقية | background-remove, image-optimize, license-plate-blur-region, vehicle-ad-copy, vehicle-validate |
| workflows | vehicle-ad-draft |

### ما جاء من carAI (مفيد فقط)
| المصدر | التحويل |
|--------|--------|
| Approval_List.html | → ApprovalQueue.tsx |
| Haraj_Publish.html | → HarajPublishPanel.tsx |
| Mobile_Screens.html | منطبق جزئياً على GuestLanding + CarAdWorkflow |
| skills 01–30 نصية | لا تُنسخ كملفات فارغة — backlog في المرحلة D |
| claude-*.zip إعدادات | يُتجاهل |

### ما لا يُنفَّذ الآن
- 30 مهارة markdown بلا محرك
- لوحات تسويقية مطابقة 1:1 لموكبات PDF
- DMS / API حراج مدفوع

---

## 2) مسار المنتج (ثلاث طبقات)
1. أدوات (دخول): إزالة خلفية · طمس لوحة · تجهيز إعلان · نشر حراج بعد موافقة
2. مشروع السيارة: أصول + سجل + مسودات
3. إدارة: موافقات · إخفاء المساعد · واتساب · حدود لاحقاً

---

## 3) مراحل التنفيذ

### A — واجهة الدخول + تحويل carAI (هذا الالتزام)
- [x] GuestLanding v2 + CarAdWorkflow
- [x] ApprovalQueue + HarajPublishPanel
- [x] ربط في App (مهام / إدارة)

### B — تشغيل حقيقي (أولوية)
1. ربط onRemoveBackground بـ background-remove / bg0
2. طمس اللوحة خطوة اختيارية في السير
3. تمرير ناتج الإعلان إلى ApprovalQueue ثم HarajPublishPanel
4. اختبار جوال: رفع → نتيجة → موافقة → wa.me

### C — تشغيل تجاري محدود
1. حد يومي مجاني
2. Google Sign-In فقط
3. حفظ اختياري Google Drive
4. شاشة إدارة كاملة للموافقات

### D — لاحقاً
360 / OCR / فيديو / DMS / باقات — بعد اكتمال B و C

---

## 4) قاعدة المهارات
مهارة مسموحة فقط إن وُجد entrypoint تشغيل أو workflow أو استدعاء UI.
قائمة carAI النصية = backlog فقط.

أولوية التحويل لنص→تشغيل:
1. background / plate (جزئياً موجود)
2. haraj assist (UI جاهز)
3. ad copy / validate (موجود)

---

## 5) جاهزية المعاينة (Google AI Studio)
- استيراد main من GitHub
- GuestLanding → CarAdWorkflow عند ابدأ
- مراجعات + حراج داخل التطبيق

## جاهزية تشغيل محدود
- المرحلة B + حد يومي + موافقة قبل أي مشاركة خارجية

## الاسم
مشكور (MSHKUR) — تجهيز صور وإعلانات السيارات.
