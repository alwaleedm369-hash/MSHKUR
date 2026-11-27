# MSHKUR — Vehicle Photo Studio

**Mobile-first vehicle imagery workspace.** English-first, light-first, with Arabic RTL support.

MSHKUR opens directly into a focused photo studio. Import vehicle photos from the gallery or capture them with the device camera, remove the background locally, compare the real before/after result, choose a white or transparent output, and download the derivative without overwriting the original.

## Product experience

- **Studio:** multi-photo import, camera capture, local previews, background removal and export.
- **Before / After:** touch and pointer drag comparison, plus an accessible range control.
- **Guided tour:** short onboarding that advances automatically and also supports manual navigation.
- **My Work:** local projects and processed derivatives restored from IndexedDB when browser storage is available.
- **Arabic:** right-to-left layout and Arabic interface copy.
- **PWA:** installable web app configuration.

## Image processing

Background removal runs in the browser using the optional `@bg0/browser` runtime. The first use may download model assets. White-background output is composited locally; transparent output preserves alpha. The imported original is kept separately.

The browser/device determines available WebGPU/WASM support and memory. Very large photos may fail on lower-memory devices. The UI reports processing errors rather than showing a fake result.

## Development

Requirements: Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
```

The `Vehicle Studio Production Gate` GitHub Actions workflow runs install, tests, typecheck and production build on the rebuild branch and pull requests targeting `main`.

## Release status

This branch is a production candidate, not a verified production release. A green CI run, real iOS Safari and Android Chrome QA, PWA install/offline verification, model/runtime and model-weight license review, and privacy/accessibility checks are required before launch.

Not connected: Google sign-in, cloud sync, Higgsfield, Blender automation, external image providers, and executable specialist agents. These are not presented as working features.

## Local data and privacy

Imported originals and processed derivatives are stored in the browser's IndexedDB where supported. Data may be removed if the user clears site data, uses private browsing, or the browser evicts storage. No cloud backup is configured.

## Product principles

- Preserve the original asset.
- Never fabricate a processed image or processing status.
- Do not claim a provider, assistant, skill or account integration is connected unless it is implemented and verified.
- Keep the first-use path visual, direct and mobile-first.


## AIBG Photo Studio guide

See the [Arabic MSHKUR/AIBG Photo Studio guide](docs/engine/MSHKUR_AIBG_PHOTO_STUDIO_GUIDE_AR.md) for the workflow, mask commands, local storage behavior, limitations, and troubleshooting. For the technical ownership and engine contract, see [MSHKUR/AIBG engine contract](docs/engine/MSHKUR_AIBG_ENGINE_CONTRACT_AR.md).
