# MSHKUR ENGINE CONTRACT — v1

> Status: contract and hardening baseline. It does not certify visual quality or production readiness.

## 1. Ownership and boundaries
- MSHKUR owns orchestration, UI, operation history, quality gates, and integrations.
- Model weights and inference runtime remain third-party components; their provenance and licenses must be recorded.
- Default image path must not require a paid image API.

## 2. Input
- Accept supported image files only; enforce file-size limits at UI and processing boundaries.
- Preserve the original upload as an immutable source.
- Normalize orientation and dimensions before model execution in a future explicit stage; never silently overwrite the source.
- Validate decoded image dimensions and reject unsupported/empty data.

## 3. Output
- Every operation returns a Blob plus dimensions, operation identifiers, and errors/progress where relevant.
- Keep source and derived output distinct. Reprocessing must start from the source or an explicit operation graph, not from an accidental prior export.
- Output export format and dimensions must be explicit.

## 4. Pipeline stages
1. Intake and validation
2. Orientation/normalization
3. Background segmentation
4. Matte inspection/refinement
5. Optional plate privacy operation
6. Lighting/color operations
7. Scene/background composite
8. QA checks
9. Compare, save/export

Stages may be reordered only with documented dependency and QA coverage.

## 5. Matte quality
- Heuristic smoothing is not a matting model and must be labelled experimental.
- QA fixtures must cover: wheels/tires, mirrors, thin antennas, grille gaps, dark-on-dark, bright-on-bright, glass, reflections, shadows, and image edges.
- Record at least: edge leakage, retained foreground loss, halo observation, and visual reviewer rating.
- Do not claim automatic plate detection until implemented and evaluated.

## 6. Privacy
- Plate blur is an explicit privacy tool, with manual correction available.
- Regions are normalized and clamped; invalid or tiny regions are rejected.
- Future detector suggestions must be reviewable and must not imply that privacy is guaranteed.

## 7. Non-destructive operations
- Store source Blob separately from preview/export Blob.
- Operations are parameterized and tracked; undo/reset must restore source or a defined prior state.
- Avoid repeated brightness, blur, compositing, or resizing on the same derivative unless intentional.

## 8. Runtime and resource lifecycle
- Revoke temporary object URLs on load/error and when previews are replaced/unmounted.
- Handle model-load failure and image decode failure with actionable messages.
- Do not retain large image buffers/canvases unnecessarily; test multi-image batches and cleanup.

## 9. Acceptance gate
- Typecheck/build/test pass.
- Manual QA on a fixed test set with before/after comparison.
- No broken download/preview or stale object URL paths.
- License and model-weight provenance reviewed.
- Document known failures; no quality claims without evidence.

## 10. Current known limitations (baseline)
- BG0/BiRefNet lite is third-party inference, not a MSHKUR-trained model.
- Matte refinement, lighting, and shadow are heuristics.
- Plate region is manual; no automatic plate detector is asserted.
- This branch is a hardening step, not a commercial-quality release.
