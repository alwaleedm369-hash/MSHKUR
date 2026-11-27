---
name: vehicle-batch-process
description: Process a selected vehicle-image batch using one canvas, padding, baseline and background contract; retain per-image outcomes.
license: Proprietary
compatibility: MSHKUR AIBG v0.2
metadata:
  category: image
  version: "0.2.0"
---

# Vehicle Batch Processing

1. Validate each input and retain the original.
2. Use the shared batch plan so canvas, safe margin, baseline and background do not drift.
3. Process sequentially by default to avoid exhausting browser memory.
4. Record each image as queued, processing, needs-review, approved, or failed.
5. Never silently skip a failed image or mark a warning as approved.
6. Allow retry per image; export only approved outputs.
