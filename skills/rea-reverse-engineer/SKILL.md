---
name: rea-reverse-engineer
description: Use the REA (Reverse Engineer Anything) MCP tool to analyze an authorized application or open-source project, gather evidence about its behavior, and create an independent implementation plan.
license: MIT
compatibility: Development-time agent skill; requires REA MCP server.
metadata:
  category: engineering
  version: "1.0.0"
---

# REA Reverse Engineer Anything

1. Confirm the target is open source or explicitly authorized for inspection.
2. Define one feature or workflow to investigate; avoid broad unbounded extraction.
3. Use REA MCP tools to identify entry points, inputs, outputs, dependencies, state transitions, error paths, and evidence.
4. Record uncertainty and what REA could not verify.
5. Review source and asset licenses independently.
6. Write a behavior specification and acceptance tests.
7. Implement the behavior independently in MSHKUR.
8. Never bypass authentication, DRM, CAPTCHA, access controls, or terms of service.
9. Never copy proprietary code, private assets, branding, or user data.
10. Do not install the REA MCP server in the production runtime.
