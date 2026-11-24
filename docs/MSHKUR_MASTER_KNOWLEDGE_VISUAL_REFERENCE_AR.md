# MSHKUR — المرجع المركزي الموحد للمنتج والهندسة والبحث والمراجع المرئية

> **الغرض:** هذه الوثيقة هي نقطة الرجوع الأساسية بعد أرشفة/تنظيف المحادثات. تجمع القرارات والمواصفات والمصادر المعروفة وحالة المستودعات وخطة البحث والواجهات. لا تعني أن كل ميزة أو مصدر قد نُفّذ أو اختُبر.  
> **تاريخ المراجعة:** 24 نوفمبر 2026  
> **المستودع الأساسي:** https://github.com/alwaleedm369-hash/MSHKUR  
> **فرع إعداد هذه الوثيقة:** `docs/unified-knowledge-visual-reference`  
> **قاعدة الدمج:** لا تعديل مباشر على `main` قبل مراجعة الفروقات والاختبارات.

---

## 0. كيف نستخدم هذا المرجع؟

- اقرأ هذا الملف أولاً، ثم انتقل إلى الوثيقة المتخصصة المرتبطة بكل موضوع.
- اعتبر `main` والكود والاختبارات الحالية مصدر الحقيقة لحالة التنفيذ، لا المحادثات أو الصور أو الوعود.
- المحادثات مصدر لتاريخ النية والقرارات والتطورات، وليست دليلاً على أن الكود موجود.
- كل عنصر يحمل حالة واضحة: **IMPLEMENTED** موجود بالكود، **TESTED** اجتاز اختباراً محدداً، **PROPOSED** اقتراح، **RESEARCH** مرجع للدراسة، **HOLD** متوقف حتى حل شرط، **NOT ACCESSIBLE** لم نستطع فحصه.
- لا تحذف الأفكار المتشابهة. سجلها كنسخ/تطورات مع توضيح ما تغيّر ولماذا.
- هذا المستند يغطي ما أمكن الوصول إليه في المحادثات والسياق المتاح ومستودعات GitHub العامة/المصرح بها في جلسة المراجعة؛ لا يدّعي قراءة كل محادثة تاريخية أو مستودع خاص غير متاح.

## 1. الهوية والمنتج

**MSHKUR / مشكور** منصة عمل عربية لإنجاز أعمال السيارات والمعارض من المهمة إلى النتيجة. ليست لوحة تحكم تقنية ولا سوقاً لأسماء النماذج. يدخل المستخدم ليؤدي مهمة مباشرة، بينما تعمل المهارات والمساعدون وMaestro والبحث والتكاملات في الخلفية.

الوعد: **ارفع صور السيارة مرة واحدة → جهّزها → راجعها → جهّز إعلانها → احفظها أو صدّرها أو شاركها بموافقتك.**

### 1.1 مبادئ المنتج الثابتة

1. الأداة والنتيجة أولاً؛ لا تبدأ التجربة بلوحة تحكم مزدحمة أو شروحات طويلة.
2. العربية RTL وMobile-first، مع دعم سطح المكتب وLTR عند الحاجة.
3. واجهة فاتحة هادئة؛ الصورة والنتيجة هما محور الشاشة.
4. لا تطلب التسجيل قبل أول تجربة ممكنة؛ الحساب مطلوب لحفظ مشروع دائم أو وظيفة تتطلب هوية.
5. السيارة/المشروع هو السياق المشترك الذي يحمل الصور والبيانات والنتائج والإعلان والموافقات.
6. لا تعِد طلب رفع الصورة عند الانتقال بين الأدوات.
7. لا تستبدل الأصل أبداً؛ كل تعديل مشتق مستقل ومرتبط بالأصل الجذري.
8. لا تخترع مواصفات أو سعر أو حالة سيارة. النص الإعلاني يبنى من حقائق مؤكدة فقط.
9. لا API مدفوع شرطاً للمسار الأساسي؛ لا fallback سحابي مدفوع صامت.
10. لا تعرض وظيفة على أنها متصلة أو تلقائية قبل تنفيذ handshake/اختبار فعلي.
11. النشر والإرسال والمشاركة والحذف والشراء وأي أثر خارجي يتطلب موافقة صريحة على المحتوى والوجهة والنسخة المحددة.
12. المهارات والمساعدون والبحث والهندسة العكسية ليست إضافات لاحقة؛ إنها جزء من طريقة بناء وتشغيل وتطوير المنتج من البداية.

### 1.2 المنتجات الظاهرة والطبقات الداخلية

**الواجهة المقصودة للمستخدم:** ثلاثة تطبيقات سيارات مترابطة + تطبيق مساعد شخصي عام يعمل داخل أي تطبيق.

1. **MSHKUR Studio / استوديو الصور:** إزالة الخلفية، KeepOriginal، تحسين، قص، طمس اللوحة، الزجاج، المشاهد، الظلال، المقارنة والتصدير.
2. **MSHKUR Ads / استوديو الإعلان:** بيانات السيارة المؤكدة، تجهيز صور الإعلان، قوالب، مسودات، مراجعة، حزم تصدير.
3. **MSHKUR Dealer / المعرض والتاجر:** السيارات والمخزون، صفحات المعرض والسيارات، العملاء والاستفسارات والفريق والمتابعة.
4. **MSHKUR Assistant / المساعد العام:** مساعد عام داخل أي تطبيق، يفهم المهمة ويستدعي المهارات والأدوات المسموحة ويعيد نتيجة موحدة.
5. **Admin Smart Browser / متصفح الإدارة الذكي:** تطبيق مصغر داخلي محتمل (خامس) للإدارة والبحث والتنفيذ المصرح به؛ ليس واجهة يومية للمستخدم ولا جزءاً مفروضاً من الإصدار الأول.

**خلف الكواليس:** Maestro، المهارات، المساعدون المتخصصون، محرك البحث واكتشاف المشاريع، REA، MCP، محركات الصور، سجل المصادر، الاختبارات، التقييم، الأمان، الموصلات، والموافقات. لا نعرض هذه التعقيدات للمستخدم العادي.

> فرق مهم عن تصورات أقدم: ذُكرت سابقاً ستة منتجات مصغرة تشمل Growth وConnect. التصنيف الأحدث يثبت 3 تطبيقات سيارات + مساعد عام، مع متصفح الإدارة كتطبيق داخلي محتمل. وظائف Growth وConnect تبقى قدرات/وحدات داخلية قابلة للظهور لاحقاً، وليست تطبيقات أساسية إضافية الآن.

