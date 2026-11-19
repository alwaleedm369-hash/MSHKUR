# MSHKUR Engine Architecture
- UI: React/TS Tool-first workspace, source/derived layers, controls, mask editor, compare, export.
- Contract: tool id/version, input, output, progress/state, warnings, typed errors, provenance, privacy.
- Orchestrator: DAG, dependencies, retries, cancel, events.
- Inference adapters: ONNX/PyTorch/browser; each model isolated behind adapter.
- Classic CV: OpenCV/Sharp for compositing, blur, color, geometry.
- Asset store: original immutable; derivatives and recipes versioned.
- QA gate: mask boundaries, plate coverage, file integrity, warnings.
- Skills and agents use registered contracts, not arbitrary access.
Browser mode has resource limits; self-hosted inference avoids vendor API pricing but compute is not free.
