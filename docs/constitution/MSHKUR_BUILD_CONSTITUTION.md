# MSHKUR Build Constitution (v1)

**Working language:** English (code, contracts, manifests, technical docs, first UI). Arabic is a supported locale. **UI direction:** LTR for English, RTL for Arabic. **Theme:** Light by default; explicit Light/Dark switch. **Target:** mobile-first web.

## Product principle
MSHKUR is an intelligent execution layer that sits above supported websites and apps, including Google services and WhatsApp Web, and also operates its own automotive micro-apps. It is not a claim of universal access: integrations require explicit permission, available interfaces, and policy-compliant technical paths. A browser extension/companion is the preferred surface for contextual overlay and page-aware actions; the web app is the primary workspace.

## Experience rules
- No brand masthead on the mobile shell. Top edge: compact three-line menu and compact controls only.
- Bottom navigation: four app destinations with a central three-star AI trigger. The AI trigger opens a compact text-and-voice input sheet, not a separate full page by default.
- English-first initial UI. Tap `E` to open locale selection; locale changes direction as appropriate.
- Light mode first. A sun/moon control toggles theme.
- Do not add explanatory copy, marketing copy, dashboards, placeholder cards, or ornamental motion unless they support the task.
- Mobile-first, touch targets at least 44px, safe areas respected, reduced-motion respected.
- No fake data or fake image outputs in production surfaces. Clearly label fixtures.

## Execution rules
1. Inspect the real repository before changing it. Protect source assets and user archives.
2. One work item at a time; state its acceptance criteria before implementation.
3. Skills are executable, versioned units, not merely prompt files. They declare inputs, outputs, dependencies, permission scope, tests, and provenance.
4. Assistants coordinate; they cannot substitute for a capability that is not implemented.
5. The engine dispatches tasks and validates results. It does not silently fake completion.
6. KeepOriginal: preserve the uploaded original. All processing creates derived outputs.
7. Imported skills, extensions, and code are untrusted until reviewed, sandboxed, tested, and approved. Never execute an import automatically.
8. External actions (send, publish, purchase, delete, edit remote data) require explicit human confirmation.
9. No paid APIs, credentials, or commercial licences as default dependencies. Verify licences individually; open-source does not mean unrestricted.
10. Record test commands and actual results. Do not invent results or claim completion without evidence.

## Definition of Done
A task is complete only when its UI/capability is wired to a real function, contracts and error states exist, original data is preserved, relevant tests pass, output evidence is recorded, responsive/mobile and locale/theme behavior are verified as applicable, and the documentation describes remaining limits. Otherwise mark `PARTIAL`, `BLOCKED`, `NOT CONNECTED`, or `NOT VERIFIED`.


## AI Continuity, Handoff and UI Quality (Mandatory)

Follow `docs/AI_PROJECT_CHAT_INSTRUCTIONS.md`, `docs/AI_CONTEXT.md`, `docs/AI_HANDOFF.md`, `docs/AI_CHANGELOG.md`, and `docs/UX_DESIGN_RULES.md`. Every incoming model must inspect and verify before implementation, and every outgoing session must update handoff and changelog. Interface quality is a mandatory acceptance criterion. The project chat named **Virtual Agent (الوكيل الافتراضي)** must follow this protocol, but repository documents—not chat memory—remain the source of continuity.