## 2. القرارات المتطورة والفروقات — لا نحذف التكرار

| الموضوع | الفكرة/النسخة الأقدم | التوضيح/القرار الأحدث |
|---|---|---|
| نقطة الدخول | صفحة استقبال فيها شرح وبطاقات أدوات | فتح مباشر على المهمة/الاستوديو؛ الشروحات والأمثلة أسفل منطقة العمل |
| لوحة التحكم | Dashboard رئيسية واسعة | الإدارة خلفية؛ مساحة العمل وآخر مشروع سيارة هي البداية |
| المنتجات | أدوات كثيرة أو ستة منتجات مصغرة | 3 تطبيقات سيارات + مساعد عام؛ متصفح الإدارة احتمال خامس داخلي |
| المهارات | إضافات قابلة للتحميل لاحقاً | أساس بناء وتشغيل وتطوير المشروع؛ لكل وظيفة skill/handler واختبارات |
| المساعدون | دردشة أو شخصيات ثابتة | موظفون متخصصون يُستدعون عند الحاجة؛ ليسوا عمليات دائمة تستهلك الموارد |
| البحث | قائمة روابط ثابتة | بحث حي ومستمر في GitHub والمكتبات والمراجع والديموهات، ثم تقييم واختيار |
| الهندسة العكسية | نسخ تجربة أداة | تفكيك السلوك والوظيفة والأدلة ثم إعادة تنفيذ مستقلة ومشروعة |
| إزالة الخلفية | زر واحد/محرك واحد | مسار مركب: segmentation + matting/refinement + edge cleanup + correction + compositing + QA |
| `removebackground/` | أداة إزالة خلفية | نية/عملية وظيفية قابلة للتنفيذ بأفضل محرك متاح محلياً أو مرخصاً |
| `KeepOriginal/` | حفظ الأصل | قاعدة بيانات/ملفات: الأصل immutable، وكل نتيجة Derived لها parent/version/provenance |
| واتساب | رغبة في Web/QR وقنوات دون Meta API مدفوع | المسار الحالي الآمن: wa.me وفتح يدوي. أي ربط جلسة/أتمتة غير رسمية ليس ضماناً وموقوف حتى مراجعة شروط ومخاطر |
| Google | استخدام AI Studio أو خدمات Google | Google AI Studio ليس شرطاً للتصميم أو التطوير أو التشغيل؛ OAuth/Drive/Maps موصلات اختيارية |
| REA | قد يُفهم كمحرك تشغيل | أداة تطوير/بحث مستقلة، لا تُضمّن في runtime |
| النموذج | نموذج واحد ينجز كل شيء | اختيار حسب المهمة: قواعد حتمية، نموذج محلي، مكتبة CV، أو موصل اختياري؛ لا نحتاج LLM لكل وظيفة |
| الواجهة المرئية | صور مرجعية عامة | لكل أداة لقطة أصلية/ديمو/مدخل ومخرج/اختبار مشكور مع توضيح مصدر الصورة |
| دمج المشاريع | نسخ الفروع/المستودعات | مقارنة وانتقاء الوظائف، ثم port تدريجي واختبارات؛ لا دمج عشوائي |

### 2.1 قاعدة إزالة الخلفية المختصرة ذات الجودة العالية

لا نفترض أن أفضل نتيجة تتطلب API مدفوعاً أو skill ضخمة. على النموذج أن يبحث عن أقصر pipeline يحقق معيار الجودة المطلوب:

- **المسار السريع:** نموذج محلي/متصفح ينتج mask جيداً + قص alpha + تصدير.
- **المسار المحسّن:** segmentation → trimap/matting/refinement → إزالة هالات الألوان → الحفاظ على الظل أو توليده كطبقة مستقلة → QA.
- **المسار التصحيحي:** brush add/remove، edge feather، refine، zoom، undo/redo.
- **المسار الهجين:** اختيار محرك خفيف للصور السهلة، ومحرك أقوى للصور الصعبة فقط.
- **المسار البديل:** OpenCV/عمليات هندسية/قص يدوي عند عدم توفر نموذج مناسب.

كل اختيار يتقرر من قياس الجودة والوقت والذاكرة والحجم والترخيص، لا من اسم الأداة. لا يجوز وصف نتيجة مختصرة بأنها مساوية للأداة الكاملة إلا بعد benchmark بصري موثق على مجموعة سيارات ممثلة.

## 3. مستودعات المشروع — نتائج الفحص

### 3.1 MSHKUR الأساسي

- المستودع: https://github.com/alwaleedm369-hash/MSHKUR
- الفرع المرجعي الذي تمت قراءته: `main`
- الفرع الافتراضي: `main`
- الحالة العامة: مستودع عام، نواة React/TypeScript/Vite + Express + SQLite + skills + Maestro أولي.
- يحتوي على ملفات إرشاد للوكلاء: `AGENTS.md`, `GEMINI.md`, `README.md`.
- يحتوي على وثائق المنتج والهندسة والتدقيق والبحث والتراخيص والواجهات، ومجلدات `skills/`, `tools/rea/`, `tools/mcp/`, `tools/model-lab/`.

**ملفات مهمة موجودة بالفعل:**
- `docs/PROJECT_AUDIT_2026-11-23_AR.md`
- `docs/PRODUCT_BLUEPRINT_AR.md`
- `docs/ARCHITECTURE_AR.md`
- `docs/ENGINE_CORE_AR.md`
- `docs/CAR_IMAGE_ENGINE_SPEC_AR.md`
- `docs/ENGINE_SELECTION_BLUEPRINT_AR.md`
- `docs/OPEN_SOURCE_IMPORT_FACTORY_AR.md`
- `docs/OPEN_SOURCE_LICENSE_REGISTER_AR.md`
- `docs/RESEARCH_DECONSTRUCTION_PLAYBOOK_AR.md`
- `docs/RESEARCH_CAR_IMAGE_PIPELINES_AR.md`
- `docs/MAIN_SCREEN_SPYNE_CARFLOW_AR.md`
- `docs/MOBILE_SCREENS_AND_WHATSAPP_AR.md`
- `docs/CARAI_UI_MIGRATION_AR.md`
- `docs/REA_MCP_AR.md`
- `docs/MODEL_LAB_AR.md`
- `docs/ROADMAP_AR.md`
- `docs/DEPLOYMENT_AR.md`
- `docs/LICENCE_REVIEW_AR.md`

