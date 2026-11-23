# MSHKUR — الوثيقة الشاملة

## الرؤية
منصة عمل ذكية فوق الإنترنت والأدوات تحول الطلب/الصور/البيانات إلى مخرجات عملية. السيارة منتج تخصصي؛ المنصة ليست موقع سيارات أو dashboard. قاعدة التجربة: **مدخل بسيط، مخرج واضح، وموافقة المستخدم**.

## المنتجات الظاهرة
1. إزالة خلفية: للجميع، صورة مباشرة، local inference، نتيجة PNG شفافة، تنزيل/مشاركة، refine edges، أدوات إضافية عند الحاجة فقط.
2. مشكور المساعد الشخصي: للجميع، شخصية ومحادثة؛ بحث، محتوى، ملفات، مهام وتقويم عبر skills/connector opt-in. يظهر الناتج والموافقة لا أسماء agents.
3. مشكور سيارة: بائع/مشتري/معرض حسب الدور. سجل سيارة وألبوم واحد، تجهيز الصور، الإعلان، محتوى متعدد، صفحة هوية/business card/link/QR واستفسارات.

## قاعدة UX
- شاشة تفتح المنتج مباشرة؛ mobile-first RTL، عربي، light.
- المستخدم: إدخال → معاينة → مراجعة → موافقة → تنزيل/مشاركة/نشر.
- الإعدادات والتقنيات والوكلاء والمهارات والإدارة محجوبة عن الواجهة العادية.

## Shared engine
Maestro orchestrator; workflow definitions; skill registry; agent roles called on demand; connectors; project/asset lifecycle; approval gate; audit; budgets; task state; retry/idempotency/checkpoints. Skill manifest: inputs/outputs schemas, permissions, risk tier, handler allowlist, source/version/license, tests, budget/timeouts.

## Google (optional, consent-based)
One-click OIDC sign-in opt-in; Drive picker/save; Gemini/AI Studio adapter; Docs/Sheets/Slides/Calendar/Tasks/Contacts when needed. Minimal scopes, server-side encrypted tokens, revoke/consent, no client secrets. Free quotas/availability are not guaranteed; prevent paid billing/automatic upgrade; no Google dependency for core.

## WhatsApp
No paid API required for basics: wa.me links, share intents, QR, copy/download and user sends. No claim of WhatsApp Web automation or free QR session bot. Inbox/automation only with policy-compliant connector and approval.

## Content and publishing
Brand assets/facts → templates → variants → preview → approval → channel adapter → receipt. Business identity page/link/QR and share. Never assert published without confirmed connector response.

## Studio
Browser local inference (BG0/BiRefNet; WebGPU/WASM) and local image actions; keep immutable originals, versions, history. Sharp for non-inference operations. Model weights and third-party notices separately licensed. No mandatory paid API.

## Admin Agent
Task-driven private interface for authorized research, browser/computer use, GitHub, hosting, code edits, tests, previews and release. Domain allowlist, isolation, sanitized logs; approvals for credentials, billing, destructive changes, DNS, publish/deploy. Never bypass 2FA/CAPTCHA or policies.

## Security/privacy
Tenant boundaries, least privilege, RBAC, rate limits, audit, upload validation, durable storage, export/delete, PDPL readiness, scoped connectors, encrypted tokens, imported code isolated and reviewed. Skills are not executable merely because imported. External actions require explicit approval.

## Cost
No paid API mandatory. Local inference and tools where feasible; storage/hosting/device resource costs remain. Optional model APIs only with user opt-in and explicit billing boundaries.

## Technology path
React/TS/Vite PWA, Node/Express, SQLite+durable storage single-server initially, PostgreSQL if scale. Evolve existing Maestro, don't replace without measured need. Browser agent separate capability. GitHub Pages is static preview, not Express/SQLite hosting.

## Limitations
Model licensing separate; connector APIs and free tiers change; WhatsApp unofficial automation risky; reverse engineering only authorized and independently implemented; no feature considered complete without tests/evidence.
