# MSHKUR — AI Project Context

## Source of truth and continuity
This repository—not prior chat history—is the source of truth for MSHKUR. Incoming AI models must follow `docs/AI_HANDOFF.md`, `docs/AI_CHANGELOG.md`, and `docs/AI_PROJECT_CHAT_INSTRUCTIONS.md` in addition to the core constitution, architecture, skills contract, roadmap, baseline report and UX rules.

## Product vision
MSHKUR is a suite of focused task-oriented applications with a shared smart execution layer. Product surfaces: Photo Studio, Ad Studio, Dealer Workspace/Portal, Personal Assistant (iAI), and Admin Browser/Workbench. The Smart Layer is shared infrastructure, not an additional consumer app.

## Core experience
Tool → Input → Execute → Result. The UI should help users complete tasks and obtain real outputs, not expose a sprawling dashboard. MSHKUR.com is initially intended to lead into Photo Studio/Remove Background.

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

## Continuity rules
Every AI session must intake, inspect, independently verify prior claims, continue the current gate, test, and update the handoff/changelog. See `docs/AI_PROJECT_CHAT_INSTRUCTIONS.md` for detailed requirements and the specific project-chat companion called **Virtual Agent (الوكيل الافتراضي)**.


## Smart Graph / Graphy direction
The shared relationship layer is named **MSHKUR Smart Graph** (internal codename: Graphy). It connects scoped memory, knowledge sources, skills, assistants, workflows, tasks, permissions and evaluation evidence. It does not replace SkillRuntime, TaskRuntime, durable storage, audit or approval gates. See `docs/architecture/MSHKUR_SMART_GRAPH_AND_TRAINING_AR.md`. Treat legacy skill definitions and mock handlers as catalogue/reference only unless separately verified by the newer SkillRuntime.
