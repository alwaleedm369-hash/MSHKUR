# MSHKUR Vehicle Photo Studio — Product Implementation

**Branch:** `rebuild/product-foundation`  
**Primary platform:** Mobile web / installable PWA  
**Default locale:** English (LTR), with Arabic RTL  
**Visual mode:** Light first

## First-use experience

The app opens directly into the vehicle photo workspace. It does not begin with a chatbot or a generic dashboard. The first screen offers gallery import and camera capture, with a short guided tour that advances automatically and can also be navigated manually.

## Delivered in this increment

- Responsive studio layout with dedicated mobile, tablet and wide-screen behavior.
- English-first copy and Arabic RTL support.
- Gallery import (multiple images) and camera capture.
- Local image previews and image switching.
- IndexedDB-backed persistence for imported originals and processed derivatives, restored after refresh when the browser supports local storage.
- Local vehicle background removal through the repository's optional `@bg0/browser` runtime.
- White-background compositing or transparent PNG output.
- Original image is preserved; processed output is a separate object URL and downloaded as a derivative.
- Actual before/after comparison using the original and the processed output, with pointer/touch drag and keyboard-accessible range control.
- Guided tour auto-advances, with manual previous/next/replay/close controls.
- Processing states distinguish model loading, segmentation, compositing, success and failure. No fake percentage is shown.
- PWA metadata is aligned to the vehicle photo studio.

## Runtime behavior and limitations

- The local AI model may need to download model assets on first use; the tab must remain open during processing.
- GPU/WASM capability and memory vary by browser/device. A low-memory mobile browser may fail on large images.
- The current import limit is 20 MB per file. This is a guardrail, not a guarantee that every 20 MB image fits device memory.
- Projects are stored locally in IndexedDB and restored after refresh where supported. Browser storage quotas, private browsing restrictions and user-cleared site data can still remove local projects; cloud backup is not connected.
- Google sign-in, cloud sync, external image generation, Higgsfield, Blender automation and executable specialist agents are not connected.
- The background-removal pipeline uses a local open-source runtime. Runtime code, model weights, and model distribution terms must be reviewed independently before commercial release.

## Production gates still required

1. Pin and verify model/runtime versions and licenses, including weight distribution and attribution requirements.
2. Add device-aware image downscaling / tiling and memory handling for large images.
3. Add persistent local asset storage, project history and derivative lineage.
4. Add a cancel/retry flow and robust error classification for model download, WebGPU/WASM and canvas failures.
5. Add mobile browser QA on current iOS Safari and Android Chrome, including low-memory devices.
6. Run typecheck, tests, production build, PWA install/offline checks and accessibility review.
7. Verify the deployment environment, headers, model asset delivery and caching behavior.
8. Complete privacy and security review before public launch.

## Acceptance rules

- Never show an after-image until a real processing result exists.
- Never overwrite the imported original.
- Never claim a cloud upload, account sync, provider connection or agent execution unless implemented and tested.
- Never report production readiness based only on a successful GitHub merge or a visually complete screen.

## Automated verification

A Node.js 22 GitHub Actions workflow now runs `npm ci`, `npm test` and `npm run build` for this branch and pull requests targeting main. A green workflow result is still required before merge or release.
