# MSHKUR — Mobile-First Creative Product Specification
**Primary product language:** English  
**Additional language:** Arabic (complete RTL support)  
**Design priority:** Light mode first  
**Experience priority:** Mobile first, adaptive upward

## 1. Product direction
MSHKUR is a visual creation workspace powered by specialist creative agents and composable skills. It helps a user move from intent or source material to a polished deliverable.

The product must not look or behave like a generic AI chatbot, prompt directory, admin dashboard, or collection of disconnected tools.

**Core interaction model: enter → create → refine → export.**

A conversation is one possible control surface, not the product's home screen. The user's work, source media, live canvas, generated results, and next actions are the primary interface. AI should make the work easier without taking over the screen.

## 2. First-run experience: immediate work
Do not force account creation, onboarding questionnaires, or a blank chat before the user can do something useful.

On first launch, show:
- A clear Create entry point.
- A compact set of high-quality starter recipes: product image, campaign visual, social post, brand moodboard, icon set, or short motion concept.
- A visible import action for Photo Library, Camera, and Files where the platform supports them.
- A small sample project demonstrating the quality and editing loop.
- A way to continue as a guest and preserve work locally, with sign-in requested only when sync or cloud features are needed.

Each starter recipe must open a usable creation flow with sensible defaults, not a dead-end marketing tile.

## 3. Mobile-first information architecture
Use a compact bottom navigation with no more than four primary destinations:
1. **Create** — primary entry and active creative workspace.
2. **Library** — projects, uploads, generated assets, versions and exports.
3. **Agents** — specialist creative agents and skill collections.
4. **Profile** — account, language, connected providers, privacy and billing.

The active project is a persistent workspace state, not another crowded top-level destination. Use contextual navigation within the project.

On larger screens, expand the same information architecture into a richer canvas and inspector layout. Do not design a desktop sidebar and shrink it onto mobile.

## 4. Signature interface: a living creative canvas
The main Create screen should be a visual working surface:
- A prominent canvas or media stage for the current source or result.
- A concise intent composer anchored near the working area, never a giant chat transcript.
- A horizontal strip or bottom drawer of relevant tools and specialist skills.
- Contextual properties for the selected object or image.
- A clear version/history affordance.
- A visible primary action such as Generate, Apply, Refine, or Export.

The interface should adapt to the task. Importing an image changes the workspace into an image-editing surface; selecting a result exposes refinement controls; choosing a brand direction surfaces typography, color, layout, and asset controls.

Avoid a generic grid of equal cards. Use composition, hierarchy, image scale, typography, and intentional whitespace to create a recognizable visual identity. Bento patterns may be used selectively, never as the entire design language.

## 5. Import, capture and image creation

### Import and capture
Support, where available:
- Photo library / gallery picker.
- Camera capture.
- File import.
- Clipboard paste on supported platforms.
- Multi-image selection and reference-image attachment.
- Drag and drop on desktop/tablet.

Show immediate previews and meaningful states for upload, validation, processing, failure, and retry. Preserve the original source and create non-destructive working versions.

### Generate
Offer a short natural-language brief with optional reference images. The user should not need to know model names, parameter jargon, or prompt syntax to start.

Expose advanced controls progressively:
- Output type and aspect ratio.
- Visual direction / style recipe.
- Number of variations.
- Quality or resolution where supported.
- Model/provider selection for advanced users.
- Transparent background or other capabilities only when the chosen model supports them.

Before paid or unusually expensive generation, show a clear cost estimate when available and request confirmation. Do not imply an unsupported parameter is available.

### Image editing and result handling
- Keep source, generated result, and edited version distinguishable.
- Offer before/after comparison and variant comparison.
- Preserve edit history and allow undo/redo where possible.
- Allow the user to select a result as the new working source.
- Export and share with explicit format, dimensions and transparency status.
- Never silently overwrite the user's original file.

## 6. Touch and motion language
Touch must be a first-class interaction model rather than desktop controls compressed onto a phone.

Required interactions:
- Tap to select and open.
- Swipe horizontally through variants and project media.
- Pinch to zoom and pan on image/canvas surfaces.
- Long-press for a small contextual action menu.
- Drag to reorder or place assets where discoverable.
- Bottom sheets for contextual tools and inspectors.
- Clear dismiss gestures and visible close controls.
- Undo/redo close to the canvas.
- Haptic feedback only for meaningful confirmations when supported.

Use generous touch targets (preferably around 44–48 CSS pixels or larger), respect safe areas, avoid gesture conflicts with browser navigation, and provide a visible alternative for every essential gesture. Support keyboard and pointer input on larger devices. Honor reduced-motion preferences.

Motion should communicate cause and effect: entering a tool, applying an edit, switching versions, or completing a generation. Avoid decorative animation that delays work.

## 7. Visual system: light-first and distinctive
Light mode is the reference visual system, not an afterthought.
- Warm, clean surfaces with deliberate contrast.
- One recognizable brand accent and a restrained semantic color system.
- Strong editorial typography and clear type scale.
- Large, beautiful media previews where imagery is the work.
- Fine borders and subtle depth instead of nested card stacks.
- A coherent spacing, radius, elevation, and motion scale.
- High contrast and accessible focus states.

