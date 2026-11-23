# طبقة المهارات والأوامر التكميلية — MSHKUR

## قرار المنتج
تُضاف المهارات والمساعدون إلى عمل البناء والتطوير والتشغيل كطبقة خلفية افتراضية. لا تظهر للمستخدم كقوائم أو إعدادات. المنتج يحدد المدخلات والمخرجات، والمحرك يقرر الأدوات والمهارات المسموح بها، ثم يقدم الناتج للمراجعة والموافقة.

## صيغة الأوامر (تعبير عن intent وليس shell)
- `removebackground/`: إزالة الخلفية من صورة مع الحفاظ على المصدر والنسخة الناتجة.
- `keeporiginal/`: تثبيت الصورة/العناصر الأصلية المرجعية، وعدم إجراء تغييرات على الأصل؛ معالجة نسخة مشتقة فقط، مع حماية التفاصيل وحواف العناصر.
- `restore/`: استعادة أجزاء من الصورة/القناع المحدد.
- `erase/`: إزالة جزء من النسخة وفق تحديد المستخدم.
- `refineedges/`: تحسين حواف القص مع تجنب تغيير العناصر الأصلية.
- `blurplate/`: طمس لوحة السيارة، يدوياً في النسخة الحالية إلى أن يثبت الكشف الآلي.
- `export/`: إخراج بالصيغة/الأبعاد المحددة.

هذه الكلمات ليست تعليمات shell، ولا تُنفذ code. تُترجم إلى skill IDs موثوقة ومدخلات schema وpermissions.

## مثال workflow
1. استلام صورة، validation.
2. حفظ immutable original وchecksum.
3. قراءة intent: `removebackground/`.
4. تشغيل skill محلية approved handler.
5. تطبيق `keeporiginal/` على سياسة الحفاظ: لا تغيير للمصدر؛ لا تعني ضماناً مطلقاً أن النموذج لن يغير تفاصيل في النسخة المعالجة. عند طلب حفظ عنصر بعينه، استخدم mask/reference constraints واختبار quality.
6. تحسين edge/refinement اختياري بحسب intent.
7. preview before/after.
8. user review/approval.
9. export and record.

## متطلبات Registry
manifest versioned، schema inputs/outputs، permission declarations، handler allowlist، source/license/version، tests، budget/timeouts، cancellation، idempotency، audit trail.

## Default team policy
- المساعدون الافتراضيون والمهارات والخبرات البرمجية/البحثية تستخدم خلفياً في التصميم والبحث والتطوير والاختبار والصيانة.
- اختيار agent/skill بناء على المهمة لا على أسماء ثابتة ظاهرة للمستخدم.
- code from repos, skills, prompts and MCP servers is untrusted; review, isolate, test, pin versions and license.
- agents may research/propose/implement in controlled branches; never bypass approval for deployment, secrets, payment, destructive actions, or external publication.
- لا يعلن عن تشغيل أو اختبار أو اتصال ما لم تؤكد الأدلة ذلك.

## أمثلة tests
- الأصل hash ثابت بعد المعالجة.
- output size/format constraints.
- transparent alpha and edge quality fixture set.
- crop/blur/mask bounded to output copy.
- cancel/retry safely; tenant isolation.
- no external upload for local processing.
