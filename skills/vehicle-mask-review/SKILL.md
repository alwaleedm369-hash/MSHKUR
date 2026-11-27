---
name: vehicle-mask-review
description: Inspect segmentation alpha geometry and output consistency before vehicle image export.
license: Proprietary
compatibility: MSHKUR AIBG v0.2
metadata:
  category: quality
  version: "0.2.0"
---

# Vehicle Mask Review

Run deterministic checks for empty masks, source-edge contact, very low/high foreground occupancy and unusual mask proportions. Return machine-readable issue codes and severity. These checks do not prove semantic vehicle correctness. Ask for human approval on warnings; block empty masks. Preserve the original and never silently repair uncertain regions.