**ما يثبت وجوده بحسب README والتدقيق المنشور، وليس حكماً مستقلاً على تشغيله الآن:**
- تسجيل محلي وجلسة HttpOnly وSQLite WAL وعزل مساحات المعارض.
- CRUD للسيارات، ملفات أصل ومشتقات، سجل تدقيق.
- سجل مهارات allowlist وملفات Agent Skills.
- Maestro أولي للمهام والاستعادة/الإلغاء/إعادة المحاولة ضمن حدود موثقة.
- BG0/BiRefNet Lite لإزالة خلفية محلية في المتصفح.
- تحسين WebP، طمس منطقة يحددها المستخدم، مشاهد خلفية ثابتة، تضليل زجاج يدوي.
- مسودة إعلان من حقول مؤكدة، صفحات معرض عامة ومحادثة موقع محدودة.
- MCP محلي عبر stdio، REA كأداة بحث منفصلة.
- Google Maps deep links وWhatsApp click-to-chat فقط.

**فجوات مذكورة في تدقيق 23 نوفمبر 2026:** لا تزال هناك فجوات في نجاح CI/build على runner، دخول الأداة مباشرة، توحيد ألبوم السيارة وسير الصور، ربط المساعد بالواجهة، OAuth/Drive/Maps embedded، WhatsApp الرسمي، كشف اللوحات والزجاج التلقائي، browser automation، LLM محلي جاهز، اختبارات أجهزة حقيقية، النسخ الاحتياطي/الاستعادة الإنتاجية، lockfile/SBOM، ومراجعة PDPL والأمن. يجب إعادة التحقق قبل أي إطلاق.

### 3.2 CARAI

- الرابط الذي قدمه المستخدم: https://github.com/aimshkur/CARAI
- المستودع عام ويمكن قراءة README وpackage.json.
- الحجم الظاهر صغير جداً، والجذر يحتوي فعلياً على: `README.md`, `index.html`, `package.json`, `vite.config.js`.
- README يصف منصة تصوير وإعلانات سيارات، Tool-first، ثلاث طبقات Tools/Workspace/Administration، و30 مهارة، ويذكر صفحات HTML مثل `MSHKUR_Mobile_Screens.html`, `MSHKUR_Refined_UI.html`, `MSHKUR_UI_Design.html`, `MSHKUR_Approval_List.html`, `MSHKUR_Haraj_Publish.html`.
- لكن مجلدات `pages/`, `skills/`, `docs/`, `assets/` المذكورة في README لم تظهر في محتويات الجذر التي تمكنا من قراءتها. لا نفترض أنها موجودة؛ يلزم استعادة النسخة المحلية/المزامنة المشار إليها في README أو إعطاء رابط صحيح للملفات.
- package.json يبين React 18 + Vite 5 + lucide-react، وهو أقدم من stack الحالي في MSHKUR (React 19 + Vite 6 + TypeScript + Express). لذلك لا ندمج المشروع كما هو؛ نأخذ prototypes/flows بعد الحصول عليها ونحوّلها إلى React/TS components داخل النظام الحالي.
- CARAI README يذكر أرقام فوائد تجارية وأسعاراً ومزايا؛ هذه ادعاءات تسويقية غير متحققة ولا تُعتمد كحقائق أو قرارات منتج دون دليل.

**قرار CARAI:** مرجع تاريخي وتصميمي/وظيفي؛ لا نسخ كامل ولا دمج stack. استعادة ملفات الصفحات والأصول والمهارات من المصدر الأصلي مطلوبة.

### 3.3 MSHKURCAR

- الرابط المذكور في CARAI README: https://github.com/aimshkur/MSHKURCAR
- تعذر الوصول إليه في مراجعة GitHub الحالية: API أعاد 404، والبحث عن اسم المستودع لم يُظهر نتيجة عامة.
- الاحتمالات: خاص، محذوف، تغير اسمه، أو صلاحيات الربط لا تسمح برؤيته. لا يمكن الحكم على محتواه أو دمجه.
- **الحالة:** NOT ACCESSIBLE — لا نضع افتراضات عن محتواه. نحتاج إتاحته للمراجعة أو رابطاً صحيحاً/نسخة ZIP.

### 3.4 مستودعات وفروع أخرى

- تمت قراءة وجود الفروع التاريخية المذكورة في تدقيق المشروع؛ لا تدمج الفروع المتباعدة مباشرة.
- أي مستودع أو فرع جديد يُضاف إلى سجل المصادر مع owner/name، default branch، commit SHA، تاريخ الفحص، وحالة الوصول.
- لا ننشئ مستودعاً رئيسياً بديلاً قبل تحديد مصدر الحقيقة.

## 4. الواجهات المقترحة — شاشات المنتج

### 4.1 قواعد التصميم

- Mobile-first، RTL، light-first، أقل نصوص ممكنة.
- فتح المستخدم على الأداة/المهمة، وليس على dashboard أو قائمة تقنية.
- مساحة عمل كبيرة للصورة، thumbnails، أزرار أفعال مختصرة، قوالب مرئية.
- النصوص التوضيحية والتسويق أسفل منطقة العمل.
- كل وظيفة تعرض حالاتها: idle/uploading/processing/review/success/error/cancelled.
- لا mock buttons أو progress وهمي أو before/after لصورتين مختلفتين.
- استخدم أصولاً مرخصة أو صور اختبار يملكها المشروع؛ لا تستخدم لقطات منتجات منافسة كأصول داخل واجهة الإنتاج.

### 4.2 الشاشة الأولى — Studio / أداة إزالة الخلفية

```text
┌──────────────────────────────────────────────┐
│ مشكور                                  ☰     │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │         مساحة الصورة / قبل وبعد          │ │
│ │       (مقبض مقارنة فعلي قابل للسحب)       │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│ [الصورة الأصلية] [صورة 2] [صورة 3] [+]      │
│                                              │
│ [إزالة الخلفية] [Keep Original] [تحسين]      │
│ [طمس اللوحة] [قص] [الزجاج] [المشهد]         │
│                                              │
│ الخلفيات: [أبيض] [رمادي] [داكن] [معرض]      │
│                                              │
│ [حفظ نسخة]              [تنزيل]              │
└──────────────────────────────────────────────┘
```

