# MSHKUR — Smart Automotive Platform

[![Deploy to GitHub Pages](https://github.com/alwaleedm369-hash/MSHKUR/actions/workflows/deploy.yml/badge.svg)](https://github.com/alwaleedm369-hash/MSHKUR/actions/workflows/deploy.yml)

**Live Demo**: https://alwaleedm369-hash.github.io/MSHKUR/

---

## Overview

MSHKUR is a mobile-first, bilingual (English/Arabic), PWA-ready automotive platform with four focused micro-apps and a shared intelligent execution layer.

### 🎯 Product Areas

| App | Description | Key Features |
|-----|-------------|--------------|
| **Photo Studio** | Vehicle image processing | Real background removal (@imgly), KeepOriginal, CompareViewer, multi-format export |
| **Ad Studio** | Vehicle listing creation | 5-step bilingual ad builder, auto-copy generation, drafts, approval-gated publishing |
| **Dealer Portal** | Inventory & CRM | Live KPIs, vehicle CRUD, buyer leads, showroom profile, one-shot ad prefill |
| **AI Assistant** | Personal task runtime | Structured intake, clarification, planning, permission preflight, human approval gates |

### 🧠 Smart Layer (Shared)
- **Skill Runtime**: Manifest-driven, verified-only execution with contracts
- **Task Runtime**: Audit-logged, recoverable, approval-gated dispatch
- **Contextual Layer**: Route-aware suggestions with approval handoffs

---

## Quick Start

```bash
# Install
npm install

# Develop
npm run dev

# Build & verify
npm run verify:all

# Preview production build
npm run preview
```

---

## Gates Implemented

- ✅ **Gate 1**: Mobile Shell (E/ع, Light/Dark, RTL/LTR, 4-app nav + AI trigger)
- ✅ **Gate 2**: Real Background Removal (client-side neural, KeepOriginal)
- ✅ **Gate 3**: Compare & Export (slider, zoom, metadata, PNG/JPG/WebP)
- ✅ **Gate 4**: Skill Runtime (manifest, permissions, I/O validation, evidence)
- ✅ **Gate 5**: Task Runtime (intake→clarify→plan→dispatch→audit, approval gates)
- ✅ **Gate 6**: Ad Studio & Dealer Workspace (persistent stores, cross-app handoffs)
- ✅ **Gate 7**: Admin Browser (REA, agents, calendar, maps, asset export)
- ✅ **Gate 8**: Contextual Browser Layer (route-aware suggestions, approval handoffs)

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State**: Zustand, React Router v6
- **UI**: Radix UI, Lucide icons, Framer Motion
- **PWA**: Service Worker, Web App Manifest, Workbox
- **Processing**: @imgly/background-removal (ONNX/WASM)
- **Testing**: Vitest, React Testing Library
- **Deploy**: GitHub Actions → GitHub Pages

---

## Deployment

Automatic via GitHub Actions on push to `main`:

1. Push to main branch
2. GitHub Actions runs: `type-check` → `build` → `deploy`
3. Live at: **https://alwaleedm369-hash.github.io/MSHKUR/**

See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) for detailed steps.

---

## Project Structure

```
src/
├── apps/
│   ├── photo-studio/       # Image processing workspace
│   ├── ad-studio/          # Ad creation & publishing
│   ├── dealer-portal/      # Inventory & CRM
│   ├── ai-assistant/       # Personal task runtime
│   └── admin-browser/      # Admin workbench
├── shared/
│   ├── components/         # Layout, Header, ContextualBar, UI primitives
│   ├── hooks/              # useLocaleTheme, usePWA
│   ├── runtime/            # SkillRuntime, TaskRuntime
│   ├── skills/             # Skill registry & contracts
│   ├── engines/            # Background removal, image processing
│   ├── assistants/         # Assistant manager
│   ├── integrations/       # Google, WhatsApp, Haraj
│   ├── context/            # ContextualLayer (Gate 8)
│   ├── stores/             # Workspace, Admin stores
│   ├── admin/              # Admin store
│   ├── styles/             # Global CSS, design tokens
│   └── types/              # Shared TypeScript types
├── main.tsx                # Entry point
└── App.tsx                 # Routes + Layout
```

---

## License

Proprietary — MSHKUR Platform

---

## Contributing

Internal project — follow AI Continuity Protocol:
- Read `docs/AI_CONTEXT.md`, `docs/AI_HANDOFF.md`, `docs/AI_CHANGELOG.md`
- Verify before implementing
- Update handoff/changelog on every session

---

**Last Gate**: 8 (Contextual Browser Layer)  
**Status**: Ready for production deployment