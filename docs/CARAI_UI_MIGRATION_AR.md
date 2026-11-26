# استخراج carAI إلى MSHKUR main — سجل التحويل

## المصادر المستخرجة
- `MSHKUR_UI_Design.html`: مفهوم رفع الصورة ومعالجة الأداة وتوجيه المهمة. يُستخلص منه تدفق رفع/أداة، لا dashboard أو testimonials.
- `MSHKUR_Refined_UI.html`: شاشة موافقة بسيطة؛ تُراجع مقابل شاشة الموافقات الحالية ويُدمج ما يلزم فقط.
- `MSHKUR_Mobile_Screens.html`: تصور نتائج ومراجعة، يُستخلص منه الحالات والنتيجة، وليس نسخ شاشات HTML.
- `MSHKUR_Haraj_Publish.html`: رحلة نشر حراج، تؤجل إلى P1 بعد تثبيت المعالجة.
- `MSHKUR_Approval_List.html`: قائمة مراجعة، تستفيد منها شاشة الموافقات الحالية دون إنشاء قائمة ثانية.

## عناصر موجودة في main يجب أن تُراجع قبل تكرارها
- GuestLanding: استقبال Tool-first/مرئي.
- GuestStudio: رفع ومعالجة خلفية محلية (BG0) وتنزيل.
- CarAdWorkflow: رحلة تجهيز إعلان.
- ApprovalQueue وHarajPublishPanel: مراجعة ونشر مُعتمد.

## قواعد الدمج
1. لا نقل HTML كما هو.
2. تحويل العناصر إلى React/TypeScript components وCSS ضمن نظام main.
3. إزالة أي أزرار أو وظائف mock أو timer يوهم بعملية AI.
4. اعتماد source/after URLs أو blobs الناتجة من معالجة حقيقية فقط.
5. إعادة استخدام الموجود في main وعدم إنشاء نسخة موازية.
6. عند الحاجة إلى معالجة خادمية، يُحدد contract للـ API؛ المعالجة المحلية الحالية لا تُسمى API.
7. توثيق كل مكون تم نقله مع commit واختبار.

## سجل التحويل
| المصدر | الاستفادة | القرار |
|---|---|---|
| UI Design | upload/task-first | استخراج العناصر، وعدم نقل الصفحة كاملة |
| Refined UI | approval confirm | مراجعة دمجها في ApprovalQueue |
| Mobile Screens | result/review states | استخراج حالات فقط |
| Haraj Publish | listing workflow | P1 |
| Approval List | list/review | إعادة استخدام ApprovalQueue |
