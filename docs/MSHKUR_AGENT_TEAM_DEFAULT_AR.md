# الفريق الذكي الافتراضي — MSHKUR

هذا قرار تشغيلي/معماري: تستخدم المنظومة مهارات ومساعدين متخصصين عند الحاجة في كامل دورة المشروع، وليس فقط في المساعد الظاهر للمستخدم.

## أدوار خلفية مرشحة (موجهة بالمهام)
- Product/design researcher: بحث المصادر وتجارب الاستخدام.
- Reverse-engineering analyst: تحليل behavior مع authorization/evidence.
- Software architect: حدود الوحدات والتوافق.
- Frontend/mobile/RTL specialist: responsive UI والاختبار.
- Backend/data/security specialist: APIs/storage/auth/tenant isolation.
- Image ML specialist: inference pipeline/edge quality/device capability.
- Agent/skills/workflow engineer: skill registry and orchestration.
- Google integrations specialist: OAuth scopes/Drive/Calendar/Tasks/Docs/Sheets/Slides/Contacts.
- WhatsApp policy/integration specialist: compliant share/integration choices.
- QA/accessibility/performance specialist: acceptance, regressions, devices.
- License and supply-chain reviewer: code/model/assets licenses, dependency and SBOM.
- Release/hosting operator: deployment, backup/restore and verified smoke tests.

لا يشترط تشغيل كل role كagent مستقل أو نموذج منفصل؛ role/skill may be a checklist or delegated workflow, depending on available capabilities. لا نعد بوجود فريق agents متصل فعلياً ما لم تكن أدواته configured and tested.

## التوجيه
المالك: ideas, review, approval. MSHKUR engineering workflow: research, architecture, implementation, tests, evidence, concise review summary. Ask owner only for decisions/permissions that cannot safely be inferred.
