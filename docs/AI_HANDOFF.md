# MSHKUR — Current AI Handoff

_Last handoff prepared: 2026-11-27 (Gate 8 intake verification). This is a handoff baseline, not a claim that all features are operational._

## Current gate
**Gate 8 (Contextual Browser Layer) — Implemented & Connected (Build/Test Execution Pending Node/npm).**
- **Gate 1–4:** Mobile-first bilingual shell (`E` / `ع`, Light/Dark), real client-side `removebackground` via `@imgly/background-removal` preserving source (`KeepOriginal`), interactive `CompareViewer.tsx` + `exportHelper.ts`, and `SkillRuntime` contract (`tests/skills/removebackground.contract.test.ts`).
- **Gate 5:** `AssistantTaskRuntime` & `PersistentTaskStore` (`src/shared/runtime/taskRuntime.ts`) wired to `AIAssistant.tsx` (`tests/runtime/taskRuntime.test.ts`).
- **Gate 6:** `workspaceStore.ts`, `AdStudio.tsx`, and `DealerPortal.tsx` with persistent inventory/CRM/drafts, one-shot Dealer-to-Ad prefill, JSON export, and approval-gated publishing (`tests/workspace/workspaceFlow.test.ts`).
- **Gate 7:** `adminStore.ts` and `AdminBrowser.tsx` covering REA sandbox intake, agent/workflow/task monitoring, marketing calendar scheduling, map research notes, asset brief export, and approval-gated actions (`tests/admin/adminBrowser.test.ts`).
- **Gate 8 (Contextual Browser Layer):**
  - Added `src/shared/context/contextStore.ts` with route-aware contextual suggestions (`getSuggestionsForRoute`) and local contextual action tracking (`useContextualLayer`).
  - Added `src/shared/components/ContextualBar.tsx` and mounted it inside `Layout.tsx` so users get concise, route-relevant next actions and approval-gated handoffs into `AssistantTaskRuntime` without cluttering the shell.
  - Added `tests/context/contextualLayer.test.ts`.

## Verification status & blockers
- **Blocked in this sandbox:** `node` and `npm` binaries are not installed in this Python container (`exit status 127`), so `npm install`, `npm run type-check`, `npm run build`, `npx vitest run`, and live preview/browser QA remain `NOT VERIFIED` here.
- **Critical defects found in this intake session (2026-11-27):**
  1. **Layout.tsx missing import**: `ContextualBar` is used at line 32 but not imported — will cause runtime error.
  2. **Components index missing export**: `ContextualBar` not exported from `src/shared/components/index.ts`.
  3. **No dependency installation**: `node_modules` absent; all type-checking, build, and test execution blocked until Node environment available.
- **Verified functionality (source code inspection only):**
  - Mobile shell with RTL/LTR, theme, 4-app bottom nav, central AI trigger
  - Photo Studio: drag-drop, real `@imgly/background-removal` integration, KeepOriginal, CompareViewer, Export
  - SkillRuntime: manifest gating (only `removebackground` verified), permission preflight, I/O validation
  - TaskRuntime: intake→clarify→plan→dispatch→audit, persistent store, human approval gates
  - Ad Studio & Dealer Workspace: persistent stores, cross-app handoffs, approval-gated publish
  - Admin Browser: REA intake, agent monitoring, calendar, map research, asset export
  - Contextual Layer: route-aware suggestions, approval flags, taskRuntime handoff
- **Partially verified:** All backend API routes/services exist but untested (no DB/Redis/queue running).
- **Unverified:** All TypeScript compilation, Vite build, Vitest tests, visual QA, responsive behavior, RTL layout, accessibility.
- **Next acceptance gate:** Fix missing imports, sync to `https://github.com/alwaleedm369-hash/MSHKUR.git`, run `npm install`, `npm run type-check`, `npm run build`, `npx vitest run` in CI/Node env, verify Gates 1–8 visually and functionally.


## 2026-11-27 continuation — Smart Graph and dormant WhatsApp
- Added `docs/architecture/MSHKUR_SMART_GRAPH_AND_TRAINING_AR.md` defining Smart Graph (Graphy codename), node/edge model, skill consolidation, assistant delegation, staged training/evaluation strategy, storage boundaries and acceptance gates.
- Changed `src/shared/integrations/whatsapp.ts` so auto-connect defaults to false; constructor and React hook connect only when `autoConnect: true`; reconnect loop is also opt-in. Explicit `connect()` remains available for a future user-approved activation.
- No Meta API configured or paid; no WhatsApp connection attempted by this change.
- Not yet implemented: production graph repository, persistent knowledge indexer, full memory service, training pipeline, WhatsApp UI/companion bridge.
- Verification still pending: project CI workflows have startup failures before jobs; full npm install/typecheck/test/build and device QA are not verified. Source-level changes must be tested in a working Node environment before release.


## Smart Graph persistence increment
- Added `server/graph-store.mjs` using the existing `better-sqlite3` database; creates typed node/edge tables and indexes, actor-scoped reads/snapshots, owner/workspace edge boundaries and FK cleanup.
- Added `tests/smart-graph-sqlite.test.mjs` (3 cases) and included it in `npm test`; dedicated graph workflow now runs `npm ci` and both graph suites.
- This adapter is not yet mounted as an HTTP endpoint; actor identity must come from authenticated server session before service integration. No test run has yet been observed for this commit.
