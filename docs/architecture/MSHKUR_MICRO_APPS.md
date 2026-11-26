# MSHKUR micro-app architecture

## Shared foundation
- **MSHKUR Smart Layer**: contextual task capture, permissions, dispatcher, skills, assistants, workflow, evidence, approvals, audit.
- **Browser companion/extension (planned)**: user-approved context overlay, page selection and supported actions on Google, WhatsApp Web, and other websites. Must respect host terms, user privacy, browser permission scope and automation limits. No blanket scraping or hidden actions.
- **Core runtime**: task contracts, skill registry, assistant hand-off, local processing, storage, queue, checkpoints, validation and recovery.
- **Design system**: mobile shell, locale/direction, theme, controls, comparison viewer, upload and result surfaces.

## Product applications
1. **Photo Studio** — vehicle image preparation: remove/restore background, plate blur, glass treatment, shadow/lighting, cropping, batch processing and comparison. Each tool is a skill; feature ordering is driven by verified output quality.
2. **Ad Studio** — listing data and photos to editable ad copy, image package and structured listing/export. Publishing is a separate approval-gated connector.
3. **Dealer Workspace** — dealer profile, inventory, listing drafts, organization and workflow history. Avoid assuming persistence until backend tests prove it.
4. **Personal Assistant (iAI)** — text/voice task entry, conversation, delegation and personal task orchestration across apps. It is the general assistant, not a separate tool silo.
5. **Admin Browser / Workbench** — admin-only contextual browser and workbench for managing agents, skills, tasks, research/import review, workflow and marketing campaigns. This is a fifth surface, not another end-user app. Browser capabilities are permission-bound and isolated.

## Work areas inside the Admin Browser
- Agent/assistant directory and state.
- Skills discovery, review, install, disable, update and rollback lifecycle.
- REA (Research, Evaluate, Approve) intake: source, commit/version, licence, dependencies, sandbox test, evidence, approval.
- Workflow/Task inspection: steps, status, logs, checkpoints, cancellation, retry, recovery.
- Marketing plan: calendar, scripts, clips, asset drafts and platform-specific publishing queues. Publishing requires confirmation.
- Maps research: user-selected geography or location search, with explicit sources and export; no unattended contact/spam.
- Dealer outreach kit: logo/photos, feature explainer and branded assets generated from verified inputs; subscription/signup actions remain user-approved.

## Suggested separation (not a forced migration)
`apps/photo-studio`, `apps/ad-studio`, `apps/dealer-workspace`, `apps/personal-assistant`, `apps/admin-browser`; `packages/core-runtime`, `packages/skills`, `packages/assistants`, `packages/design-system`, `packages/localization`, `packages/integrations`; `server/`, `tests/`, `docs/`.
Keep the current source tree until a safe incremental migration is demonstrated.
