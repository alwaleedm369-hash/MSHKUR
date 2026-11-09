# Third-party notices and attribution

This file tracks packages and models used or considered by the project. Verify exact package version, model checkpoint, license text and notices before every release.

## Runtime dependencies
- React / React DOM — MIT.
- Vite / @vitejs/plugin-react — MIT.
- Express — MIT.
- Lucide React — ISC.
- qrcode — MIT.
- dotenv — BSD-2-Clause.
- @bg0/browser 0.1.1 — Apache-2.0 package. BG0's model files have separate notices/licenses; preserve the exact model notice shipped at runtime.

## Research-only tools (not bundled into MSHKUR)
- REA (`morluto/rea`) — MIT according to the official repository README. Local development-time MCP investigation tool; not shipped in the app server.
- AssetRipper (`AssetRipper/AssetRipper`) — GNU GPL-3.0. Not bundled or linked as runtime dependency; only a separately installed tool for authorized Unity asset analysis. Extracted third-party content retains independent rights/licenses.
- ffmpeg.wasm — wrapper MIT; WebAssembly core follows FFmpeg and its linked libraries' applicable licenses. Not yet included in runtime dependencies in this package.
- MCP TypeScript SDK v2 — official SDK, not yet a runtime dependency in this package.
- miniPaint — MIT; research/UX reference only, not bundled.

## General rule
A repository license does not automatically license model weights, datasets, screenshots, brands, fonts, or media. Maintain notices for every redistributable artifact. If a dependency's license or distribution consequences are unclear, defer it and seek legal review.
