# MSHKUR AI Development Changelog

## 2026-11-26 — Continuity protocol and project handoff pack
- Added enduring project context and AI continuity/handoff protocol files.
- Added UX/design quality gate and project-chat instructions for the assistant named **Virtual Agent (الوكيل الافتراضي)**.
- Handoff remains Gate 0 recovery; dependency installation and baseline checks are not yet reproducibly verified.
- Next: incoming model must independently inspect and verify, recover reproducible dependencies/baseline, then implement Gate 1 Mobile Shell.

## Earlier baseline repairs (from working-copy report; dates/details as previously recorded)
- Repaired JSX in `MobileAdStudio.tsx`, `SettingsPanel.tsx`, and `ToolPanel.tsx`.
- Baseline build remained blocked by corrupted/truncated vendor source in `node_modules/@remix-run/router/router.ts`; test/lint tooling was unavailable. See `reports/BASELINE_REVIEW.md`.

## 2026-11-26 — Independent audit and false-success safety repair
- Reopened and inspected the handoff archive and continuity documentation; current work remains Gate 0.
- Verified that the Photo Studio processing handler previously marked jobs completed while reusing the original image blob/preview as a fake processed result.
- Changed the handler to record a failed job and an explicit unavailable message instead of presenting unchanged source images as processed.
- Changed the Photo Studio export handler to report that export is not connected, instead of showing a misleading progress message and closing the modal.
- Removed duplicate/unused import declarations identified in `src/App.tsx`, `src/apps/ad-studio/AdStudio.tsx`, and `src/apps/admin-browser/AdminBrowser.tsx`.
- Global TypeScript transpilation (syntax-only) successfully processed 55 TS/TSX files with zero syntax diagnostics. Full `tsc --noEmit` remains blocked by missing dependency typings and still reports additional source-level unused symbols.
- Dependency recovery/build verification was blocked: npm registry access timed out in this environment; no dependencies or lockfile were installed/generated.
- No visual browser/device QA was available in this run.
- Next: recover dependencies in a network-connected environment, run type-check/build/test/lint, then investigate/replace the actual processing engine stubs.

## 2026-11-26 — Gate 1 Mobile Shell & Gate 2 Real Remove Background / Export Wiring
- Implemented mobile-first shell in `Header.tsx`, `Layout.tsx`, `useLocaleTheme.ts`, `index.html`, and `App.tsx`: English-first (`LTR`) default, `E`/`ع` locale switcher (LTR/RTL), default Light mode with Sun/Moon toggle, compact 3-line menu without mobile masthead, 4-destination bottom bar + central 3-star AI sheet trigger, and `/` landing directly in Photo Studio / Remove Background.
- Added `src/shared/engines/backgroundRemovalService.ts` using `@imgly/background-removal` and declared `@imgly/background-removal` in `package.json`.
- Added `src/apps/photo-studio/utils/exportHelper.ts` for real client-side PNG/JPG/WebP conversion, resizing, and browser download while preserving `KeepOriginal`.
- Updated `PhotoStudio.tsx` and `MobilePhotoStudio.tsx` to execute real background removal and export, while continuing to fail honestly on unimplemented tools.
- Verification limitation: Node.js/npm and a headless browser are unavailable in this container (`node -v` -> not found), so dependency installation, `tsc`, `vite build`, and visual device QA remain `NOT VERIFIED` until run in a Node-enabled environment.

## 2026-11-26 — Gate 3 Compare/Export & Gate 4 Skill Runtime
- Rebuilt `src/apps/photo-studio/components/CompareViewer.tsx` with interactive pointer/touch drag slider, side-by-side mode, zoom controls (`0.5x`–`3x`), image metadata & version lineage inspector, and working derivative download via `exportHelper.ts`; connected `MobileImageGrid.tsx` compare mode to `CompareViewer`.
- Extended `ProcessedBlob` (`src/apps/photo-studio/types/index.ts`) and `PhotoStudio.tsx` / `MobilePhotoStudio.tsx` to track `version`, `parentId`, `width`, `height`, `mimeType`, `byteSize`, and `durationMs`.
- Implemented `src/shared/skills/runtime.ts` (`SkillRuntime`) with manifest discovery, verified-only status gating, permission preflight, input/output validation, timeout/cancellation, and execution evidence logging; integrated `removebackground` as the sole verified skill and routed Photo Studio execution through `skillRuntime`.
- Added Vitest contract tests in `tests/skills/removebackground.contract.test.ts` and exported runtime discovery/evidence helpers from `src/shared/skills/registry.ts`.
- Verification limitation: Node.js/npm and headless browser remain unavailable in this container (`node -v` -> not found), so `tsc`, `vite build`, `vitest`, and visual QA are `NOT VERIFIED` until run in a Node environment.

