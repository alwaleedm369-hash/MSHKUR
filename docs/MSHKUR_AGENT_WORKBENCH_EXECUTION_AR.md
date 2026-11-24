# MSHKUR OS — Workbench الذكي ومبدأ التنفيذ

**الحالة:** مواصفة تنفيذية أولية للمرحلة الثالثة، وليست دلالة على أن الوظائف أدناه منفذة.  
**الفرع:** build/phase-03-agent-workbench

## القرار الحاكم
MSHKUR طبقة تنفيذ ذكية فوق الأدوات والخدمات والمواقع التي يملك المستخدم حق الوصول إليها. المستخدم يحدد الهدف ويفكر ويراجع ويوافق؛ المنصة والمهارات والمساعدون يديرون البحث والتحليل والتنفيذ والتنسيق والتوثيق والاختبار قدر الإمكان. لا يُطلب من المستخدم تعلم الكود أو إدارة الخدمات.

## حدود التنفيذ
- لا تكلفة API مدفوعة إلزامية في المسار الأساسي. البدائل المحلية/المفتوحة والموارد المتاحة تقارن قبل أي اعتماد.
- أي تكامل خارجي يحتاج موافقة، صلاحيات واضحة، وتأكيد عملي. لا ندّعي الربط قبل الاختبار.
- REA وأدوات التفكيك: تحليل مستقل للمصادر المصرح بها، دون تجاوز الحماية أو استخراج أسرار/بيانات خاصة، ولا نسخ code/assets المحمية.
- لا تفعيل كود أو مهارة مستوردة تلقائياً. عزل، مراجعة license/dependencies، اختبار، ثم اعتماد.
- KeepOriginal: المصدر لا يتغير؛ المخرجات مشتقة ومرتبطة بالأصل وإصداراتها.
- Mobile-first، RTL عربي، واجهات تبدأ من المهمة والنتيجة، لا لوحة تحكم مطولة.
- لا تتجاوز الموافقة البشرية على نشر/إرسال/شراء/حذف/تغيير خارجي.

## واجهة Workbench المقترحة (المدير)
مساحة داخل المتصفح الذكي، وليست تطبيقاً مستقلاً:
1. **موجّه المهمة:** إدخال هدف بالعربية أو اختصار.
2. **العمل الجاري:** حالة المهمة، الخطوات، سبب اختيارها، المصادر، والأخطاء.
3. **المهارات:** skill cards (المهمة، version، license، permissions، test status، cost profile).
4. **المساعدون:** متخصصون قابلون للاستدعاء ومحدودون بالصلاحيات.
5. **Maestro:** اختيار workflow وتوجيه المهام، إدارة dependences/queues، cancellation، retries، checkpoints، handoff.
6. **مصادر/REA:** دراسة مستودعات ومواقع وأدوات مرخصة، وتسجيل evidence/decision.
7. **المراجعة والموافقة:** مقارنة قبل/بعد، diff، preview، approve/reject.
8. **سجل/قياس:** logs، performance، quality، costs، outcomes، audit.

## Workflow execution contract
Task → clarify (only if essential) → plan → select skills/assistants → preflight (permissions, license, cost, risks) → execute isolated steps → validate → present result/evidence → user approval when external action → record outcome.

كل step يحمل:
- id, taskId, input/output schemas, status, timestamps, worker/skill version
- permission scope, provenance, parent/original refs
- bounded retries, timeout/cancel behavior
- logs without secrets, result validation, cost/resource estimates
- approval gate if external/irreversible

## Skill lifecycle
DISCOVER → INSPECT (license/security/dependencies) → SPEC → PROTOTYPE → TEST (fixtures, edge cases, benchmark) → REVIEW → APPROVE → INSTALL (sandbox/allowlist) → MONITOR → UPDATE/ROLLBACK.
Skill manifest مطلوب: name/id/version, entrypoint, schema, dependencies, license, source commit, permissions, resource limits, runtime, quality tests, benchmark, status. Skills must have an executable entrypoint and contract test before runtime use.

## Assistant lifecycle
Specialized assistant is a planner/reviewer/coordinator, not unrestricted executor. It receives bounded context and tools; tasks and external actions remain policy-gated. Hand-off must carry task ID, structured context, findings, and next step; avoid duplicate work.

## REA/Open-source import factory
- Research only public/authorized sources.
- Record exact repo/version/commit, license of code/models/data/assets, dependencies and advisories.
- Extract concept/UX/pipeline, not protected code or artwork.
- Import candidate into quarantine; no execution on import.
- scan, review, isolated tests, benchmark, approval, release notes.
- maintain source attribution/notices and rollback.
- reject sources with unclear rights, dangerous dependency, or inaccessible protection bypass.

## P0 implementation sequence
1. Baseline audit of main, build/test results (do not invent results; record blocker).
2. Build actual Workbench UI integrated into Admin Browser (RTL/mobile responsive), not mockup.
3. Connect it to existing Jobs/skills APIs only where verified; expose unsupported capabilities as disconnected.
4. Task orchestration contract with durable status, retry, cancellation, approval checkpoints and audit.
5. Skill catalog + inspect/review/test/install states; use existing local skills first.
6. Quarantined Open-source Import Factory and source/license record.
7. REA research workspace with evidence capture and compare/build/test flow.
8. Benchmarks for priority vehicle-photo skills, quality and performance.
9. Integration test, security review and deployment readiness; no claim of completion before evidence.

## P1
- Browser automation through explicitly approved/safe browser workflow; never stealth/captcha bypass.
- App/service connectors with least privilege and consent, starting with low-cost options.
- Content Marketing Lab as admin workflow: trend sources → report → approved idea → script/storyboard/assets → review → calendar → publish only through legitimate integrations → analytics/learn. This remains a later workflow unless P0 foundation stable.
- Shared orchestration across the three car applications and the general assistant app.

## Definition of Done
Visible function connected to a real endpoint/skill; contract and tests; permission boundary; failure/retry and recovery; evidence/source record; mobile/RTL; audit log; no hidden paid API dependency; clear approval gate; deployment and rollback documented.