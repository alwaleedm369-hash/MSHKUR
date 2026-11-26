# وثائق مشكور — الفهرس الرسمي

> **المصدر التشغيلي للحقيقة هو الكود تحت `src/` و`server/` و`skills/`، وليس عدد ملفات MD.**

## وثائق معتمدة (اقرأ هذه)

| الملف | الغرض |
|--------|--------|
| [MSHKUR_FINAL_EXECUTION_PLAN_AR.md](./MSHKUR_FINAL_EXECUTION_PLAN_AR.md) | خطة التنفيذ الوحيدة المعتمدة |
| [CAR_IMAGE_ENGINE_SPEC_AR.md](./CAR_IMAGE_ENGINE_SPEC_AR.md) | مواصفات محرك الصور |
| [ARCHITECTURE_AR.md](./ARCHITECTURE_AR.md) | البنية الحالية |
| [ENGINE_CORE_AR.md](./ENGINE_CORE_AR.md) | Maestro / skills / MCP |
| [OPEN_SOURCE_LICENSE_REGISTER_AR.md](./OPEN_SOURCE_LICENSE_REGISTER_AR.md) | تراخيص النماذج والمكتبات |
| [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md) | التشغيل والنشر |
| [RESEARCH_DECONSTRUCTION_PLAYBOOK_AR.md](./RESEARCH_DECONSTRUCTION_PLAYBOOK_AR.md) | منهج البحث والتفكيك |
| [RESEARCH_CAR_IMAGE_PIPELINES_AR.md](./RESEARCH_CAR_IMAGE_PIPELINES_AR.md) | نتائج بحث أولية (ليست تنفيذ) |

## الكود التشغيلي للمحرك

- `src/mshkurImageEngine.ts` — SEGMENT → MATTE → SCENE → LIGHT → PLATE
- `src/GuestStudio.tsx` / `src/CarAdWorkflow.tsx` / `src/EngineWorkbench.tsx`

## أرشيف

انظر [archive/README.md](./archive/README.md).

## قاعدة

لا مهارة جديدة بدون `entrypoint` وتشغيل. لا وثيقة «مكتمل» بدون اختبار على `main`.