### 4.3 شاشة KeepOriginal / تاريخ الصور

- الأصل في رأس السجل مع علامة Original.
- كل مشتق يعرض العملية، المحرك/الإصدار، التاريخ، الحالة، وصورة معاينة.
- زر فتح الأصل، مقارنة، إعادة تطبيق العملية، تصدير، أو حذف مشتق وفق الصلاحية.
- يمنع تعديل الأصل أو استبداله. حذف الأصل يخضع لسياسة حذف المشروع وموافقته.

### 4.4 شاشة Ads / تجهيز الإعلان

```text
┌──────────────────────────────────────────────┐
│ إعلان السيارة                                │
│ صور مختارة + ترتيب + صورة غلاف               │
│                                              │
│ العنوان: [من بيانات السيارة المؤكدة]         │
│ السعر:   [حقل المستخدم]                      │
│ السنة/الموديل/العداد: [حقائق موثقة]          │
│                                              │
│ [نواقص البيانات] [معاينة الإعلان]             │
│ [نسخ النص] [تنزيل الحزمة] [مراجعة]            │
│                                              │
│ النشر الخارجي: لا يحدث إلا بعد موافقة         │
└──────────────────────────────────────────────┘
```

### 4.5 شاشة Dealer / مشروع السيارة

تبويبات: الصور — التجهيز — الإعلان — النشر — النشاط.  
السجل الموحد يجمع السيارة وأصل الصور والمشتقات والبيانات والإعلانات والموافقات والاستفسارات.

### 4.6 المساعد العام

- متاح من أي تطبيق عبر مدخل موحد.
- يطلب نتيجة باللغة الطبيعية، ويعرض فهمه المختصر وخطة قابلة للتعديل.
- ينفذ المهارات المسموحة في الخلفية.
- يعرض النتيجة والأخطاء والقرارات التي تحتاج موافقة.
- لا يكشف أسماء النماذج أو الوكلاء أو MCP للمستخدم اليومي.
- لا يسمح للنموذج بإنشاء كود وتشغيله مباشرة.

### 4.7 Admin / Visual Lab

- مكتبة المراجع والمهارات والأدوات.
- سجل المصادر والمشاريع والموديلات.
- المقارنة والاختبارات واللقطات.
- حالة التراخيص والـcommits والاعتماديات.
- لوحة مراجعة واعتماد الاستيراد.
- لا تظهر هذه الشاشة للمستخدم العادي.

## 5. Visual Reference Library — مكتبة الصور والشاشات

لكل أداة سجل بصري مستقل يحتوي على:
1. صورة رسمية من المشروع/الوثائق (رابط ومصدر وتاريخ).
2. رابط Demo حي أو فيديو رسمي إن وجد.
3. لقطة شاشة للواجهة مع رقم إصدار/commit إن كانت من repo.
4. Input sample وOutput sample.
5. before/after لنفس الملف، لا صورتين مختلفتين.
6. لقطة اختبار MSHKUR توضح النتيجة على عينة مرخصة.
7. ترخيص الصورة/الفيديو وحقوق إعادة التوزيع.
8. وصف ما توضحه الصورة وما لا تثبته.

**هيكل الملفات:**
```text
references/
  README.md
  MASTER_REFERENCE_INDEX.md
  VISUAL_LAB/
    image-processing/
    automotive/
    background-removal/
    segmentation-matting/
    privacy-plate/
    glass-tint/
    studio-scenes/
    ads-and-templates/
    agent-workflows/
    skills/
    ui-components/
    mobile-screens/
    admin-console/
    testing-benchmarks/
  assets/
    official-links/
    mshkur-fixtures/
    generated-diagrams/
    licensed-screenshots/
    video-links/
  source-registry/
  project-reviews/
  decisions/
  benchmarks/
  licenses/
```

لا تنسخ صوراً أو شعارات منافسين إلى ملفات المنتج دون إذن. يمكن ربط الصور الأصلية من صفحاتهم للبحث الداخلي مع نسب المصدر؛ ولعرض أمثلة MSHKUR، أنشئ لقطات من نسختنا باستخدام fixtures مرخصة.

## 6. مكتبة المشاريع والأدوات المرشحة — سجل أولي

> القائمة التالية بوابة بحث وليست اعتماداً. يجب إعادة فحص آخر commit وLICENSE والاعتماديات والأوزان وبيانات التدريب وشروط الاستخدام التجاري لكل مصدر. الترخيص في مستودع الكود لا يغطي تلقائياً أوزان النموذج أو الصور أو البيانات.

### 6.1 صور السيارات وإزالة الخلفية

| المصدر | ما ندرسه | استخدام محتمل | الحالة |
|---|---|---|---|
| https://github.com/opencoredev/bg0 | إزالة خلفية محلية في المتصفح، WebGPU/WASM | المحرك الحالي؛ مراجعة التحديثات | IMPLEMENTED / REVALIDATE |
| https://github.com/ZhengPeng7/BiRefNet | segmentation عالي الجودة | مقارنة masks ونماذج | RESEARCH |
| https://github.com/danielgatis/rembg | pipelines ومخرجات alpha/refinement | benchmark فقط؛ الأوزان منفصلة | RESEARCH / LICENSE CHECK |
| https://github.com/ihateSAS/lumacut | segmentation + trimap + matting + edge cleanup | pipeline/refinement | RESEARCH |
| https://github.com/mherazizbekyan/bg-remove | browser workers، refinement، defringe، batch | اختصار pipeline/UX | RESEARCH |
| https://github.com/pricklygorse/Interactive-Image-Background-Remover | brush/points/box/zoom/mask refinement | واجهة تصحيح القناع | RESEARCH |
| https://github.com/rishn/Matte-API | mask/segmentation/refinement | مقارنة API/pipeline | RESEARCH |
| https://github.com/facebookresearch/sam2 | segmentation تفاعلي | اقتراح/تصحيح القناع بعد قياس browser/server | RESEARCH |
| https://opencv.org/ و https://docs.opencv.org/ | morphology, contours, geometry, color | عمليات تقليدية مساعدة | RESEARCH |
| https://onnxruntime.ai/ | inference وWebGPU/WASM | تشغيل النماذج | RESEARCH / EXISTING DEPENDENCY PATH |
| https://huggingface.co/models | اكتشاف النماذج وmodel cards | مصدر اكتشاف لا اعتماد | DISCOVERY |