Dark mode may be added later using the same design tokens. It must not dictate the initial layout or palette.

Do not copy familiar AI product conventions: no giant centered chat box as the entire home screen, no endless chat bubbles, no default matrix of feature cards, and no decorative AI gradients as a substitute for a visual identity.

## 8. English-first, Arabic-complete localization
English is the canonical language for:
- Product UI copy and navigation labels.
- Agent and skill names, descriptions, prompts, system instructions and schemas.
- Workflow definitions, tool descriptions, identifiers, logs and technical documentation.
- Creative recipes and model/provider capability metadata.

Arabic must still be a complete user-facing locale:
- All screens, actions, validation, onboarding and system messages translated.
- Correct RTL layout, reading order, alignment, icon mirroring when directionally meaningful, and mixed-direction text handling.
- Arabic-friendly typefaces and line-height.
- Locale-aware dates, numbers and formatting.
- Prompt input and generated content may be Arabic or mixed-language even while skill definitions remain canonical English.

Use typed locale dictionaries and translation keys; do not scatter conditional language strings across components. Never translate stable IDs, API slugs, schema keys or provider identifiers. Store the user's language preference; do not infer it only from location.

## 9. Specialist creative team
Agents are specialist creative workers with explicit roles, not decorative chatbot personas.

The initial team:
- **Creative Director** — interprets the brief, selects a direction and coordinates specialists.
- **Art Director** — defines composition, visual mood, references and art direction.
- **Brand Designer** — creates cohesive color, type, identity and brand assets.
- **Product Photographer** — creates product-shot direction, lighting, backgrounds and layouts.
- **Image Retoucher** — performs cleanup, background work, object-aware refinements and finishing.
- **Graphic Designer** — creates campaign assets, posters, social layouts and editorial graphics.
- **UI Systems Designer** — creates interface patterns, components, tokens and responsive layouts.
- **Icon Designer** — creates custom icon families with consistent grid, stroke, geometry and export formats.
- **Motion Designer** — plans motion systems, storyboards and short-form visual sequences.
- **3D Artist** — prepares 3D objects, scenes, camera and lighting workflows when a 3D provider is connected.

The Creative Director routes each task to the smallest useful team. Do not expose every agent on every screen.

## 10. Skill contract
A skill is an executable, versioned capability that an agent can call. Every skill must have:
- Stable skill ID, semantic version, English name and description.
- Validated input and output JSON schemas.
- Supported task types and media types.
- Required tools and provider capabilities.
- Optional reference assets and style constraints.
- Permission level and confirmation requirements.
- Expected latency, cost metadata when known, and failure/retry policy.
- Provenance for generated or inferred content.
- Unit tests and example fixtures.
- Localization keys for user-facing strings.

An agent composes one or more skills. A skill must not depend on UI state or unstructured chat history alone; its inputs and outputs must be explicit and testable.

## 11. Creative workflow engine
Represent each creation as a workflow with visible stages:
1. Understand the brief.
2. Inspect references and source assets.
3. Propose a direction (only when meaningful).
4. Select specialist and provider capabilities.
5. Generate or process.
6. Present results and explain meaningful choices.
7. Refine from visual feedback.
8. Approve and export.

Allow manual control at every stage. Users can skip suggestions, edit parameters, change a provider, or continue manually. Agents should move the workflow forward rather than repeatedly asking broad questions.

## 12. Quality and acceptance criteria
A release is not accepted until:
- A new user can create or import something without first writing a long prompt.
- A first meaningful output can be reached from the mobile home screen in a few intentional actions.
- Camera, gallery and file import flows behave correctly on supported devices.
- Every visible interactive control has a real action and loading/empty/error/success states.
- Touch, keyboard and pointer interaction are all usable.
- Image selection, zoom, pan, variant comparison and export work reliably.
- English is the default product locale and Arabic works end-to-end in RTL.
- Light mode is complete, consistent and contrast-checked.
- Agent/skill routing is schema-driven and testable.
- Provider failures do not lose the user's brief or source material.
- Paid model actions have cost transparency and appropriate confirmation.
- No unsupported model, provider, parameter or integration is advertised as working.

## 13. Build order
1. Product shell, visual tokens, English locale and Arabic RTL infrastructure.
2. Mobile Create entry, sample project and guest-first workflow.
3. Import/camera/gallery experience and non-destructive asset library.
4. Creative canvas, touch interactions, variants and export.
5. Agent/skill contracts and the Creative Director router.
6. First practical image workflows, followed by graphic/UI/icon workflows.
7. Provider adapters (Higgsfield and others) and optional 3D workflows.
8. Reliability, accessibility, device testing, observability and cost controls.

**Product rule:** the user should always see the work, the next useful action, and how to take control. Intelligence should be felt through relevance and output quality, not through more chat.
