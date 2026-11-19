# مشكور ENGINE — المخطط الشامل
**الإصدار:** 0.1 / 19 نوفمبر 2026  
**هدفه:** محرك داخلي لمعالجة صور السيارات، يقلل الاعتماد على APIs مدفوعة، ويستعمل نماذج/أدوات مفتوحة المصدر بعد مراجعة ترخيص كل كود ووزن ودataset.

## القرار
- نجمّد توسع المهارات المنفصلة ونركز على engine core.
- الصورة الأصلية غير قابلة للتعديل؛ كل معالجة artifact مشتق مع recipe.
- Tool-first UI: رفع، أداة، معاينة، تصحيح، مقارنة، تنزيل.
- معالج محلي عند ملاءمته، أو خادم inference مملوك لمشكور عند الحاجة.
- لا ننسخ الكود/الأصول المحمية؛ تحليل تجارب المنتجات علناً وتطوير حلول مستقلة.
- لا ادعاء إتمام دون benchmark واختبار.
- لا تفعيل نموذج/وزن قبل license register/checksum/NOTICE review.

## المحركات
1. MSH-SEG: foreground segmentation للسيارة.
2. MSH-MATTE: refine edges، holes، feather، decontamination.
3. MSH-PLATE: كشف اللوحة، polygon/box، blur/pixelate/opaque privacy.
4. MSH-LIGHT: exposure، brightness، contrast، highlights، shadows.
5. MSH-COLOR: white balance، temperature/tint، vibrance.
6. MSH-GLASS: tint ضمن mask، preserve highlights/reflections.
7. MSH-SHADOW: الاحتفاظ/إزالة/توليد contact shadow.
8. MSH-SCENE: خلفية، scale، placement، perspective.
9. MSH-QUALITY: mask/output QA، plate coverage، clipping/edge review.
10. MSH-OUTPUT: export، formats، resolution، metadata policy.

## Pipeline
Intake -> normalize/EXIF -> plate candidate detection -> privacy edit -> segmentation -> matte refine -> lighting/color -> glass mask/tint -> scene/background -> shadow -> QA -> export.
ترتيب العمليات قابل للتعديل؛ سياسة الخصوصية قد تتطلب إخفاء اللوحات قبل التصدير. أصل الصورة محفوظ دائمًا.

## Milestone E1 — Cutout
- نموذج foreground benchmark.
- model adapter، cache، checksums.
- mask editor: add/erase، polygon، feather، grow/shrink، holes.
- edge QA على خلفية فاتحة/داكنة/ checker.
- PNG alpha، before/after، download.
- لا weights في Git.

## E2 — Plate privacy
- model shortlist وlicense audit.
- كشف مع confidence وmanual fallback.
- blur/mosaic/opaque modes.
- post-export coverage QA.
- عدم تخزين plate OCR text افتراضياً.

## E3 — Light/color
- exposure، contrast curves، highlights/shadows، WB، saturation.
- auto proposal قابل للتعديل/reset.
- clipping warnings، recipes، undo/redo.

## E4 — Glass
- manual mask أولاً.
- tint color/intensity، feather، highlight/reflection preservation.
- automatic glass segmentation فقط بعد benchmark.

## E5 — Scene/shadow
- assets مرخصة/مملوكة.
- compositor، scale، position، ground plane.
- shadow controls.
- generative edits explicit and warned.

## E6 — Skills/agents/workflow
Skills typed schemas + tool bindings + permissions + tests.
Agents plan/propose/run only registered tools; no silent publishing, deletion, or external transfer.
Workflow DAG with retries/cancel/state/events.

## Architecture
React/TypeScript frontend; engine contracts; adapters; ONNX Runtime/PyTorch or browser runtime; OpenCV/sharp for classic CV; local/server inference; asset store; QA gate; task orchestrator.
Processing contract: id/version, input assets/parameters/mask, outputs, status, warnings, errors, provenance (engine/model/hash/license/parameters), privacy/retention.
Browser processing has memory/latency/device limits. Self-hosted inference avoids per-request vendor API but still costs compute and maintenance.

## Quality dataset
Build lawful test set (consented dealership images, staged shoots, or explicitly licensed datasets). Stratify car types/views, background clutter, reflections, glass, shadows, low light, crops, plate angle/occlusion, multiple vehicles. Keep test split isolated.
Segmentation metrics: IoU/Dice, boundary F-score, human completeness/halo review.
Plate: recall/coverage and misses; uncertainty => manual review.
Light/color: clipping/color fidelity and subjective review.
Output: integrity, dimensions, alpha, latency, memory, failures.

## Release gate
- no severe privacy misses in plate benchmark; uncertain regions reviewed.
- car body components (mirrors, wheels, antennas) not lost beyond approved thresholds.
- edge quality across light/dark/checker.
- export validity; build/smoke tests; privacy/retention; accessibility/mobile; dependency/license register; SBOM.

## License register
- BiRefNet family: candidate; repository/checkpoint license and exact version must be independently recorded before use. Sources: https://github.com/ZhengPeng7/BiRefNet
- SAM 2: official repository states Apache 2.0 for code/model/checkpoints; third-party dependencies reviewed separately: https://github.com/facebookresearch/sam2
- OpenCV 4.5+: official page states Apache 2.0: https://opencv.org/license/
- ONNX Runtime, Sharp, detectors, weights, datasets: audit each separately.
No non-commercial weights for commercial deployment without a specific rights review. License research is not legal advice.

## UI React migration
React screens/components only; HTML prototypes are references, not parallel product pages.
- carAI UI Design: upload/tool-first useful elements.
- Refined UI: review/confirmation patterns.
- Mobile Screens: responsive and state patterns.
- Haraj Publish: P1 later.
- Approval List: reuse existing ApprovalQueue.
Main existing screens: GuestLanding, GuestStudio, CarAdWorkflow, ApprovalQueue; avoid duplicates.

## Skills
car-photo-intake; background-cutout; plate-privacy; lighting-correction; glass-tint; scene-composition; output-quality-review; vehicle-ad-preparation (later).
Each: schema, inputs, outputs, registered tools, permission, failure policy, test, version.

## Agents
Photo Intake Agent; Pipeline Agent; Quality Agent; Listing Agent (later); Workflow Coordinator. Tool access is explicit/typed. User confirmation required for publish, irreversible deletion, or external transfer.

## Roadmap
E0 baseline audit + licenses + dataset.
E1 cutout.
E2 plate privacy.
E3 light/color.
E4 glass.
E5 scene/shadow.
E6 orchestration and skills.
E7 release gates.
