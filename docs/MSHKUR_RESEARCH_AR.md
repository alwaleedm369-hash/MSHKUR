# Research registry — MSHKUR

## Preliminary references
- REA https://github.com/morluto/rea : MCP research tool for reverse engineering behavior, JS/Electron/web/native; analyze authorized targets, then independently implement. MIT per upstream, third-party tool licensing separate. Not runtime.
- BG0 https://github.com/opencoredev/bg0 and docs https://bg0.dev/docs : browser local background removal using WebGPU/WASM and BiRefNet, no source image upload/API; Apache-2.0 source, model notices/licenses separate. Candidate and existing direction.
- Agent Skills https://github.com/anthropics/skills : format/instruction conventions and validators; review and isolate imported instructions.
- OpenWorkflow: workflow architecture reference only; compare to existing Maestro before replacement.
- Craft Anything: candidate for additional review, no integration commitment until official repository, version, license and build verified.
- MCP ecosystem: connector protocol; protocol is not security boundary.

## Selection gates
Official upstream; pinned commit/version; code/model/assets/data licenses; security/maintenance/dependencies; clear use-case and I/O; isolated review; implementation and tests; SBOM/NOTICE; mobile/privacy/performance/cost checks; owner approval.

## REA research process
Target and permission → evidence trace/screenshots → state/input/output/errors/permissions spec → independent implementation → tests → license/security review. Do not copy protected code/assets, bypass access controls or unauthorized targets.

## Web research notes (23 Nov 2026)
REA source search showed local analysis and MCP workflows, including web/JS/Electron/native targets with evidence; BG0 describes local browser-only background removal and Apache-2.0 code with separate model notices. Research is preliminary, not comprehensive benchmarking or runtime testing.
