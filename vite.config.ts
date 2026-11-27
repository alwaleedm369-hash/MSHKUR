import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.GITHUB_ACTIONS === 'true' ? '/MSHKUR/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mshkur-icon.svg'],
      manifest: {
        name: 'MSHKUR — Vehicle Photo Studio',
        short_name: 'MSHKUR',
        description: 'Mobile-first vehicle photo studio for clean listing imagery.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#f6f6f2',
        background_color: '#f6f6f2',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: 'mshkur-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        navigateFallback: base + 'index.html',
        globPatterns: ['**/*.{js,mjs,css,html,svg,woff2,png,webp}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith(base + 'api/'),
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: { '/api': { target: 'http://127.0.0.1:4174', changeOrigin: true } }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
