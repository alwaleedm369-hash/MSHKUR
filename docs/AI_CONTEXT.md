# MSHKUR — AI Project Context

## Source of truth and continuity
This repository—not prior chat history—is the source of truth for MSHKUR. Incoming AI models must follow `docs/AI_HANDOFF.md`, `docs/AI_CHANGELOG.md`, and `docs/AI_PROJECT_CHAT_INSTRUCTIONS.md` in addition to the core constitution, architecture, skills contract, roadmap, baseline report and UX rules.

## Product vision and current release scope
The long-term vision includes focused automotive workflows and a shared smart execution layer. The currently published and reviewed deliverable is the Vehicle Photo Studio prototype; do not describe the wider suite as fully connected or production-ready unless the exact route, service and integration are verified in the current source.

The immediate product gate is first-prototype quality: remove the visible logo/name from the top header as explicitly requested by the owner, redesign mobile layout first, improve desktop space balance, shorten interface copy, and add real licensed before/after imagery plus a short explanatory GIF/video. See `docs/PRODUCT_REVIEW_AND_DOCUMENTATION_UPDATE_AR.md`.

## Core experience
Tool → Input → Execute → Result. The current public preview is Photo Studio / Remove Background. The image and its real result should dominate the experience; the mobile workflow must be designed deliberately, not scaled down from desktop.

## Engineering principles
- Inspect existing code and preserve functional work; do not blindly rebuild.
- Skills are executable units with manifest, input/output contract, code/runtime, tests, version, licensing, dependencies, error handling and quality criteria—not prompts or decorative buttons.
- KeepOriginal: never overwrite the source; derived output is traceable.
- Honest status: distinguish implemented, demo, partially verified and unverified. Never fabricate execution, output, evidence or passing tests.
- External or consequential actions require permissions and approval as appropriate.
- Incremental gates: recover baseline, shell, prove real background removal, then expand.
- Avoid default dependence on paid APIs; verify model licenses and measure quality, speed, memory and cost.
- The 100,000 monthly-user goal is a planning target, not a proven capacity claim. Capacity and cost must be measured.

## Product areas
1. Photo Studio: vehicle image workflow; Remove Background first, then tools such as plate blur, glass treatment, shadow and background, as gated.
2. Ad Studio: car ad, short/long marketing copy, newsletters and channel-specific outputs.
3. Dealer Workspace: dealer, inventory, vehicle records and operations.
4. Personal Assistant/iAI: standalone chat, voice, tasks, contacts and context-aware skills; also embedded/contextual within other apps.
5. Admin Browser/Workbench: administrator/operator workspace for skills, assistants, workflows, research, maps, operations and agent tasks.

## Shared Smart Layer
Task Engine, Skill Registry, Skill Runtime, Assistant Manager, Workflow Engine, Permissions, Approval Gate, Evidence, Audit and Recovery.

## Hosting and cost direction
MSHKUR.com is registered with Hostinger. Hosting/VPS choices are provisional: validate current specifications, renewal costs, CPU/RAM/storage/bandwidth/region, scalability, and actual processing benchmarks before commitment. Separate frontend, backend, processing runtime, storage, database and queue as justified. Do not assume a low-cost VPS can serve large scale.

## Current verified release facts (2026-11-27)
- GitHub Pages deployment succeeded at `https://alwaleedm369-hash.github.io/MSHKUR/` on commit `9b9023537b9c60073fd0a79b366a2e4cc30f6bf3`.
- The recorded CI run passed 87 tests and TypeScript/Vite production build.
- Visual QA on physical iOS/Android devices is not recorded as complete.
- Background removal uses third-party `@bg0/browser`; do not claim an internally trained model.
- No Higgsfield, Blender, WhatsApp API, or internal LLM integration is claimed for this preview.

## Continuity rules
Every AI session must intake, inspect, independently verify prior claims, continue the current gate, test, and update the handoff/changelog. See `docs/AI_PROJECT_CHAT_INSTRUCTIONS.md` for detailed requirements and the specific project-chat companion called **Virtual Agent (الوكيل الافتراضي)**.


## Smart Graph / Graphy direction
The shared relationship layer is named **MSHKUR Smart Graph** (internal codename: Graphy). It connects scoped memory, knowledge sources, skills, assistants, workflows, tasks, permissions and evaluation evidence. It does not replace SkillRuntime, TaskRuntime, durable storage, audit or approval gates. See `docs/architecture/MSHKUR_SMART_GRAPH_AND_TRAINING_AR.md`. Treat legacy skill definitions and mock handlers as catalogue/reference only unless separately verified by the newer SkillRuntime.
