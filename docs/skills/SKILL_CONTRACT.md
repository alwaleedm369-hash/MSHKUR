# Skill contract

Each skill is an independently testable capability. Proposed minimum manifest fields:

```json
{
  "id": "removebackground",
  "version": "0.1.0",
  "name": "Remove Background",
  "description": "Separates the vehicle from the source background",
  "inputs": [{"name":"image","type":"image","required":true}],
  "outputs": [{"name":"transparent_png","type":"image/png"}],
  "engine": {"provider":"local","entry":"engine/execute"},
  "permissions": ["read:input","write:derived-output"],
  "tests": ["tests/contract","tests/quality"],
  "license": "REVIEW_REQUIRED",
  "status": "experimental"
}
```

- Keep the original input immutable; output into a derived workspace.
- Inputs/outputs must be validated. Define failure, timeout, cancel, retry and resource limits.
- Skill dependencies and model weights must be inventoried, versioned, and licence-reviewed.
- Imported skill code runs in quarantine with least privilege and no network by default.
- Skills are not auto-enabled after import.
- A skill's benchmark suite stores source images, output versions, quality scores, processing time, memory, model/version and reviewer notes.
- `removebackground/` and `keeporiginal/` are separate responsibilities: background removal creates a derivative; keeporiginal preserves source and manages safe versioning.