### 6.2 معالجة الصور والوسائط

- https://sharp.pixelplumbing.com/ — معالجة خادمية؛ مستخدم حالياً عبر Sharp.
- https://imagemagick.org/ — تحويلات وصيغ وعمليات دفعات.
- https://pillow.readthedocs.io/ — معالجة Python وfixtures.
- https://github.com/libvips/libvips — محرك صور عالي الأداء، يدرس عند الحاجة.
- https://ffmpeg.org/ — فيديو/GIF وتحويل؛ ليس ضمن المسار الحالي.
- https://github.com/ffmpegwasm/ffmpeg.wasm — فيديو في المتصفح، يحتاج benchmark ذاكرة وأداء.
- https://github.com/naptha/tesseract.js وhttps://github.com/PaddlePaddle/PaddleOCR — OCR؛ لاستخراج حقول مع مراجعة بشرية، لا لتخمين بيانات السيارة.

### 6.3 صور السيارات، الاستوديو، والتجربة التجارية

- https://www.spyne.ai/ — مرجع UX لتصوير السيارات وخلفيات الاستوديو والـQC؛ لا نسخ أصول/علامة/واجهة.
- https://carflow.ai/ — مرجع لتدفق رفع صور السيارات ومعالجتها وتجهيز الإعلان؛ يجب التحقق من الديمو والميزات الحالية قبل تسجيلها.
- https://carbg.ai/ — مرجع مرئي/تجاري لأفكار خلفيات السيارات؛ لا نعتبره محركاً قابلاً للدمج.
- https://www.remove.bg/ — benchmark وظيفي فقط؛ API/الشروط/الأسعار لا تدخل المسار الأساسي دون موافقة.
- https://www.photoroom.com/ — مرجع UX لمعالجة الصور وقوالب الخلفيات.
- https://www.canva.com/ — مرجع قوالب الإعلانات والتصميم، لا نسخ.
- لكل موقع تجاري: وثّق الرحلة العامة والنتائج المعلنة فقط، ولا تتجاوز تسجيل الدخول أو paywall أو CAPTCHA أو شروط الاستخدام.

### 6.4 الوكلاء والمهارات والبروتوكولات

- https://agentskills.io/ — مواصفة Agent Skills.
- https://modelcontextprotocol.io/ — MCP.
- https://github.com/morluto/rea — REA: Reverse Engineer Anything؛ أداة تطوير/بحث مستقلة.
- https://langchain-ai.github.io/langgraph/ — orchestration/stateful graphs؛ مرجع عند الحاجة.
- https://docs.crewai.com/ — agent teams؛ دراسة لا تبنٍ تلقائي.
- https://docs.n8n.io/ — workflows؛ مرجع للتكاملات.
- https://github.com/agentic-community/mcp-gateway-registry — اكتشاف/تسجيل MCP؛ مراجعة أمنية.
- https://github.com/justQrius/skills_runtime_registry — نمط سجل مهارات؛ دراسة فقط.
- https://github.com/openworkflowdev/openworkflow — مرجع TypeScript/SQLite/workflow recovery؛ ليس اعتماداً حالياً.
- https://playwright.dev/ — browser automation حتمي ومصرح به.
- https://www.stagehand.dev/ — browser agent؛ يدرس لاحقاً مع حدود النطاق والموافقات.
- https://github.com/anthropics/skills — أمثلة skills؛ افحص الترخيص والملفات قبل الاستيراد.

### 6.5 نماذج محلية وذكاء اصطناعي

- https://huggingface.co/ — اكتشاف النماذج والـmodel cards.
- https://huggingface.co/docs/transformers.js — تشغيل بعض النماذج داخل المتصفح.
- https://huggingface.co/docs/diffusers — نماذج الصور.
- https://ollama.com/ — تشغيل نماذج محلية.
- https://github.com/ggml-org/llama.cpp — GGUF وCPU/GPU inference.
- https://onnx.ai/ — ONNX.
- https://github.com/microsoft/onnxruntime — inference.
- https://github.com/unslothai/unsloth — fine-tuning/QLoRA عند وجود داعٍ.
- لا تُحمّل الأوزان في Git أو الحزمة الأساسية. سجّل الحجم والـrevision والـchecksum وترخيص الأوزان منفصلاً عن الكود.

### 6.6 الواجهات والتصميم

- https://react.dev/ — React (stack الحالي).
- https://vite.dev/ — Vite.
- https://www.typescriptlang.org/docs/ — TypeScript.
- https://tailwindcss.com/docs — CSS utility framework (لا يضاف إلا إذا توافق مع المشروع).
- https://ui.shadcn.com/ — مكونات مرجعية.
- https://storybook.js.org/ — كتالوج مكونات واختبار بصري.
- https://lucide.dev/ — أيقونات.
- https://playwright.dev/ — اختبارات واجهة.
- https://www.figma.com/community — مرجع استلهام فقط؛ راجع شروط كل ملف/مكون.

### 6.7 البيانات والتخزين والبحث

- https://www.sqlite.org/docs.html — قاعدة البيانات الحالية.
- https://www.postgresql.org/docs/ — خيار ترقية عند تعدد الخوادم/كثافة الكتابة.
- https://redis.io/docs/ — لا يضاف إلا إذا أثبت القياس الحاجة.
- https://qdrant.tech/documentation/ وhttps://docs.trychroma.com/ — بحث متجهي/ذاكرة عند وجود استخدام واضح.
- https://min.io/docs/ وhttps://developers.cloudflare.com/r2/ — تخزين كائنات عند التوسع.
- https://opentelemetry.io/docs/ وhttps://sentry.io/ — مراقبة وأخطاء مع ضوابط خصوصية.

### 6.8 الاختبار والأمن والنشر

- https://nodejs.org/docs/ — Node.js.
- https://expressjs.com/ — Express.
- https://vitest.dev/ — اختبارات.
- https://playwright.dev/ — E2E.
- https://docs.github.com/en/actions — CI.
- https://owasp.org/www-project-application-security-verification-standard/ — ASVS.
- https://owasp.org/www-project-top-ten/ — مخاطر الويب.
- https://trivy.dev/ — فحص صور/اعتماديات.
- https://docs.docker.com/ — Docker.
- https://developer.chrome.com/docs/lighthouse — أداء الويب.

