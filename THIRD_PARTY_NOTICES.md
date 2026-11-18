# Third-party notices and attribution

This list reflects the intended runtime packages on `build/phase-02-engine-core`. Re-check exact package contents, licenses, model checkpoints and source obligations before each release.

## Runtime packages
- React / React DOM — MIT.
- Vite / @vitejs/plugin-react — MIT.
- Express — MIT.
- Helmet — MIT.
- better-sqlite3 — MIT.
- sharp — Apache-2.0.
- zod — MIT.
- express-rate-limit — MIT.
- lucide-react — ISC.
- dotenv — BSD-2-Clause.
- @fontsource/ibm-plex-sans-arabic — SIL Open Font License 1.1.
- vite-plugin-pwa — MIT.
- @bg0/browser 0.1.2 — Apache-2.0.
- @huggingface/transformers 4.3.0 — Apache-2.0. A small browser inference-chain recovery patch is applied by `scripts/apply-bg0-patch.mjs`; the upstream patch source is https://github.com/opencoredev/bg0/blob/main/patches/%40huggingface%252Ftransformers%404.3.0.patch.

## BG0 model weights and bundled third-party components

BG0 downloads pinned BiRefNet ONNX weights on first use. These weights are not part of the Git repository and have separate model licenses:
- Full BiRefNet 512 WebGPU export: https://huggingface.co/naddy24/birefnet-512-webgpu — MIT; pinned revision `ca02a86c094927479e2be583abe87f8ea73fcfda`.
- BiRefNet Lite 512: https://huggingface.co/studioludens/birefnet-lite-512 — MIT; pinned revision `4a3c40c36c94093cc1e724d9ea428b8fa4b57dc7`.

BG0 also documents an HEIC/HEIF decoder fallback based on `heic-to 1.5.2`, libheif 1.22.2 and libde265 1.0.16, licensed LGPL-3.0-or-later. MSHKUR's current file picker intentionally accepts only PNG/JPEG/WebP, but the package's bundled fallback and notices remain relevant to the distributed dependency. Preserve the upstream notices and corresponding source archives:
- https://github.com/opencoredev/bg0/blob/main/THIRD_PARTY_NOTICES.md
- https://github.com/opencoredev/bg0/tree/main/third_party/heic-to/source
- https://github.com/opencoredev/bg0/blob/main/third_party/heic-to/source/heic-to-1.5.2.tgz
- https://github.com/opencoredev/bg0/blob/main/third_party/heic-to/source/libheif-1.22.2.tar.gz
- https://github.com/opencoredev/bg0/blob/main/third_party/heic-to/source/libde265-1.0.16.tar.gz

The lite model is approximately 98.5 MB on first download; the full model is approximately 473.4 MB. The browser library prefers WebGPU where supported and falls back to WebAssembly. Images used for background removal stay in browser memory; the model weights are downloaded from the pinned Hugging Face model revisions and cached locally by the browser.

## Development/research tools (not bundled into runtime)

- REA (`morluto/rea`) — Reverse Engineer Anything, MIT. Development-time MCP analysis tool only; it is not part of MSHKUR's production runtime.
- ONNX Runtime quantization tooling — optional Python model-lab tool, not a runtime service.
- llama.cpp / llama-quantize — optional local GGUF inference/quantization tool, not a paid API.
- AssetRipper — GPL-3.0; not bundled or linked as runtime dependency.
- FFmpeg WASM — not currently included.
- @modelcontextprotocol/server 2.4.0 — Apache-2.0; local stdio server only, dev dependency and not required by production web runtime.
- miniPaint — MIT; research/UX reference only, not bundled.

## General rule

A repository license does not automatically license model weights, datasets, screenshots, brands, fonts, or media. Maintain notices for every redistributable artifact. If a dependency's license or distribution consequences are unclear, defer it and seek legal review.
