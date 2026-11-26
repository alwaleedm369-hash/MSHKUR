$ErrorActionPreference = "Stop"
Set-Location "C:\Users\alhac\OneDrive\Desktop\MSHKUR-gate8-2026-11-26"

if (-not (Test-Path "node_modules\.bin\vite.cmd")) {
  Write-Host "[1/3] Installing dependencies..."
  npm install --legacy-peer-deps
}

Write-Host "[2/3] Running tsc, vite build, and vitest..."
npx --no-install tsc --noEmit
npx --no-install vite build
npx --no-install vitest run

Write-Host "[3/3] Starting dev server..."
npm run dev
