# MSHKUR — Creative Agent, Skill and Provider Architecture
**Canonical authoring language:** English

## 1. Architecture principles
- Skills are small, typed, versioned capabilities.
- Agents are role-based specialists that compose skills.
- The Creative Director orchestrates; it does not implement every capability itself.
- Provider adapters translate a stable internal job contract into provider-specific requests.
- The UI consumes stable product contracts and never depends directly on vendor model IDs.
- Model catalogs and provider capabilities are discoverable data, not hard-coded assumptions.
- Provider credentials remain server-side and are never shipped in browser bundles or local app storage.
- Source media, prompts, outputs and versions remain attached to project/job records.
- Any external communication, publication, purchase, or irreversible operation requires explicit user approval.

## 2. Initial specialist definitions
| Agent ID | Role | Primary outputs |
|---|---|---|
| creative-director | Understand the brief and coordinate the workflow | Approved creative plan, assigned specialists |
| art-director | Define art direction and composition | Visual direction, reference board, composition brief |
| brand-designer | Create cohesive identity and brand systems | Color/type systems, identity assets, brand guide |
| product-photographer | Create product photo concepts and scenes | Shot list, lighting plan, product imagery |
| image-retoucher | Improve and edit existing imagery | Cleaned image, masks, edit instructions |
| graphic-designer | Produce campaign and social content | Poster, campaign set, social assets |
| ui-systems-designer | Build interface patterns and design systems | Tokens, components, screen specs |
| icon-designer | Create consistent custom icon families | SVG icons, sprite sheets, usage rules |
| motion-designer | Plan motion and short-form visual work | Storyboard, shot plan, motion brief |
| three-d-artist | Compose 3D scenes when supported | Scene spec, camera/light setup, renders |

IDs are stable machine identifiers. Display names, descriptions and instructions are localized through translation keys. Canonical agent instructions remain English.

## 3. Initial skill families

### Image and visual production
- image.generate
- image.edit
- image.remove-background
- image.replace-background
- image.relight
- image.upscale
- image.mask
- image.inpaint
- image.outpaint
- image.product-scene
- image.variation-set
- image.compare-variants

### Design systems and graphic assets
- design.create-art-direction
- design.extract-style
- design.create-moodboard
- design.create-brand-system
- design.create-layout
- design.create-social-campaign
- design.create-presentation
- design.create-ui-screen
- design.create-design-tokens
- design.create-icon-family
- design.export-svg
- design.check-visual-consistency

### Motion and 3D
- motion.create-storyboard
- motion.generate-clip
- motion.create-visual-transition
- three-d.create-scene
- three-d.render-still
- three-d.export-asset

Only register a skill as enabled when its implementation and provider capability are verified. Planned capabilities must be marked as planned/unavailable, not presented as executable.

## 4. Skill manifest contract
Use a schema equivalent to this TypeScript shape:

    type SkillManifest = {
      id: string;
      version: string;
      nameKey: string;
      descriptionKey: string;
      category: "image" | "graphic-design" | "ui-design" | "icons" | "motion" | "three-d";
      inputSchema: Record<string, unknown>;
      outputSchema: Record<string, unknown>;
      acceptedMedia: Array<"image" | "video" | "audio" | "text" | "svg" | "3d">;
      requiredCapabilities: string[];
      providers: string[];
      permission: "local" | "account" | "external-write" | "paid-generation";
      confirmation: "never" | "when-costly" | "always";
      costEstimate?: {
        currency: string;
        amount?: number;
        basis?: string;
        confidence: "exact" | "estimated" | "unknown";
      };
      timeoutSeconds: number;
      retryPolicy: {
        maxAttempts: number;
        retryableErrors: string[];
      };
      testCases: string[];
    };

Do not assume a cost when it is unknown. Do not infer capabilities from a model's marketing name; require a verified capability record.

## 5. Provider adapter contract
Each adapter should expose:
- Provider ID and display metadata.
- Authentication requirements and secure credential validation.
- Dynamic model/capability discovery when supported.
- Normalized submission, status, result retrieval and cancellation where supported.
- Input validation against model-specific schemas.
- Normalized provider errors and retry classification.
- Pricing/cost metadata only when source data is available.
- Terms, data retention and regional constraints when documented.
- Health and integration status.

