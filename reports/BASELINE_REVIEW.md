# MSHKUR baseline review — 26 Nov 2026

## Verified in the supplied archive
- The archive includes the five surface areas (Photo Studio, Ad Studio, Dealer Portal, Personal Assistant and Admin Browser), shared skill/engine folders, a server subtree, integration stubs, docs, CI and Docker files.
- The source code has no current baseline proof of real AI/image processing; the accompanying review report explicitly describes several local/demo-only behaviors and disconnected integrations.
- Build command: `npm run build` — **FAILED** at baseline. Source JSX issues in `MobileAdStudio.tsx`, `SettingsPanel.tsx`, `ToolPanel.tsx` were found and repaired during this working copy. A malformed/truncated vendor source file in `node_modules/@remix-run/router/router.ts` remains an error and should not be edited as project source.
- Tests: `npm test -- --run` — could not run because `vitest` executable was missing in the supplied installation.
- Lint: `npm run lint` — could not run because `eslint` executable was missing.
- Attempted offline dependency recovery (`npm install --offline --ignore-scripts --no-audit --no-fund`) — blocked because an npm registry package was not cached. This is a dependency/install blocker, not evidence of test failure in source.

## Repairs made in this working copy
- Fixed malformed JSX closing structure in `MobileAdStudio.tsx`.
- Fixed invalid JSX props in `SettingsPanel.tsx`.
- Fixed rendering of a stored category icon in `ToolPanel.tsx`.
- Added the MSHKUR Build Constitution, micro-app architecture, Skill Contract, execution sequence, and baseline report.

## Not verified / still blocked
- Clean dependency install, lockfile consistency, full build, lint and tests.
- Real vehicle background removal and image quality benchmarks.
- Persistent job orchestration, assistant execution, connected integrations and deployment.
- Actual mobile-device behavior and the requested final mobile shell redesign.

## Next acceptance gate
Restore dependencies from a clean environment with network/package registry access or a complete cache, create and commit a reproducible lockfile, and rerun build/test/lint. Then implement the first real remove-background capability with original-image preservation and benchmark evidence.


## Independent review update — 26 Nov 2026

- Confirmed `src/apps/photo-studio/PhotoStudio.tsx` previously simulated processing by reusing the original blob and preview, then marking the image/job completed. This was misleading, not actual processing. The handler now records a failed job and states that the engine is not connected.
- Confirmed the export handler previously displayed an in-progress toast without exporting and closed the export modal. It now reports that export is unavailable and does not claim to create files.
- Registry/engine placeholders remain: `src/shared/skills/index.ts` includes mock/identity handlers and `src/shared/engines/imageProcessing.ts` has placeholder model/WASM/CPU paths. These are not verified capabilities and require follow-up.
- Removed duplicate imports in the main route file and two app files. Global TypeScript transpilation (syntax only) processed 55 TS/TSX files with zero syntax diagnostics. Full type-check still fails due missing dependencies/type declarations and other unused symbols.
- `npm install --no-audit --no-fund` and npm registry lookup timed out in this environment. Build/type-check/test/lint and browser/device verification therefore remain blocked/not run.
