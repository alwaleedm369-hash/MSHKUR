# MSHKUR — AI Continuity, Handoff & UI Quality Protocol

## 1. AI Continuity
MSHKUR is an AI-assisted, continuously developed software project. Any AI model, agent or developer entering the project must understand the product vision, architecture, implementation status, previous decisions, test evidence, current blockers and next task without depending on the previous conversation. Project files are the primary source of continuity.

## 2. Mandatory Project Intake
Before modifying source code:
1. Read the project constitution and execution instructions.
2. Read `docs/AI_CONTEXT.md`.
3. Read `docs/AI_HANDOFF.md`.
4. Review `docs/AI_CHANGELOG.md`.
5. Read relevant architecture, skill, roadmap, baseline and UX documents.
6. Inspect actual source code and repository state.
7. Identify previous changes and uncommitted work.
8. Run the project and relevant tests whenever possible.
9. Verify previously reported functionality rather than trusting previous claims.
10. Identify actual implementation state, current Gate, blockers and next task.
No implementation may begin before intake is completed.

## 3. Verification Before Continuation
Previous reports are not proof. Independently verify and report verified, partially verified, unverified functionality, failed tests, missing dependencies, known defects and current blockers. Do not silently replace or discard existing work.

## 4. AI Handoff Protocol
- `docs/AI_CONTEXT.md`: enduring product vision, architecture, principles, standards and constraints.
- `docs/AI_HANDOFF.md`: current Gate, objective, completed work, files, test commands/results, verified/unverified functionality, defects, blockers, stopping point and exact next task. Update at every session end.
- `docs/AI_CHANGELOG.md`: chronological record of sessions, changes, decisions, fixes, test results and Gate transitions. Never erase history.
- `docs/UX_DESIGN_RULES.md`: design and UX standards, responsive rules, interface patterns and quality requirements.

## 5. Session Completion Requirements
Before ending a session: save changes; review changed files; run relevant tests; record actual results; identify unresolved defects; update context if enduring decisions changed; update handoff; append changelog; provide concise session report; and specify exact next task. Never claim tests passed if not run. Never claim a feature complete when only its UI exists. Never leave the next AI dependent on undocumented chat history.

## 6. UI & UX Quality — Mandatory
Design quality and UX are core engineering requirements. Interfaces should be modern, clean, minimal, responsive, mobile-first, interactive, consistent, task-oriented, refined and functional. Prioritize Tool → Input → Execute → Result. Avoid unnecessary dashboards, excessive cards, redundant descriptions, clutter, decorative controls and generic templates. Review visually and functionally after implementation. Verify responsiveness, interaction states and usability. Every control must work. No fake results or unsupported completion claims.

## 7. Development Discipline
Work incrementally. Inspect before modifying. Preserve working code. Test before expanding. Fix current-stage defects before advancing. Follow established gates. Do not rebuild existing functionality without justification. Document justified architecture/design changes.

## 8. Incoming AI Objective
Understand → Inspect → Verify → Continue → Test → Document → Handoff. The project must remain transferable between models, sessions and developers.

## 9. UI Review Gate
Review engineering correctness and interface/interaction quality. Build success alone is not UI quality; visual attractiveness alone is not functional completeness. Document both.

## 10. Companion project chat: “Virtual Agent (الوكيل الافتراضي)”
If work is conducted in the project chat named **Virtual Agent (الوكيل الافتراضي)**, treat that chat as a development agent—not as a substitute for repository documentation. It must follow this same intake, verification, implementation, test and handoff protocol. Any important decision, task progress, code change, test evidence, unresolved issue or next step must be recorded in repository files so a different model or agent can continue even if that chat is unavailable or its context limit is reached. Do not assume that chat memory is shared or persistent. Follow repository context and handoff first; use chat history only as supplementary information.
