# car-studio-pipeline

مهارة تشغيلية في المتصفح: `src/mshkurImageEngine.ts` → `runCarStudioPipeline`.

## المكدس المفتوح
- إزالة الخلفية: `@bg0/browser` + BiRefNet lite (تنزيل مرة عند أول استخدام)
- WASM: `@huggingface/transformers` onnx من `/onnx/` بعد `postinstall`
- ظل + خلفية + إضاءة + طمس: Canvas 2D (بدون ترخيص مدفوع)

## لا يُستخدم
- Remove.bg / Clipdrop / أي API مدفوع

## الاستدعاء
من `CarAdWorkflow` عبر `processCarAdImage`.
