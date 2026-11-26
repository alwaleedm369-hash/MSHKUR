# Tool specs
## MSH-SEG
Input: image, options, optional prompt/mask. Output: alpha mask, preview, warnings, model provenance.
Failures: timeout, model unavailable, memory, poor mask. Retry alternate approved model or manual edit.
## MSH-MATTE
Edge refinement, brush/erase, polygon, feather, grow/shrink, holes and halo checks. Output refined alpha plus recipe.
## MSH-PLATE
Candidates with confidence, manual box/polygon fallback, blur/pixelate/opaque cover. Validate privacy coverage after export; uncertain => review-required.
## MSH-LIGHT/COLOR
Exposure, contrast, highlights, shadows, white balance, temperature/tint, saturation, sharpening/denoise optional. Non-destructive; clipping warnings.
## MSH-GLASS
Manual mask first, tint color/strength, feather, highlight preservation. Auto segment only after benchmark.
## MSH-SCENE/SHADOW
Licensed background assets, position/scale, perspective, contact shadow. Generative replacement is explicit and labeled.
## MSH-QUALITY
Mask completeness, edge/halo, plate coverage, clipping, export integrity, review-required state.
## MSH-OUTPUT
PNG/JPEG/WebP, dimensions, alpha, metadata stripping default, batch naming and provenance.
