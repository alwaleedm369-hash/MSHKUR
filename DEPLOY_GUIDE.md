# MSHKUR — Deployment Guide for GitHub Pages

This guide provides exact commands to deploy MSHKUR to GitHub Pages at:
**https://alwaleedm369-hash.github.io/MSHKUR/**

---

## Prerequisites

1. **Node.js 20+** installed
2. **Git** installed
3. **GitHub account** with access to the repository
4. Repository: `https://github.com/alwaleedm369-hash/MSHKUR.git`

---

## Step 1: Prepare Local Folder

```bash
# Navigate to your desktop folder
cd C:\Users\wamoh\OneDrive\Desktop\mshkur\car_ai

# Copy the prepared deployment files
# (The mshkur-deploy folder contains all fixes and GitHub Actions workflow)
```

**OR** if you already have the project there, apply these fixes manually:

### Manual Fixes Needed (if not using prepared folder):

1. **vite.config.ts** — Add `base` config for GitHub Pages:
```typescript
const base = process.env.GITHUB_PAGES ? '/MSHKUR/' : '/';
export default defineConfig({
  base,  // Add this line
  // ... rest of config
});
```

2. **public/manifest.json** — Update paths to `/MSHKUR/...`

3. **Create `.github/workflows/deploy.yml`** — GitHub Actions workflow (see below)

---

## Step 2: Initialize Git & Push

```bash
# In your project folder (C:\Users\wamoh\OneDrive\Desktop\mshkur\car_ai)

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "MSHKUR Gate 8: Complete frontend with GitHub Pages deployment config"

# Add remote (if not already added)
git remote add origin https://github.com/alwaleedm369-hash/MSHKUR.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: **https://github.com/alwaleedm369-hash/MSHKUR**
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment** → **Source**: Select **GitHub Actions**
4. The workflow will auto-run on push to main

---

## Step 4: Verify Deployment

1. Go to **Actions** tab in GitHub repo
2. Watch the "Deploy to GitHub Pages" workflow
3. Once complete (green checkmark), visit:
   **https://alwaleedm369-hash.github.io/MSHKUR/**

---

## Step 5: Local Development Commands

```bash
# Install dependencies (run once)
npm install

# Development server (local preview at http://localhost:3000)
npm run dev

# Type checking
npm run type-check

# Build for production (outputs to ./dist)
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test:run

# Full verification (type-check + build + tests)
npm run verify:all

# Format code
npm run format
```

---

## What's Included in This Deployment

✅ **Gate 1**: Mobile-first shell (E/ع locale, Light/Dark, RTL/LTR)
✅ **Gate 2**: Real background removal (@imgly/background-removal)
✅ **Gate 3**: CompareViewer (slider, zoom, metadata) + Export (PNG/JPG/WebP)
✅ **Gate 4**: SkillRuntime with verified-only gating
✅ **Gate 5**: TaskRuntime (intake→clarify→plan→dispatch→audit + approval gates)
✅ **Gate 6**: Ad Studio & Dealer Workspace with persistent stores
✅ **Gate 7**: Admin Browser (REA, agents, calendar, maps, assets)
✅ **Gate 8**: ContextualBar (route-aware suggestions, approval handoffs)
✅ **PWA**: Service worker, manifest, installable
✅ **GitHub Actions**: Auto-deploy on push to main

---

## Project Structure

```
mshkur-deploy/
├── .github/workflows/deploy.yml    # GitHub Actions deployment
├── public/
│   ├── favicon.svg                 # App icon
│   ├── manifest.json               # PWA manifest (updated for /MSHKUR/)
│   └── sw.js                       # Service worker
├── src/
│   ├── apps/                       # Photo Studio, Ad Studio, Dealer, AI, Admin
│   ├── shared/                     # Components, hooks, skills, runtime, engines
│   └── main.tsx                    # Entry point
├── index.html                      # HTML template
├── vite.config.ts                  # Vite config with GitHub Pages base
├── package.json                    # Dependencies & scripts
├── tailwind.config.ts              # Tailwind design system
├── tsconfig.json                   # TypeScript config
└── .gitignore                      # Git ignore rules
```

---

## Troubleshooting

### Build fails with "out of memory"
```bash
# Increase Node memory
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

### GitHub Pages shows 404 / blank page
- Check Actions tab for build errors
- Ensure `base: '/MSHKUR/'` in vite.config.ts
- Verify manifest.json paths start with `/MSHKUR/`

### Background removal doesn't work
- Requires HTTPS (GitHub Pages provides this)
- Model weights download on first use (~10MB)
- Check browser console for WebGPU/WASM errors

### Arabic/RTL not working
- Click "E" button in header → select "العربية"
- Page direction switches automatically
- localStorage persists preference

---

## Next Steps After Deployment

1. **Test on mobile & desktop** — verify all 4 apps + AI assistant
2. **Verify PWA install** — "Add to Home Screen" prompt should appear
3. **Test background removal** — upload a vehicle photo
4. **Check CompareViewer** — select processed image → Compare button
5. **Test AI Assistant** — click ⭐⭐⭐ bottom center → type task
6. **Verify Ad Studio & Dealer Portal** — create draft, add inventory

---

## Support

- Repository: https://github.com/alwaleedm369-hash/MSHKUR
- Live Preview: https://alwaleedm369-hash.github.io/MSHKUR/
- Issues: Use GitHub Issues tab for bugs

---

**Last Updated**: 2026-11-27  
**Gate**: 8 (Contextual Browser Layer)  
**Status**: Ready for deployment