### 6.9 الاتصالات والخرائط

- https://developers.facebook.com/docs/whatsapp/ — WhatsApp Business Platform الرسمية.
- https://github.com/WhiskeySockets/Baileys — مكتبة WhatsApp Web غير رسمية؛ HOLD للمسار التجاري حتى مراجعة الشروط والاستقرار ومخاطر الحظر.
- https://github.com/pedroslopez/whatsapp-web.js — غير رسمي؛ HOLD.
- https://www.openstreetmap.org/ وhttps://maplibre.org/ — خرائط مفتوحة.
- https://leafletjs.com/ — خرائط تفاعلية.
- لا تدّعِ وجود قناة WhatsApp أو إرسال تلقائي؛ الحالي wa.me click-to-chat فقط بحسب التدقيق.

## 7. استراتيجية البحث الحرة واختيار الأفضل بواسطة النموذج

نريد **حرية اكتشاف، لا حرية تنفيذ غير مقيدة**.

### 7.1 دورة البحث لكل طلب/أداة

1. **فهم الوظيفة:** حدد المدخلات والمخرجات ومعيار النجاح، مثال: صورة سيارة مع خلفية مزدحمة → PNG شفاف بحواف نظيفة.
2. **البحث:** GitHub repositories/code، وثائق رسمية، Hugging Face model cards، npm/PyPI، demos، أوراق بحثية، صور/فيديوهات توثيقية.
3. **اكتشاف المرشحين:** ابحث عن المكتبات الصغيرة، repos النشطة، الحلول المتخصصة، والـpipelines المختصرة.
4. **الفرز الأولي:** اللغة، runtime، الأجهزة، حجم الحزمة/النموذج، النشاط والصيانة، issues، dependencies، التراخيص.
5. **تفكيك مصرح به:** REA أو مراجعة source/docs/demo. لا تجاوز حماية أو حسابات أو نسخ أصول محمية.
6. **نموذج أولي معزول:** لا تكتب في التطبيق الأساسي؛ شغّل fixtures داخل sandbox أو فرع تجربة.
7. **المقارنة:** جودة، زمن، RAM/VRAM، تنزيل، تكلفة، خصوصية، دقة على جوال، قابلية offline.
8. **قرار آلي مقترح:** النموذج يقدم ترتيباً وأسباباً وأدلة، لكن التفعيل/الدمج يتطلب review وفق مستوى المخاطر.
9. **تحويل إلى Skill:** manifest + adapter/handler typed + tests + provenance + permission policy.
10. **تحديث المرجع:** source commit/hash، تاريخ، license evidence، screenshots، benchmark، القرار.

### 7.2 سياسة اختيار المحرك

قيّم كل مرشح من 0 إلى 5 وفق الأوزان الافتراضية التالية، ويمكن تغيير الأوزان حسب الوظيفة:

| المعيار | الوزن |
|---|---:|
| جودة المخرجات على بيانات MSHKUR | 25% |
| الترخيص ووضوح حقوق الاستخدام التجاري | 20% |
| التكلفة الكلية (نموذج/تشغيل/صيانة) | 15% |
| الأداء والذاكرة على الأجهزة المستهدفة | 15% |
| سهولة التكامل والصيانة | 10% |
| الخصوصية والعمل المحلي/offline | 10% |
| نشاط المشروع والتوثيق | 5% |

**بوابة مانعة:** أي غموض جوهري في الترخيص/الأوزان/البيانات أو ثغرة أمنية حرجة = HOLD مهما كانت النتيجة الرقمية. لا تجمع درجات شكلية لتجاوز الحقوق.

### 7.3 هندسة المهارة المختصرة

قبل إدخال إطار agent كبير، اسأل: هل تكفي دالة محلية صغيرة + model inference + validator؟ هل يمكن تشغيل الأداة داخل Worker أو WASM؟ هل نحتاج LLM أصلاً؟ هل يمكن استخدام rule-based routing؟

مثال RemoveBackground:
- Skill manifest صغير.
- adapter يستدعي BG0 أو engine candidate.
- quality validator يفحص mask/alpha والحدود.
- fallback إلى محرك آخر فقط إذا كان مثبتاً ومرخصاً ومتاحاً.
- UI يسمح بالتصحيح اليدوي.
- لا خدمة خارجية ولا مفتاح API افتراضياً.

مثال KeepOriginal:
- ليس نموذجاً ذكياً؛ هو عقد تخزين/نسخ غير هدّام.
- كل عملية تنشئ derived asset جديداً مع `parent_asset_id`, `operation_id`, `engine_revision`, `sha256`.
- الأصل read-only؛ لا يستبدل بالنتيجة.
- undo يغيّر current selection أو ينشئ مشتقاً عكسياً، ولا يمحو provenance.

## 8. المهارات والمساعدون وMaestro — عقد موحد

### 8.1 Skill Manifest

كل مهارة تتضمن:
- `id/name/version/description`
- `input_schema/output_schema`
- `runtime`: browser / worker / server-local / connector
- `handler` معرف مسجل، لا نص كود حر
- `dependencies` ونسخها
- `model/weights/revision/checksum`
- `licenses/notices/source_commit`
- `permissions/data_access`
- `resource_limits`: time, memory, file size, concurrency
- `deterministic` أو stochastic
- `approval_policy`
- `quality_tests/fixtures/benchmarks`
- `retry/idempotency/cancel`
- `status`: draft/review/approved/disabled/deprecated

### 8.2 مساعد/موظف متخصص

تعريف الموظف ليس عملية دائمة. هو:
- role + system instructions
- قائمة skills مسموحة
- أدوات/موصلات وصلاحيات
- سياسة النموذج (محلي/محدد/لا LLM)
- الذاكرة/السياق المسموح
- معايير تسليم ومراجعة
- سجل قرارات

أدوار قابلة للاستدعاء: مدير تجهيز السيارة، خبير الصور، خبير إزالة الخلفية، مراقب جودة، خبير خصوصية اللوحات، خبير الزجاج، كاتب إعلان، مدقق بيانات، مدير مخزون، مساعد العملاء، مسؤول النشر، مهندس البحث العكسي، أمين مكتبة المصادر، مهندس اختبارات.

### 8.3 Maestro

