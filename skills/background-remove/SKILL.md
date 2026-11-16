---
name: background-remove
description: Remove the background from a user-selected vehicle photo locally in the browser, preserving the original and returning a transparent PNG.
license: Apache-2.0
compatibility: MSHKUR Browser Skills Runtime v1
metadata:
  category: image
  version: "1.0.0"
  model: BiRefNet
  runtime: WebGPU/WASM
---

# Background Removal

1. Accept PNG, JPEG, or WebP vehicle image selected by the user.
2. Load the pinned BG0 BiRefNet model locally in the browser; default to the lite tier to reduce first download size.
3. Show model download and inference progress, with a clear first-use download notice.
4. Keep original image and pixels in browser memory; never send the image to the server for inference.
5. Return a transparent PNG derivative; preserve original dimensions and allow preview/download.
6. If inference fails, show an actionable error and allow retry. Never silently fall back to a paid service.
7. Require user review before the output is used in an ad.
