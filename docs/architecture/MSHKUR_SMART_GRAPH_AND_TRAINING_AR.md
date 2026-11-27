# MSHKUR Smart Graph (Graphy) — Architecture, Skills & Training Plan

> Status: architecture decision and implementation contract. This document does not claim that a graph database, model training pipeline, or WhatsApp connection is deployed.

## 1. Decision

Adopt **MSHKUR Smart Graph** as the shared knowledge-and-capability layer. **Graphy** is its internal codename, not a separate assistant or a second memory system.

The Smart Graph connects:
- user-approved memory and project/workspace context;
- skills and their versions, contracts, dependencies, permissions, licences and verification evidence;
- assistants, their roles, permitted skills and handoff rules;
- workflows, task plans, checkpoints and outcomes;
- data sources, provenance, freshness and access scope;
- evaluations, feedback and approved training examples.

It is the relationship and retrieval layer behind MSHKUR iAI and the Smart Layer. It does not replace the task runtime, skill runtime, durable storage, audit log or model provider.

## 2. Why this is better than a standalone "Graphy" plugin

The repository already contains overlapping foundations: a legacy skill registry with mock handlers, a newer verified-only SkillRuntime, assistant definitions/manager, workflow pipelines, task runtime and local context storage. Creating another independent plugin would multiply registries and create conflicting truth.

Therefore:
- keep one canonical skill identity and manifest contract;
- keep execution in SkillRuntime / TaskRuntime;
- keep assistant orchestration in Assistant Manager;
- keep workflow execution in Workflow/Task Runtime;
- add Smart Graph as a shared index and relationship service;
- make every graph edge point to a versioned canonical record, never duplicate its executable logic.

## 3. Canonical graph model

Node types:
- `User`, `Workspace`, `Memory`, `ConversationSummary`, `SourceDocument`
- `Skill`, `SkillVersion`, `ModelArtifact`, `Dataset`, `Evaluation`
- `Assistant`, `Workflow`, `Task`, `Tool`, `Integration`
- `Permission`, `Approval`, `Evidence`, `Execution`

Typed relationships:
- `OWNS`, `SCOPED_TO`, `DERIVED_FROM`, `REFERENCES`
- `USES_SKILL`, `CAN_HANDOFF_TO`, `COMPOSES`, `DEPENDS_ON`
- `REQUIRES_PERMISSION`, `REQUIRES_APPROVAL`, `EXECUTED_AS`
- `VERIFIED_BY`, `EVALUATED_ON`, `SUPERSEDES`

Every memory/source node must carry: owner, workspace scope, source reference, created/updated timestamps, sensitivity classification, consent basis, retention policy and deletion lineage. Private user memory must never become global training data by default.

## 4. Retrieval and execution flow

1. iAI receives a request and resolves the active user/workspace scope.
2. Smart Graph retrieves relevant memories, source documents, skills, assistants and workflow patterns.
3. Planner proposes a typed task plan with explicit inputs, outputs and dependencies.
4. Permission preflight checks each skill/integration; unverified, quarantined or disabled capabilities are excluded.
5. Task Runtime dispatches only to SkillRuntime-approved executors.
6. Results are validated; external or destructive actions pause for human approval.
7. Evidence, provenance, decisions and checkpoints are persisted.
8. Approved outcomes may update workspace memory and evaluation records; they do not silently rewrite model weights.

Graph retrieval is advisory. Runtime contracts and permissions remain authoritative. A graph edge must never grant permission.

## 5. Skills: consolidate, do not blindly activate

The legacy catalogue lists 14 skills. Treat them as capability proposals, not proof of working implementations.

| Capability family | Skills to group | Initial disposition |
|---|---|---|
| Vehicle image preparation | background removal, plate privacy, glass treatment, lighting, shadow, centering/crop, enhancement, batch unify | Keep as one Photo skill family; enable each operation only after independent contract tests and visual benchmarks |
| Vehicle intelligence | vehicle data extraction | Experimental; require source attribution and confidence |
| Ad production | ad content generation, template rendering | Draft-only until output and export tests pass |
| Dealer operations | inventory management, customer management | Workspace-scoped; require persistence, authorization and audit tests |
| Marketing | marketing automation | Plan/draft only; schedule/publish/send require connector availability and approval |

Do not expose legacy mock handlers as executable capabilities. In particular, handlers that return the original image as a processed result must be quarantined/removed from the executable path. Keep the newer verified-only runtime as the execution gate.

## 6. Assistants and delegation

Keep one user-facing orchestrator: **MSHKUR iAI**. Specialist assistants are role profiles, not independent agents with unrestricted authority.

Suggested specialist roles:
- Photo & Vision
- Ads & Content
- Dealer Operations
- Research & Market Analysis
- Coding & Quality
- Workflow & Operations

