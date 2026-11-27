# MSHKUR/AIBG — engine contract and ownership plan

**Status:** deterministic product engine implemented; segmentation remains provider-backed; proprietary model weights are not yet owned.

## One engine, separate layers
1. **AIBG deterministic core (owned code):** normalized edit commands, alpha-mask editing, subject geometry, batch contract, output normalization and QA.
2. **Segmentation adapter (replaceable provider):** currently calls the optional BG0 browser package. This is not a MSHKUR-trained segmentation model.
3. **Specialist skills:** segment, refine mask, center/ground, normalize, review and batch.
4. **Workflow orchestration:** import → validate → segment → refine → ground/center → compose → review → human approval → export.
5. **Channels:** browser UI and a future WhatsApp adapter call the same authenticated workflow API; channels must not contain duplicate image logic.

## Why vehicles looked airborne
The earlier composition centered the visible alpha bounds vertically. A car could therefore float in the middle of a 4:3 canvas. The new grounded placement shares a fixed baseline (86% of canvas height) across the batch and draws a soft contact shadow beneath the detected subject. This improves catalog consistency; it cannot infer exact tire contact from alpha bounds alone, so a human review remains required for difficult angles, shadows and cutout defects.

## Crop and output safeguards
- Never overwrite the original.
- Fit the full alpha bounding box inside a safe margin; do not crop to fill.
- Report empty masks, edge contact, very low/high foreground occupancy and unusual mask aspect ratios.
- A QA warning is not a semantic car detector. It flags geometry for inspection; it does not certify that glass, mirrors, tires or antennas are intact.
- Keep the output dimensions, canvas, padding, background and baseline identical for all images in a batch.
- Do not mark a result approved automatically. Approval is a distinct human action.

## Internal command language
Coordinates are normalized from 0 to 1 and refer to the current output/mask plane.

| Command | Meaning |
|---|---|
| `REMOVE/ x,y,w,h` | Clear alpha in a region |
| `KEEP/ x,y,w,h` | Restore alpha in a region |
| `REMOVE/REGION x,y,w,h` | Explicit alias |
| `KEEP/REGION x,y,w,h` | Explicit alias |
| `CENTER/` | Center the subject |
| `FIT/` | Fit within safe margins without distortion |
| `WHITE/` | Composite on white |
| `TRANSPARENT/` | Preserve alpha |
| `REVIEW/` | Run deterministic mask QA |

Commands are intentionally constrained; unknown commands and invalid rectangles fail closed. Region commands edit a mask, not source pixels. UI must preview every edit and retain undo/original.

## Skills and assistants
- Vehicle Retoucher: segmentation adapter, mask refinement, region commands, grounded placement and background composition.
- Quality Inspector: mask geometry, edge contact, occupancy, output dimensions, alpha integrity and review report.
- Batch Operator: sequential processing with a shared output contract and per-image status.
- Workflow Orchestrator: records step outputs and blocks export until review/approval.

Skills are executable only when a concrete runtime entrypoint exists and tests cover its contract. A registry entry alone is not proof of execution.

## MSHKUR/AIBG model ownership
A branded engine is not the same thing as owned model weights. The AIBG deterministic core is MSHKUR-owned application logic. The segmentation network currently comes from a third-party package/model and must retain its upstream attribution and license obligations.

To legitimately claim a proprietary learned model, MSHKUR must:
1. Create a rights-cleared, consented vehicle-image dataset with masks, edge cases and train/validation/test splits.
2. Define annotation rules for glass, mirrors, wheels, antennas, dark paint, reflections, shadows, occlusion and partial crops.
3. Train or fine-tune an architecture whose commercial license is compatible with the product.
4. Track dataset provenance, model architecture, training code, checkpoints, tokenizer/preprocessing (if any), evaluation and release hashes.
5. Compare IoU/Dice, boundary F-score, crop/edge failure rate, vehicle-part retention and latency against a fixed benchmark.
6. Run human review on a stratified test set and publish limitations before claiming ownership or superiority.

No proprietary model weights or training dataset are created by this change. Training requires licensed data, compute and evaluation; do not invent those assets.

## Browser and WhatsApp
The browser can run the current local segmentation adapter and AIBG post-processing. WhatsApp is a separate delivery channel, not an inference runtime: a verified Meta WhatsApp Business Cloud API webhook, credentials, opt-in, media download/upload handling, retention policy and public HTTPS endpoint are required. No live WhatsApp connection or automatic outbound messaging is enabled in this repository change. Once configured, inbound media should enqueue the exact same workflow and return a result link only after approval.

## Verification still required
Run the Node test suite and production build on CI, then test real vehicles on iOS Safari and Android Chrome. Include edge-touching cars, dark cars on dark backgrounds, transparent glass, white cars, front/rear three-quarter views, motorcycles excluded from car-specific heuristics, multiple aspect ratios and batches of at least 20 images. A green unit test suite does not replace visual QA or device testing.