Provider states: not connected, connected, degraded, disabled, requires reauthorization. Do not present a provider as connected merely because a key string exists; validate it safely.

## 6. Higgsfield adapter
Higgsfield is a candidate provider for image and video generation. Its published API describes a unified REST interface across multiple image and video model families. The API catalog may differ from models and credits shown in the consumer website, and API billing is separate from a consumer subscription.

Implementation requirements:
- Treat the API catalog as the source of truth for API-available models.
- Load model endpoints, supported inputs, constraints and pricing from the current provider catalog/documentation.
- Keep provider/model identifiers in adapter configuration, not UI components or agent prompts.
- Store API credentials only in a server-side secret store.
- Use the provider's documented authorization format; never expose ID/secret values to the browser.
- Require an explicit user or organization connection step.
- Show estimated charges before paid requests when cost information is available.
- Persist request IDs and states so the user can resume after app refresh.
- Handle queued, processing, succeeded, failed and unknown statuses without losing source inputs.
- Never silently switch to a different model/provider when an endpoint is unavailable.

**Verify before production:** current account API access, credential flow, selected model schemas, image-reference constraints, supported output formats, rate limits and billing behavior. Do not assume a website subscription includes API credits.

## 7. Blender / 3D integration (provisional interpretation)
If the requested word “بلاند” refers to **Blender**, treat it as an optional 3D/rendering worker, not a mobile UI dependency.

- Run Blender automation in an isolated server-side worker or controlled render environment.
- Use its Python API (bpy) for scene creation, object/material setup, camera/light configuration, compositing and rendering.
- Expose only approved, typed scene operations as skills.
- Accept and return explicit asset formats and metadata.
- Enforce CPU/GPU, memory, execution-time and file-size limits.
- Isolate generated scripts and input files; never run arbitrary user-supplied Python with unrestricted host access.
- Make rendered results available to the same project asset/version system as image and video outputs.

The exact name and intended scope of “بلاند” must be confirmed in the integration registry before coding a connector. This is a provisional interpretation, not a confirmed integration.

## 8. Design libraries and asset governance

### UI icon baseline
- Use Lucide as the default application UI icon family: consistent SVG components, customizable sizing/stroke/color and tree-shaking.
- Keep one default icon style across the product.
- Consider Tabler or Phosphor only for a deliberate gap, not as a competing second style.
- Do not use an interface icon set as a source for third-party logos. Use official brand assets and applicable usage rules.

### Component and interaction primitives
- Choose one accessible primitive layer for dialogs, menus, sheets, selects, tabs and keyboard behavior.
- Establish MSHKUR-owned components and tokens above those primitives.
- Document source, version and license for each adopted package.
- Test touch behavior, keyboard access, reduced motion and focus visibility.

### Design asset generation
The Icon Designer should create coherent custom icon families using a defined grid, stroke/filled rules, optical sizing and export validation. Check consistency at small sizes. Do not imitate protected logos or proprietary icon families.

## 9. Workflow orchestration
A task request should resolve into a typed plan:
- Intent and deliverable.
- Source assets and references.
- Required capabilities.
- Candidate specialists and skills.
- Candidate providers/models.
- Cost and permission summary.
- Expected output artifacts.

The router should choose the smallest capable workflow. If a capability is unavailable, state what is missing and offer a manual route only when it is genuinely supported.

Agents may propose edits and prepare results. They must not overwrite originals, publish externally, send messages, purchase, or incur paid generation costs without the required approval.

## 10. Observability and quality controls
Track:
- Skill execution ID and version.
- Agent and workflow identifiers.
- Provider/model used.
- Start/end time, status and normalized error.
- Estimated and actual cost when available.
- Input/output asset references and provenance.
- Approval events and approving actor.

Never log raw secrets. Redact sensitive prompt/media metadata according to retention policy. Include fixture-based contract tests and mocked provider-adapter tests; run live tests only with a separately configured test account and budget.

## 11. Implementation sequence
1. Define typed contracts and tests before writing many agent prompts.
2. Ship local/manual image import and editing flows.
3. Implement one end-to-end image workflow with one verified provider.
4. Add the Creative Director and a small number of specialists.
5. Add skill discovery and versioned registries.
6. Add icon/design-system workflows.
7. Integrate video and 3D providers as separate adapters.
8. Expand the provider catalog only after schemas, costs, permissions and error handling are verified.
