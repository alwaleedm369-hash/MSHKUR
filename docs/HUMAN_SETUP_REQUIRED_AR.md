# الإجراءات البشرية المتبقية قبل المعاينة والربط — MSHKUR

هذه الوثيقة تفصل ما يمكن تنفيذه داخل المستودع عن المفاتيح والحسابات التي لا يستطيع المطور إنشاءها نيابة عن مالك الحساب.

## 1. GitHub Actions — عائق التحقق الحالي

أحدث تشغيلات `verify` و`package-source` انتهت بـ `startup_failure`، وقائمة الوظائف فارغة. لم يبدأ runner، ولم تنفذ خطوة npm واحدة.

راجع:
- https://github.com/alwaleedm369-hash/MSHKUR/settings/actions
- Settings → Actions → General.
- تأكد أن GitHub Actions مسموحة لهذا المستودع، وأن سياسات المؤسسة/الحساب لا تمنع GitHub-hosted runners.
- راجع Billing / spending limits / runner availability إن استمرت المشكلة.

بعد حل ذلك، أعد تشغيل workflow `verify`. لا تعتبر المشروع مختبراً حتى يظهر job حقيقي وينجح `npm install` و`npm test` و`npm run typecheck` و`npm run build`.

## 2. Google Sign-In وDrive

أنشئ مشروعاً تملكه في Google Cloud Console، ثم:
1. اضبط OAuth consent screen وبيانات التطبيق.
2. أنشئ OAuth Client من نوع Web application.
3. أضف نطاق موقع MSHKUR إلى Authorized JavaScript origins.
4. أضف عنوان callback الذي سيُعتمد في الخادم إلى Authorized redirect URIs.
5. فعّل Google Drive API إذا رغبت في حفظ ملفات المستخدم على حسابه.
6. لا تطلب إلا scopes الضرورية؛ ابدأ بـ openid/email/profile ثم Drive file access بعد موافقة منفصلة.
7. خزّن Client ID وClient Secret في Environment Variables لدى الاستضافة، ولا ترسل Client Secret في المحادثة أو تضعه في Git.

المتغيرات المحجوزة حالياً:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

**مهم:** AI Studio لا ينشئ OAuth Client ولا يغني عن إعداد Google Cloud Console. AI Studio مكان تطوير/اختبار، وليس قاعدة البيانات أو نظام تسجيل الدخول.

## 3. Google Maps

روابط البحث الحالية لا تحتاج Maps API key. الخريطة التفاعلية المضمنة قد تحتاج تفعيل Maps JavaScript API أو Embed API وإعداد مشروع/حصة، وقد تتطلب حساب فوترة وفق المنتج والمنطقة. لا تضع المفتاح في Git؛ استخدم قيود HTTP referrer وقيود API.

## 4. Gemini

لا نفعّل Gemini في المسار الأساسي. إذا رغبت بموصل Gemini:
- أنشئ مفتاحاً من Google AI Studio.
- خزّنه في الخادم فقط.
- افحص حدود الخطة المجانية والحصص الفعلية قبل تشغيله للمستخدمين.
- ضع سقف استخدام، وتعامل مع نفاد الحصة دون fallback مدفوع صامت.
- لا ترسل صور العملاء أو بياناتهم إلى Gemini دون إفصاح وموافقة.

## 5. WhatsApp

الموجود حالياً:
- محادثة الموقع على صفحة المعرض.
- حفظ استفسارات العملاء والوارد.
- إعداد رقم WhatsApp لكل معرض، ثم زر click-to-chat يفتح تطبيق WhatsApp لدى الزائر برسالة جاهزة.
- هذا لا يشغّل chatbot داخل WhatsApp ولا يقرأ صندوق الوارد ولا يرسل تلقائياً.

لإرسال واستقبال آلي رسمي يلزم إعداد WhatsApp Business Platform/Cloud API من Meta، رقم عمل، تطبيق Meta، webhook، token، ومراجعة شروط الرسائل والتسعير. لا نعتمد مكتبات QR غير رسمية أو scraping لربط WhatsApp Web؛ قد تعرض الحساب للحظر وتخالف الشروط. لا تفعّل هذا المسار إلا بعد قرار مالك المنتج وقبول تكلفته وشروطه.

## 6. المعاينة على الاستضافة

المشروع يتطلب Node.js 22+ وخادماً يشغّل Express، وقرصاً دائماً لـ SQLite والملفات:
- `MSHKUR_DB_PATH`
- `MSHKUR_STORAGE_DIR`

الاستضافة static-only لا تكفي لتشغيل API أو قاعدة البيانات أو ملفات المستخدمين. لا تنشر قبل تحديد بيئة Node.js والقرص الدائم والنسخ الاحتياطي وHTTPS.

## 7. ما يجب أن يثبت قبل إعلان «جاهز»

- نجاح CI فعلياً.
- تجربة مستخدم على هاتف Android وiPhone.
- تجربة رفع دفعة صور ومعالجة متسلسلة مع استعادة بعد فشل/إعادة تشغيل.
- اختبار استعادة نسخة احتياطية.
- اختبار tenant isolation والصلاحيات ورفع ملفات خبيثة/ضخمة.
- مراجعة PDPL وسياسة الخصوصية وحذف/تصدير البيانات.
- إتمام Google OAuth/Drive فقط بعد توفير بيانات Google.
- اختبار WhatsApp click-to-chat؛ ولا يعلن تكامل WhatsApp الآلي قبل Meta webhook end-to-end.

لا يوجد مفتاح أو حساب خارجي ينبغي إرساله داخل هذه المحادثة. أدخل الأسرار مباشرة في إعدادات Environment Variables لدى الاستضافة.
