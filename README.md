<<<<<<< HEAD
# MSHKUR — Smart Automotive Platform

[![Deploy to GitHub Pages](https://github.com/alwaleedm369-hash/MSHKUR/actions/workflows/deploy.yml/badge.svg)](https://github.com/alwaleedm369-hash/MSHKUR/actions/workflows/deploy.yml)

**Live Demo**: https://alwaleedm369-hash.github.io/MSHKUR/

---

## Overview

MSHKUR is a mobile-first, bilingual (English/Arabic), PWA-ready automotive platform with four focused micro-apps and a shared intelligent execution layer.

### 🎯 Product Areas

| App | Description | Key Features |
|-----|-------------|--------------|
| **Photo Studio** | Vehicle image processing | Real background removal (@imgly), KeepOriginal, CompareViewer, multi-format export |
| **Ad Studio** | Vehicle listing creation | 5-step bilingual ad builder, auto-copy generation, drafts, approval-gated publishing |
| **Dealer Portal** | Inventory & CRM | Live KPIs, vehicle CRUD, buyer leads, showroom profile, one-shot ad prefill |
| **AI Assistant** | Personal task runtime | Structured intake, clarification, planning, permission preflight, human approval gates |

### 🧠 Smart Layer (Shared)
- **Skill Runtime**: Manifest-driven, verified-only execution with contracts
- **Task Runtime**: Audit-logged, recoverable, approval-gated dispatch
- **Contextual Layer**: Route-aware suggestions with approval handoffs

---

## Quick Start

```bash
# Install
npm install

# Develop
npm run dev

# Build & verify
npm run verify:all

# Preview production build
npm run preview
```

---

## Gates Implemented

- ✅ **Gate 1**: Mobile Shell (E/ع, Light/Dark, RTL/LTR, 4-app nav + AI trigger)
- ✅ **Gate 2**: Real Background Removal (client-side neural, KeepOriginal)
- ✅ **Gate 3**: Compare & Export (slider, zoom, metadata, PNG/JPG/WebP)
- ✅ **Gate 4**: Skill Runtime (manifest, permissions, I/O validation, evidence)
- ✅ **Gate 5**: Task Runtime (intake→clarify→plan→dispatch→audit, approval gates)
- ✅ **Gate 6**: Ad Studio & Dealer Workspace (persistent stores, cross-app handoffs)
- ✅ **Gate 7**: Admin Browser (REA, agents, calendar, maps, asset export)
- ✅ **Gate 8**: Contextual Browser Layer (route-aware suggestions, approval handoffs)

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State**: Zustand, React Router v6
- **UI**: Radix UI, Lucide icons, Framer Motion
- **PWA**: Service Worker, Web App Manifest, Workbox
- **Processing**: @imgly/background-removal (ONNX/WASM)
- **Testing**: Vitest, React Testing Library
- **Deploy**: GitHub Actions → GitHub Pages

---

## Deployment

Automatic via GitHub Actions on push to `main`:

1. Push to main branch
2. GitHub Actions runs: `type-check` → `build` → `deploy`
3. Live at: **https://alwaleedm369-hash.github.io/MSHKUR/**

See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) for detailed steps.

---

## Project Structure

```
src/
├── apps/
│   ├── photo-studio/       # Image processing workspace
│   ├── ad-studio/          # Ad creation & publishing
│   ├── dealer-portal/      # Inventory & CRM
│   ├── ai-assistant/       # Personal task runtime
│   └── admin-browser/      # Admin workbench
├── shared/
│   ├── components/         # Layout, Header, ContextualBar, UI primitives
│   ├── hooks/              # useLocaleTheme, usePWA
│   ├── runtime/            # SkillRuntime, TaskRuntime
│   ├── skills/             # Skill registry & contracts
│   ├── engines/            # Background removal, image processing
│   ├── assistants/         # Assistant manager
│   ├── integrations/       # Google, WhatsApp, Haraj
│   ├── context/            # ContextualLayer (Gate 8)
│   ├── stores/             # Workspace, Admin stores
│   ├── admin/              # Admin store
│   ├── styles/             # Global CSS, design tokens
│   └── types/              # Shared TypeScript types
├── main.tsx                # Entry point
└── App.tsx                 # Routes + Layout
```

---

## License

Proprietary — MSHKUR Platform

---

## Contributing

Internal project — follow AI Continuity Protocol:
- Read `docs/AI_CONTEXT.md`, `docs/AI_HANDOFF.md`, `docs/AI_CHANGELOG.md`
- Verify before implementing
- Update handoff/changelog on every session

---

**Last Gate**: 8 (Contextual Browser Layer)  
**Status**: Ready for production deployment
=======
# مشكور | MSHKUR OS

The interface is English-first with a persisted Arabic RTL mode. Core workflows remain task-first and mobile-first.

Runtime verification requires Node.js 22 or newer. The current work environment exposes Node 20.14.0, so SQLite/API suites cannot be validated here until a Node22 runtime is selected.

مساحة عمل عربية للمعارض تبدأ من المهمة والنتيجة: إضافة السيارة، تجهيز الصور، إعداد الإعلان، ومتابعة العملاء. خلف الواجهة يعمل Maestro مع مهارات مسموحة ومساعدين متخصصين. نستخدم REA (Reverse Engineer Anything) كأداة تطوير مستقلة لتحليل المشاريع المصرح بها، وليس كخدمة runtime.

> **حالة الإطلاق:** نواة فعلية قيد التطوير، وليست جاهزة للإطلاق التجاري بعد. راجع [تدقيق المشروع 23 نوفمبر 2026](docs/PROJECT_AUDIT_2026-11-23_AR.md) و[دليل معاينة GitHub Pages](docs/GITHUB_PAGES_PREVIEW_AR.md).

**Google AI Studio ليس جزءاً من التصميم أو التطوير أو التشغيل.** Google Sign-In وخرائط Google موصلات اختيارية مستقلة فقط؛ الوظائف الأساسية تعمل دونها.

## الفروع

- `main`: المصدر الأصلي، لم يتم استبداله.
- `build/phase-01-real-foundation`: أساس React/Express وواجهة RTL.
- `build/phase-02-engine-core`: SQLite، تسجيل المستخدمين، عزل المعارض، سجل السيارات، المهارات المحلية، Maestro أولي، الموافقات، وتصميم تجربة المهمة.

## التشغيل

المتطلبات: Node.js 22 أو أحدث، npm.

```bash
cp .env.example .env
npm install
npm run dev
```

- الواجهة: http://localhost:3000
- API: http://localhost:4174/api/health
- قاعدة البيانات: `./data/mshkur.sqlite` (تُنشأ تلقائياً)

## الاختبارات والبناء

```bash
npm test
npm run typecheck
npm run build
npm run db:check
npm run backup
npm run check
```

## ما يعمل في هذه المرحلة

- تسجيل بريد/كلمة مرور محلي، جلسة HttpOnly، وتجزئة كلمات المرور بـ scrypt.
- إنشاء مساحة معرض مستقلة عند التسجيل.
- SQLite مع WAL وفصل بيانات المعارض في مسارات السيارات والمهام.
- إضافة وعرض وتعديل وحذف السيارات (الحذف للمالك/المسؤول).
- سجل تدقيق للعمليات الأساسية.
- سجل مهارات allowlist وملفات Agent Skills.
- مهارات محلية: مسودة إعلان من بيانات مؤكدة، تدقيق سجل السيارة، تحسين الصورة إلى WebP، وطمس مستطيل يحدده المستخدم.
- إزالة خلفية محلية في المتصفح عبر BG0/BiRefNet؛ نموذج Lite يقارب 98.5 MB يُحمّل عند أول استخدام ويُخزن في المتصفح.
- Maestro ينشئ المهام ويحفظ حالتها ونتائجها، ويستعيد المهام المعلقة بعد إعادة التشغيل؛ يدعم إلغاء المهام المنتظرة وطلب إلغاء الجاري بعد انتهاء العملية الحالية، وإعادة محاولة المهام الفاشلة حتى 3 محاولات.
- سير عمل فعلي لمسودة إعلان السيارة: فحص بيانات السجل ثم إنشاء المسودة مع حفظ خطوات التنفيذ ونتائجها.
- سجل موافقات للأفعال الخارجية، ولا يوجد موصل خارجي ينفذها حتى الآن.
- خادم MCP محلي عبر stdio بأدوات tenant-scoped لقراءة المهارات والموظفين والسيارات والمهام وتشغيل المهارات الخادمية المسموحة.
- روابط خرائط Google من عنوان/مدينة السيارة دون Maps API key.
- مساعد عربي يصنف عدداً محدوداً من الطلبات المعروفة دون LLM مدفوع.

## ما لم يُفعّل بعد

Google OAuth، خرائط تفاعلية مدمجة، كشف اللوحات تلقائياً، WhatsApp، MCP connectors، Browser automation، تشغيل LLM محلي بعد إعداد النموذج، تعدد العمال، ودفع/اشتراكات. لا تظهر هذه الميزات على أنها متصلة حتى يتم تنفيذها واختبارها.

## استضافة الإنتاج

استخدم قرصاً دائماً لـ `MSHKUR_DB_PATH`؛ لا تضع SQLite في مساحة نشر مؤقتة. SQLite مناسب لنسخة أولى منخفضة الحركة على خادم واحد. عند التوسع إلى عدة خوادم أو كثافة كتابة، ننتقل إلى PostgreSQL مع خطة ترحيل.

## مراجع التنفيذ

- [تقرير التدقيق الأول](docs/PHASE_01_AUDIT_AR.md)
- [البنية المعمارية](docs/ARCHITECTURE_AR.md)
- [المحرك الداخلي](docs/ENGINE_CORE_AR.md)
- [REA وMCP](docs/REA_MCP_AR.md)
- [مختبر النماذج والضغط](docs/MODEL_LAB_AR.md)
- [مراجعة التراخيص](docs/LICENCE_REVIEW_AR.md)
- [دليل REA](tools/rea/README_AR.md)
- [خادم MCP المحلي](tools/mcp/README_AR.md)
- [مختبر النماذج وأدوات الضغط](tools/model-lab/README_AR.md)
- [خارطة التنفيذ](docs/ROADMAP_AR.md)
- [دليل النشر](docs/DEPLOYMENT_AR.md)
- [خدمات Google الاختيارية](docs/GOOGLE_SERVICES_AR.md)
- [مصنع استيراد المشاريع والمهارات المفتوحة](docs/OPEN_SOURCE_IMPORT_FACTORY_AR.md)
- [خريطة المحركات الهجينة والاختيارات التجارية](docs/ENGINE_SELECTION_BLUEPRINT_AR.md)

## مبادئ غير قابلة للتفاوض

- لا API مدفوع كشرط للمسار الأساسي.
- لا أسرار أو ملفات جلسات في Git.
- لا مهارة أو كود يولده نموذج يُنفذ دون مراجعة واعتماد.
- لا اختراع لمواصفات السيارة ولا تغيير لهويتها.
- لا إرسال أو نشر أو شراء أو حذف خارجي دون موافقة صريحة.
- نفحص ترخيص الكود والأوزان والاعتماديات كلٌ على حدة.


## إضافات مساحة العمل الموحدة

- **ألبوم السيارة:** رفع صور متعددة وربطها بسجل سيارة واحد، مع حفظ الأصل كملف مستقل. نتائج إزالة الخلفية والتحسين والطمس والقص ومشهد الاستوديو وتضليل الزجاج اليدوي من صورة مختارة من الألبوم تُحفظ كنسخ مشتقة مرتبطة بملف الأصل، ولا تستبدل الأصل. يعرض سجل الصورة مقارنة قبل/بعد وإصداراتها، وتبقى النسخ المتعاقبة مرتبطة بالأصل الجذري.
- **معالجة متسلسلة:** تشغيل تحسين WebP على مجموعة صور، صورة بعد صورة، وحفظ كل نتيجة مشتقة مرتبطة بالأصل. حالة كل صورة تحفظ في سجل batch.
- **حد الاستخدام المجاني الحالي:** 3 صور معالجة يومياً لكل مستخدم، و10 مسودات إعلان يومياً، و40 رسالة مساعد محلي يومياً. يمكن تغيير القيم من `server/media-growth-routes.mjs` بعد قياس تكلفة التشغيل.
- **صفحة المعرض العامة:** رابط `/s/<tenant-slug>` يعرض السيارات التي وافق المالك على نشرها محلياً. نشر السيارة يتطلب ضغط زر «نشر الصفحة» وتأكيداً.
- **محادثة الموقع:** واجهة محادثة عامة تحفظ الرسائل وتظهر في الوارد؛ الرد الحالي محدود بقواعد FAQ ولا يدعي أنه Gemini أو نموذج لغوي.
- **مساعد النمو:** يجهز استعلامات خرائط Google حسب المدينة ونوع النشاط. لا يجمع أرقام أشخاص ولا يرسل رسائل تسويقية.
- **مركز المالك:** ملخص السيارات والوسائط والمهام والموافقات والمحادثات وحدود الاستخدام.
- **مكتبة المهارات وسير العمل:** شاشة تقرأ سجل المهارات والوصفات الفعلية من API.
- **مهام العمل:** سجل tenant-scoped للمهام مع تحديث تلقائي لحالات التنفيذ كل 5 ثوانٍ.
- **مصنع المصادر المفتوحة:** استيراد ملف `SKILL.md` من GitHub العام مع فحص الترخيص وتثبيت commit SHA وحفظه في قائمة مراجعة معزولة؛ لا يشغّل كوداً مستورداً. استنساخ المستودع الكامل ومراجعة الاعتماديات وتفعيل المهارة ما زالت مراحل لاحقة.
- **حساب فردي أو معرض:** نوع مساحة العمل يحفظ عند التسجيل.

## قنوات Google وWhatsApp — الحالة الدقيقة

- خرائط Google تعمل حالياً بروابط بحث خارجية وdeep links؛ لا يوجد Google Maps JavaScript embedded ولا OAuth.
- Google Sign-In وDrive وGemini غير متصلة بعد؛ تحتاج إعداد OAuth/Google Cloud ومراجعة scopes ومفاتيح سرية على الخادم.
- Google AI Studio مكان اختياري لمراجعة/تعديل الكود أو استكمال الموصلات فقط، وليس أداة تصميم أو شرط تشغيل.
- محادثة الموقع تعمل داخل صفحة العرض وتحفظ الاستفسارات؛ يستطيع المالك إضافة رقم WhatsApp ورابط موقع المعرض من مركز المالك، فتظهر أزرار click-to-chat وموقع المعرض في الصفحة العامة. هذا فتح محادثة يدوية بمبادرة الزائر، وليس chatbot متصلاً بصندوق WhatsApp.
- WhatsApp Business API أو ربط WhatsApp Web/QR غير منفذ. لا نستخدم أتمتة WhatsApp غير رسمية أو scraping ولا ندعي أن الإرسال الآلي مجاني.

## ما لا يزال ناقصاً قبل المعاينة الإنتاجية

- ربط Google OAuth فعلياً، Drive file picker/upload، Gemini opt-in، وخريطة تفاعلية مدمجة.
- قناة WhatsApp رسمية، مزامنة الرسائل، قوالب Meta، وموافقات إرسال.
- الكشف الآلي عن اللوحات والزجاج، وتظليل الزجاج التلقائي غير متاح. الموجود حالياً إزالة خلفية محلية، تركيب أربعة مشاهد استوديو ثابتة بظل/انعكاس تركيبيين، تضليل زجاج يدوي بمضلع، طمس منطقة يدوي، وتحسين WebP.
- ترتيب صور السيارة تلقائياً حسب الزوايا، Undo/redo عكسي لكل عملية، وكتالوج PDF. المقارنة قبل/بعد وسجل النسخ المرتبطة بالأصل متاحان الآن. كما يمكن تنزيل ملف إعلان HTML مستقل يضم الصور والبيانات المؤكدة.
- تشغيل اختبارات CI على runner فعلي، اختبار PWA على الجوال، ومراجعة الأمان والخصوصية وPDPL.
>>>>>>> 5cac2c6638c612a91f5d8042e523b39575bf6267