## 2026-11-26 — Gate 5 Assistant / Task Mini-Runtime & UI Wiring
- Implemented `src/shared/runtime/taskRuntime.ts` (`AssistantTaskRuntime` and `PersistentTaskStore`) with task intake, clarification handling, deterministic plan steps, permission preflight, verified skill/assistant dispatch, human approval gates for external actions, structured audit logging, and checkpoint persistence/recovery.
- Wired `src/apps/ai-assistant/AIAssistant.tsx` to `taskRuntime` and connected `?q=` handoff from the mobile bottom-sheet AI trigger, adding interactive clarification inputs, human approval/deny controls, and task audit cards.
- Added Gate 5 unit and recovery tests in `tests/runtime/taskRuntime.test.ts` and updated `docs/AI_HANDOFF.md`.
- Verification limitation: Node.js/npm and headless browser remain unavailable in this container (`node -v` -> not found), so `tsc`, `vite build`, `vitest`, and live preview QA remain `NOT VERIFIED` until run in CI or a Node environment.


## 2026-11-26 — Gate 6 Ad Studio & Dealer Workspace
- Added `src/shared/stores/workspaceStore.ts` for persistent Dealer inventory, buyer leads CRM, showroom profile, saved ad drafts, and one-shot vehicle-to-ad prefill handoff.
- Rebuilt `src/apps/ad-studio/AdStudio.tsx` with bilingual 5-step ad creation, automatic listing copy generator, saved drafts sidebar, JSON export, and approval-gated external publishing wired to `taskRuntime`.
- Rebuilt `src/apps/dealer-portal/DealerPortal.tsx` with live KPIs, vehicle CRUD & status filtering, CRM lead tracking, showroom profile settings, and direct "Create Ad" navigation into Ad Studio.
- Added Gate 6 tests in `tests/workspace/workspaceFlow.test.ts` and updated `docs/AI_HANDOFF.md`.
- Verification limitation: Node.js/npm and headless browser remain unavailable in this container (`node -v` -> not found), so `tsc`, `vite build`, `vitest`, and live preview QA remain `NOT VERIFIED` until run in CI or a Node environment.


## 2026-11-26 — Gate 7 Admin Browser Control Plane
- Added `src/shared/admin/adminStore.ts` and rebuilt `src/apps/admin-browser/AdminBrowser.tsx` covering REA sandbox intake, agent/workflow/task monitoring, marketing calendar scheduling, map research notes, asset brief export, and approval-gated external actions via `taskRuntime`.
- Added Gate 7 test coverage in `tests/admin/adminBrowser.test.ts` and updated `docs/AI_HANDOFF.md`.
- Verification limitation: Node.js/npm and headless browser remain unavailable in this container (`node -v` -> not found), so `tsc`, `vite build`, `vitest`, and live preview QA remain `NOT VERIFIED` until run in CI or a Node environment.


## 2026-11-26 — Gate 8 Contextual Browser Layer
- Added `src/shared/context/contextStore.ts` and `src/shared/components/ContextualBar.tsx`, wired into `Layout.tsx` to surface route-aware contextual suggestions and approval-gated handoffs to `taskRuntime`.
- Added Gate 8 unit tests in `tests/context/contextualLayer.test.ts` and updated `docs/AI_HANDOFF.md`.
- Verification limitation: Node.js/npm and headless browser remain unavailable in this container (`node -v` -> not found), so `tsc`, `vite build`, `vitest`, and live preview QA remain `NOT VERIFIED` until run in CI or a Node environment.

## 2026-11-27 — Independent Intake & Verification Session (Incoming AI)
- Completed mandatory project intake: read constitution, AI_CONTEXT, AI_HANDOFF, AI_CHANGELOG, UX_DESIGN_RULES, architecture, skills contract, roadmap, and all source code.
- Inspected actual repository state: 136 files extracted from Gate 8 handoff archive.
- **Critical defects identified:**
  1. `Layout.tsx` line 32 uses `<ContextualBar />` but import is missing — runtime error.
  2. `src/shared/components/index.ts` does not export `ContextualBar`.
  3. No `node`/`npm` in sandbox — all build/type-check/test execution `NOT VERIFIED`.
- **Verified by source inspection (not execution):**
  - Gates 1–4: Mobile shell, real background removal, KeepOriginal, CompareViewer, Export, SkillRuntime (verified-only gating)
  - Gate 5: TaskRuntime with intake/clarify/plan/dispatch/audit, persistent store, approval gates
  - Gate 6: Workspace stores (inventory, CRM, drafts), cross-app handoffs
  - Gate 7: Admin Browser with REA, agents, calendar, maps, asset export
  - Gate 8: ContextualBar with route-aware suggestions, approval-gated handoffs
- Updated `AI_HANDOFF.md` with verified/unverified status, critical defects, and exact next task.
- Next: Fix missing imports, then run `npm install`, `npm run type-check`, `npm run build`, `npx vitest run` in Node environment.

