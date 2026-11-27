# MSHKUR Vehicle Photo Studio — Implementation Notes

**Branch:** `rebuild/product-foundation`  
**Product language:** English first, Arabic supported  
**Primary form factor:** Mobile web / PWA  
**Visual mode:** Light first

## Product entry

The application opens directly into the vehicle photo studio. It does not begin with a chatbot, marketing page, or productivity dashboard.

The primary screen uses a three-word headline: **Perfect Car Photos**. Arabic equivalent: **صور سيارات احترافية**.

The first meaningful action is to import an image or capture one with the device camera.

## Implemented in this increment

- Responsive mobile-first photo studio shell.
- English default locale and Arabic RTL locale switch.
- Gallery import with multi-select.
- Camera capture input using the environment-facing camera hint on supported devices.
- Image MIME validation and a 20 MB per-image limit.
- Local object-URL previews and thumbnail selection.
- Multiple image selection in one session.
- White / transparent output preference controls.
- Specialist, library, and settings views reachable from a compact menu.
- Honest unavailable state for background removal because no verified processing endpoint is connected in this branch.
- Original image remains the only available image; the interface does not fabricate a processed result.
- PWA document metadata updated for the Vehicle Photo Studio.

## Explicitly not implemented or not verified

- Vehicle background-removal inference and mask refinement.
- White-background compositing output.
- Google OAuth sign-in.
- Persistent local project storage across browser restarts.
- Cloud storage, account sync, or cross-device library.
- Higgsfield, Blender, or other external provider execution.
- Paid generation, model selection, and cost estimates.
- Save/share of a processed derivative (there is no processed derivative yet).
- Production device QA, accessibility audit, and browser test matrix.

The provider and specialist views are informational previews only. They are labelled as in preparation and must not be treated as executable agents or connected skills.

## Interaction and data handling

- Gallery selection accepts JPEG, PNG and WEBP.
- Camera selection accepts browser-supported image formats.
- Imported files are represented as browser object URLs for this session.
- No upload request is made by this UI increment.
- Changing the output background is a desired output setting only; it does not alter the source image.
- The Remove Background action reports that the service is unavailable. It does not simulate progress or success.
- The original file is never overwritten.

## Next engineering gate

1. Implement a typed vehicle-processing service adapter against a verified server contract.
2. Connect a real segmentation/matting worker and white-background compositor.
3. Add immutable original / derived asset records and processing status.
4. Add before/after comparison only after a real output exists.
5. Add explicit download/share actions for the derived output.
6. Add Google sign-in and scoped permissions only when the OAuth flow is configured.
7. Add persistent local-first library storage and test recovery after refresh.
8. Run typecheck, build, automated tests, and real mobile browser QA.

## Acceptance rule

Never mark background removal as complete until the backend returns a real output asset and a verified success status. Never show an after-image, export action, or connected-provider badge without the corresponding implementation and evidence.