Maestro ينسق:
- فهم النية → خطة typed → اختيار skill/agent → موافقات → تنفيذ → تحقق → تجميع النتيجة.
- كل خطوة مسجلة وقابلة للاستئناف، مع idempotency وretry محدود وcancel آمن.
- لا يسمح للنموذج بتوليد shell أو SQL أو URLs تنفيذية غير مسجلة.
- لا ينفذ مستورداً أو كوداً مولداً في عملية الخادم.
- لا يظهر للمستخدم العادي كمنتج تقني؛ يعرض المهمة والنتيجة.

### 8.4 REA وMCP

- REA: https://github.com/morluto/rea — أداة تحليل/بحث تطويرية مستقلة، لا runtime.
- MCP: https://modelcontextprotocol.io/ — بروتوكول لتوصيل أدوات ذات schemas وصلاحيات واضحة.
- لا يُقبل MCP server بمجرد اكتشافه. يتطلب owner، مصدر، commit، tool inventory، auth، permissions، network policy، rate limits، timeout، logs، sandbox، threat review.
- لا shell أو filesystem واسع أو secrets access افتراضياً.

## 9. معايير اختبار إزالة الخلفية — لا مساواة بلا دليل

مجموعة الاختبار يجب أن تضم صوراً مرخصة ومتنوعة:
- سيارات بيضاء/سوداء/فضية/ألوان مشبعة.
- خلفيات فاتحة/داكنة/مزدحمة/داخل معرض/خارجية.
- زجاج عاكس، مرايا، أسلاك جنوط، هوائيات، فتحات بين أجزاء السيارة.
- إضاءة نهارية/ليلية/ظلال قوية.
- زوايا أمامية/جانبية/خلفية/ثلاثة أرباع.
- صور عالية الدقة وصور جوال مضغوطة.

مقاييس:
- اكتمال جسم السيارة وعدم فقد أجزاء.
- هالات الحواف/تلوث لون الخلفية.
- جودة alpha على الزجاج والعجلات.
- زمن المعالجة، peak memory، حجم النموذج والتنزيل.
- fallback على WASM عند غياب WebGPU.
- أداء جوال متوسط.
- قابلية التصحيح اليدوي.
- فشل/إلغاء/استعادة/تصدير.
- لا تستخدم صور قبل/بعد غير متطابقة.

## 10. صور الواجهات والمرجعيات المرئية — المصادر

هذه روابط مرجعية لا تعني إذناً بنسخ الصور/التصميم:
- Spyne: https://www.spyne.ai/
- CarFlow: https://carflow.ai/
- carbg: https://carbg.ai/
- remove.bg: https://www.remove.bg/
- PhotoRoom: https://www.photoroom.com/
- React component patterns: https://ui.shadcn.com/
- Storybook examples: https://storybook.js.org/showcase/
- Lucide icons: https://lucide.dev/icons/
- Hugging Face model demos: https://huggingface.co/models
- BG0 docs: https://bg0.dev/docs
- OpenCV samples/docs: https://docs.opencv.org/

**لقطات MSHKUR المطلوبة داخلياً:**
1. Guest Studio: شاشة رفع/صورة/أدوات.
2. BeforeAfter: نفس الصورة بمقبض مقارنة.
3. Background picker: thumbnails لقوالب مرخصة.
4. KeepOriginal timeline: أصل ومشتقات.
5. Batch processing: تقدم كل صورة وأخطاءها.
6. Ad builder: حقول موثقة ومعاينة.
7. Vehicle project: التبويبات الخمسة.
8. Assistant sheet: مهمة وخطة ونتيجة.
9. Approval center: المحتوى والوجهة والموافقة.
10. Visual Lab: بطاقة المصدر والصورة والديمو والـlicense والـbenchmark.
11. Mobile screenshots: عرض 360px و390px و430px.
12. Desktop: 1280px+ مع responsive layout.

لا نضع لقطة في المكتبة حتى نعرف: من أين جاءت، أي نسخة، ماذا تثبت، وما ترخيصها.

## 11. أمان وحقوق الاستخدام

- REA والهندسة العكسية للمصادر المصرح بها فقط؛ لا تجاوز DRM/CAPTCHA/paywall أو الدخول لحسابات الغير.
- نحلل السلوك العام والواجهات والوثائق، ثم نعيد بناء وظيفة مستقلة؛ لا نسخ كود/شعار/صور محمية.
- لكل repo: LICENSE، dependency licenses، model weights license، dataset license، font/media licenses.
- لا تعتمد MIT/Apache للكود كدليل على أن الأوزان أو البيانات تجارية.
- لا تحفظ أسرار/جلسات/مفاتيح في Git أو الواجهة.
- ملفات العملاء والصور والـMCP outputs والنماذج بيانات غير موثوقة.
- sandbox للاستيراد، لا تنفيذ كود خارجي داخل خادم الإنتاج.
- الموافقات مرتبطة ببصمة payload exact-content/exact-destination.

## 12. أولويات الدمج — أفضل نسخة قابلة للتنفيذ

### P0 — توحيد الحقيقة قبل أي إضافة
- تثبيت هذا المرجع وربطه من README.
- استعادة محتويات CARAI المشار إليها (pages/skills/docs/assets) أو تحديد مصدرها.
- إتاحة MSHKURCAR أو توثيق سبب تعذر الوصول.
- مراجعة الفروع والـPRs المتباعدة واستخراج التغييرات المنتقاة فقط.
- تحديث حالة التنفيذ من الكود والاختبارات، لا من الوثائق وحدها.

### P1 — إغلاق تجربة إزالة الخلفية end-to-end
- مدخل مباشر للأداة.
- KeepOriginal/Derived asset lineage.
- pipeline قابل للتبديل عبر adapters.
- mask QA + manual refinement + before/after.
- local fast path + enhanced path عند الحاجة.
- batch progress + retry failed only + cancel.
- اختبارات صور سيارات مرخصة وقياس أداء.

### P2 — واجهة مشروع السيارة والإعلان
- ربط ألبوم الصور بمشروع السيارة.
- ترتيب/غلاف/قوالب.
- بيانات مؤكدة ومصدر كل حقل.
- مسودة إعلان ومراجعة وتصدير.
- صفحات عامة/QR بموافقة.