Each assistant definition must declare: purpose, allowed skill IDs/versions, allowed data scopes, input/output contract, escalation conditions, handoff targets, and prohibited actions. Remove duplicate assistant catalogues only after a migration map and compatibility tests exist.

The assistant may delegate analysis and preparation. It may not bypass the same permission, evidence, approval and verification gates used by direct user actions.

## 7. Training strategy — staged, measurable, affordable

Do not begin by fine-tuning a foundation model. First build a reliable knowledge and evaluation loop.

### Stage A — Curated knowledge (first)
- Normalize project docs, skill manuals, workflows and approved operational knowledge.
- Chunk and index with source/version/owner metadata.
- Retrieve relevant passages through Smart Graph; cite source IDs internally.
- Keep user-private memory isolated from shared product knowledge.

### Stage B — Skill demonstrations and evaluations
- For each skill, create representative input/output examples, edge cases, failure cases and expected quality criteria.
- Build a versioned evaluation set with consent and licence provenance.
- Measure task success, output quality, latency, memory use, cost and regression rate.
- Record human corrections as candidate examples, not automatic ground truth.

### Stage C — Workflow and assistant optimization
- Mine approved execution traces for reusable plans and routing rules.
- Convert stable repeated work into deterministic workflows or tested skills.
- Use retrieval, tool calling and prompt/configuration improvements before model fine-tuning.
- Keep evaluation sets separate from training examples to avoid leakage.

### Stage D — Optional model adaptation
Only consider LoRA/fine-tuning when a stable, licensed dataset demonstrates a measurable gap that retrieval, deterministic skills and prompt changes cannot solve. Require dataset cards, consent/licence review, held-out evaluations, rollback and model/version registry.

### Vehicle vision model track
Keep image segmentation separate from language-model training. Benchmark open/licensed pretrained segmentation models on a consented vehicle dataset first. Record masks, edge quality, vehicle coverage, glass/mirror/tire handling, speed, RAM/VRAM, model licence and device constraints. Fine-tune only if the benchmark proves a gap and the dataset rights are clear. Never describe a third-party model or heuristic as a proprietary MSHKUR-trained model.

## 8. Storage and deployment path

Start with a provider-neutral graph interface and a relational/JSON-backed implementation using the database already selected by the backend. Add a dedicated graph database only when measured query complexity, scale or traversal latency justifies it.

Suggested service boundaries:
- `SmartGraphRepository`: typed nodes/edges, scope filters and provenance;
- `MemoryService`: user/workspace memory lifecycle and consent;
- `KnowledgeIndexer`: document ingestion, chunking and versioning;
- `CapabilityCatalog`: skill/assistant/workflow relationships;
- `EvaluationRegistry`: datasets, test runs, metrics and approvals.

Do not add a second database, vector store or hosted AI bill until benchmarks justify it. A vector index may accelerate semantic retrieval, but it is not the source of truth.

## 9. WhatsApp — dormant connector, no paid Meta API

WhatsApp is a future optional channel, not a dependency of iAI or Smart Graph.
- Default state: disabled, no socket, no QR request, no reconnect loop.
- Keep credentials/session material out of frontend bundles and source control.
- Future activation must be explicit, show the connection method and status, and require user approval for outbound messages.
- No Meta Cloud API key, subscription or paid API is required for the current dormant design.
- A future local companion/bridge may be evaluated, but unofficial WhatsApp Web automation can break, may conflict with WhatsApp terms and must undergo security/privacy/legal review. Do not promise uninterrupted or supported connectivity.
- Inbound messages must enter as untrusted external input; they cannot authorize payments, data export, deletion or bulk messaging.
- Keep a provider interface so a future compliant provider can be added without changing iAI, skills or workflows.

## 10. Acceptance gates

1. **Catalogue audit:** every skill/assistant/workflow has a unique ID, owner, version, status and source.
2. **Execution safety:** only verified skills run; graph relationships never grant permissions.
3. **Memory isolation:** user/workspace scopes and deletion lineage are tested.
4. **Retrieval quality:** source-grounded retrieval has a labelled evaluation set and regression report.
5. **Delegation:** iAI can plan and hand off with traceable task IDs and bounded capabilities.
6. **Training governance:** no example enters a training set without provenance, rights and approval.
7. **WhatsApp dormant state:** application startup makes no network attempt; explicit opt-in is required to connect.
8. **Release evidence:** clean install, typecheck, tests, build, security review and device QA all pass before production claims.

## 11. Current known limitations

- The legacy skills catalogue contains mock/no-op handlers and must not be treated as production capability.
- The newer SkillRuntime currently gates execution to the verified skill only.
- Repository handoff documents report full project build/test/device QA as not verified.
- This document is a design contract; a production graph store, full memory service and training pipeline are not claimed as implemented.
