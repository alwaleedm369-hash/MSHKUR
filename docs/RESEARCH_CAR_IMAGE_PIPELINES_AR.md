# نتائج بحث أولية — تقنيات معالجة صور السيارات في MSHKUR

> مراجعة أولية لمصادر عامة بتاريخ 19 نوفمبر 2026. نتائج البحث لا تعني أن المشاريع أو أوزانها أو تراخيصها قد تم اعتمادها أو اختبارها. يجب فتح ملفات الترخيص، التثبيت على revision محدد، وتقييم النتائج قبل الاعتماد.

## 1) LumaCut
المصدر: https://github.com/ihateSAS/lumacut
- README يصف pipeline: BiRefNet segmentation، trimap، ViTMatte، ثم foreground color cleanup/blur-fusion.
- قيمة الدراسة: فصل مراحل segmentation وmatting وcolor decontamination؛ لا نحصر إزالة الخلفية في استدعاء model واحد.
- أسئلة الاختبار: حجم النموذج، التوافق مع browser/worker، ترخيص الأوزان والتدريب، زمن التنفيذ، أثر refinement على السيارات.
- القرار: دراسة معمارية ومقارنة fixtures، لا نسخ.

## 2) bg-remove
المصدر: https://github.com/mherazizbekyan/bg-remove
- README يصف pipeline متصفح: BiRefNet، guided-filter refinement، defringe، optional upscale، color correction، sharpening، batch/ZIP.
- يوضح استخدام Workers وWebGPU/WASM ومتطلبات cross-origin isolation لبعض تحسينات الأداء.
- قيمة الدراسة: pipeline قابل للتجزئة، batch workflow، capability checks، وحزم التصدير.
- القرار: prototype benchmark بعد مراجعة licenses والأوزان، ولا نستورد الاعتماديات تلقائياً.

## 3) Interactive Image Background Remover
المصدر: https://github.com/pricklygorse/Interactive-Image-Background-Remover
- README يذكر point/box selection، zoom/pan، brush، smart refine، mask refinement، trimap، batch، shadow/glow، undo/redo.
- قيمة الدراسة: واجهة التصحيح اليدوي/التفاعلي التي تكمل النموذج التلقائي؛ استخرج الوظائف المطلوبة لا واجهته أو أصوله.
- القرار: مواصفات interaction وQA داخل MSHKUR، مراجعة تراخيص الكود والنماذج قبل أي prototype.

## 4) Matte API
المصدر: https://github.com/rishn/Matte-API
- README يصف segmentation، background removal، masking، adjustments وSAM prompts ومorphological refinement.
- قيمة الدراسة: تجميع أدوات القناع والتحرير في workflow واحد.
- القرار: دراسة API/UX ومكونات refinement، مع مراجعة license وdependencies.

## 5) rembg
المصدر: https://github.com/danielgatis/rembg
- README يعرض بدائل معالجة الحواف: naive، decontaminate، alpha matting، ViTMatte؛ وهي خيارات تختلف في الجودة والكلفة.
- قيمة الدراسة: بناء policy اختيار refinement حسب الحاجة بدل تشغيل أقوى/أبطأ خطوة دائماً.
- القرار: benchmark فقط؛ الترخيص لكل وزن وdependency منفصل.

## 6) Spyne — Car Backgrounding
المصدر: https://www.spyne.ai/features/car-backgrounding
ومرجع التطبيق: https://play.google.com/store/apps/details?id=com.spyneai
- الصفحات العامة تذكر خلفيات، تحسين إضاءة، ظل/انعكاس، masking للوحة، angle classification، وQC.
- قيمة الدراسة: تسلسل تجربة المستخدم التجاري ومؤشرات الجودة، لا نسخ المحتوى/الواجهة.
- القرار: UX benchmark فقط، لا ندعي أن مزاياها قابلة للمقارنة قبل اختبارها.

## 7) مسار التنفيذ في MSHKUR
1. Audit للـBG0 الحالي وربط استدعاء النموذج وpatch/runtime والتصدير.
2. Fixtures سيارات متنوعة ومصرح بها، مع قياس baseline: وقت/ذاكرة/coverage/edge failures.
3. فصل mask pipeline عن UI: mask generation، refinement، compositing، export.
4. إضافة تصحيح mask (brush add/remove، feather/edge، undo/redo) أولاً.
5. QA بصري واختبارات regression قبل أي تبديل model.
6. دراسة plate detector/segmenter منفصل؛ blur coverage validator وmanual correction إلزاميان عند uncertainty.
7. glass segmentation لاحقاً، ثم tint يحافظ على highlights/reflections.
8. background composition مع scale/perspective/light/shadow، ثم export profiles.

## 8) المصادر
- LumaCut: https://github.com/ihateSAS/lumacut
- bg-remove: https://github.com/mherazizbekyan/bg-remove
- Interactive Image Background Remover: https://github.com/pricklygorse/Interactive-Image-Background-Remover
- Matte API: https://github.com/rishn/Matte-API
- rembg: https://github.com/danielgatis/rembg
- Spyne: https://www.spyne.ai/features/car-backgrounding
- Spyne mobile listing: https://play.google.com/store/apps/details?id=com.spyneai