### P3 — Workforce/Knowledge Engine
- registry موحد للمهارات والوكلاء والأدوات والمراجع.
- source discovery/import factory.
- Visual Lab ومكتبة أمثلة.
- sandboxed prototype runner.
- benchmark runner وlicense gate.
- تحديث تلقائي للمرجع بعد كل اعتماد/تحديث upstream.

### P4 — اتصالات وإدارة
- مساعد عام موصول فعلياً.
- موافقات وسجل audit.
- WhatsApp الرسمي أو click-to-chat وفق الخيار المعتمد.
- Google OAuth/Drive/Maps كموصلات اختيارية.
- Browser automation مصرح به فقط.

### P5 — إطلاق
- lockfile + SBOM + vulnerability scan.
- CI فعلي على runner.
- اختبارات Android/iOS حقيقية.
- backup/restore tested.
- security/privacy/PDPL review.
- مراقبة وأداء وتكلفة.
- لا إعلان جاهزية قبل اجتياز بوابات القبول.

## 13. ما لا ندمجه الآن

- لا دمج stack CARAI القديم React 18/Vite 5 مع main React 19/Vite 6.
- لا دمج MSHKURCAR قبل الوصول والفحص.
- لا نسخ واجهات Spyne/CarFlow/Photoroom أو أصولها.
- لا إضافة rembg أو SAM2 أو أي نموذج قبل benchmark وترخيص الأوزان.
- لا Temporal/Redis/Postgres/Kubernetes قبل قياس حاجة تشغيلية.
- لا WhatsApp Web automation غير رسمي في المسار التجاري الحالي.
- لا Google AI Studio كاعتماد معماري.
- لا تشغيل skills أو MCP servers مستوردة مباشرة.
- لا LLM مدفوع كشرط للوظائف الأساسية.

## 14. سجل التغييرات ومصادر الحقيقة

| النوع | المصدر | ما يثبته | ما لا يثبته |
|---|---|---|---|
| المنتج الحالي | README + code + tests في MSHKUR | بنية وميزات موجودة بحسب المراجعة | نجاح كل سيناريو إنتاجي |
| تدقيق الحالة | PROJECT_AUDIT_2026-11-23_AR.md | فجوات وحالة موثقة بتاريخ محدد | حالة اليوم دون إعادة اختبار |
| التصميم | MAIN_SCREEN_SPYNE_CARFLOW_AR.md وCARAI_UI_MIGRATION_AR.md | اتجاه وتجارب مقترحة | أن التصميم مطبق بالكامل |
| المحادثات | ملخصات السياق المتاحة | نية المستخدم والقرارات المتطورة | كل محتوى المحادثات القديمة |
| CARAI | README/package.json والجذر المتاح | وصف المشروع والـstack والملفات الموجودة | وجود المجلدات المذكورة في README |
| MSHKURCAR | الرابط المعلن ونتيجة 404 | عدم إتاحته في المراجعة الحالية | أنه محذوف قطعاً |

### مستودعات المراجعة
- MSHKUR: https://github.com/alwaleedm369-hash/MSHKUR
- CARAI: https://github.com/aimshkur/CARAI
- MSHKURCAR: https://github.com/aimshkur/MSHKURCAR (غير متاح في المراجعة الحالية)

### تعليمات لكل نموذج ذكاء اصطناعي يفتح المشروع

1. اقرأ هذا المرجع و`AGENTS.md` قبل العمل.
2. افحص الكود الحالي والفرع وgit diff والاختبارات قبل التعديل.
3. لا تعِد تصميم المنتج من الصفر ولا تحذف وظائف قائمة.
4. لا تجعل المهارات والمساعدين طبقة لاحقة؛ هما طريقة تنفيذ كل وظيفة.
5. ابحث عن مشاريع وأدوات ومكتبات مناسبة قبل بناء وظيفة جديدة، لكن لا تدمج أول نتيجة.
6. استخدم أفضل حل يثبت جودته وتوافقه وترخيصه؛ يسمح بالبحث المفتوح والاختيار من خارج القائمة.
7. حلل المشاريع المصرح بها عكسياً، واستخرج الوظيفة لا الأصول أو الكود المحمي.
8. أنشئ prototype معزولاً، اختبره، ثم اكتب adapter/skill داخل allowlist.
9. احفظ الأصل دائماً، وأنشئ Derived لكل تعديل.
10. اعرض صوراً ولقطات وأمثلة حقيقية من التنفيذ، مع المصدر والترخيص.
11. حدّث هذا المرجع وسجل المصدر والقرار والاختبار عند كل تغيير.
12. لا تدّعِ اختباراً أو تكاملاً أو ميزة لم تنفذ فعلاً.
13. لا ترسل/تنشر/تحذف/تشتري ولا تتصل بمزود خارجي دون موافقة واضحة عند الحاجة.
14. في تقرير التسليم اذكر: ما تغير، الملفات، الاختبارات ونتائجها، ما لم يختبر، والعوائق.

---

## 15. سجل الأدوات المختصر الحالي (من main)

المهارات الظاهرة في `skills/` عند الفحص:
- `background-remove`
- `car-studio-pipeline`
- `image-optimize`
- `license-plate-blur-region`
- `rea-reverse-engineer`
- `vehicle-ad-copy`
- `vehicle-validate`
- `registry.json`

أدوات البحث/التطوير:
- `tools/rea/`
- `tools/mcp/`
- `tools/model-lab/`

ملاحظة: وجود ملف skill لا يعني أن كل القدرات المقترحة في الوصف منفذة؛ يجب فحص handler والاختبارات.

## 16. ما يحتاجه المالك لاستكمال المراجعة

1. استعادة/إتاحة مستودع `aimshkur/MSHKURCAR` أو تأكيد رابط بديل.
2. إتاحة ملفات CARAI المشار إليها في README (pages/skills/docs/assets) إذا كانت في OneDrive أو نسخة محلية.
3. إذا كانت هناك محادثات أو ملفات تصدير لا تظهر في سياق المراجعة، تصديرها/رفعها قبل حذفها حتى نضيف قراراتها غير الموجودة هنا.

**لا تحذف المحادثات أو المشاريع قبل الاحتفاظ بنسخة احتياطية قابلة للبحث من كل الملفات والمرفقات المهمة.** هذا المرجع نقطة مركزية قوية، لكنه لا يستطيع استعادة ملف خاص أو صورة أو محادثة لم تكن متاحة أثناء الفحص.
