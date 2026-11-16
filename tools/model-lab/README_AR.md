# مختبر النماذج المحلي

الأدوات هنا اختيارية وتعمل على جهاز بناء أو خادم خاص؛ لا تُنفذ أثناء طلب المستخدم ولا تتصل بخدمات مدفوعة.

## GGUF / llama.cpp

ثبّت llama.cpp من مصدره الرسمي، ثم نفّذ:

```bash
tools/model-lab/quantize-gguf.sh input.gguf models/output-q4.gguf Q4_K_M
```

## ONNX Runtime

أنشئ بيئة Python منفصلة وثبّت onnxruntime وonnxruntime-tools/onnx حسب توثيق ONNX Runtime، ثم:

```bash
python tools/model-lab/quantize-onnx.py input.onnx models/output-int8.onnx --type qint8
```

اختبر الدقة والسرعة والذاكرة على عينة مشكور قبل اعتماد أي نموذج. قد لا تتحسن كل بنية نموذج مع dynamic quantization.

## تسجيل النموذج

سجّل كل نموذج وفق `model-manifest.schema.json`. لا تقبل أوزاناً من مصدر مجهول، ولا تُفعّل نموذجاً قبل التحقق من SHA-256 والترخيص والحجم والذاكرة المطلوبة. رخصة مكتبة التشغيل لا تحل محل رخصة الأوزان.
