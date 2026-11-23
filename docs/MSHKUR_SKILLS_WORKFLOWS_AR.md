# Skill and workflow model

## Skill contract
name/id/version; description; input/output schemas; permissions/scopes; risk tier; allowlisted handler; upstream/version/license; tests; timeouts/budget/retry/idempotency.

## Catalog
Public: background removal, image export/share, assistant conversation.
Car: crop/resize/compress, manual plate blur, glass tint, scene composition, fact validation, ad/post draft, business-card/QR.
General: research with citations, file create/read/convert, calendar/tasks and Drive/Docs/Sheets/Slides/Contacts (Google opt-in), browser inspect/read, browser action gated.
Admin: repo inspect/edit/test, host diagnosis, preview/release, backup/restore check.

## Car ad kit workflow
Validate facts → choose album assets → image processing steps → generate content/template variants → preview/edit → approve → export or compliant connector → store receipts/version.

## Assistant task
Intent → clarify only essential detail → scoped research/context → plan → execute skills → preview evidence/output → approval → external action → receipt/audit.

## Google workflow
Connector consent/scopes → encrypted tokens → connector skill → results → revoke/consent controls. Do not expose broad scopes to all agents.

## Browser agent
Task-specific session/domain allowlist → evidence capture → prepare action → approve send/publish/delete/submit → execution receipt. No bypass of CAPTCHA/2FA/anti-bot; never export session cookies.
