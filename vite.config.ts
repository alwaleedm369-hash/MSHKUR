import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'مشكور — مساحة عمل المعرض',
        short_name: 'مشكور',
        description: 'إدارة السيارات وتجهيز الصور والإعلانات من مساحة عمل واحدة.',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#183e3a',
        background_color: '#f6f8f6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,mjs,wasm,css,html,svg,woff2,png}'],
        runtimeCaching: [
          { urlPattern: ({url}) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: { '/api': { target: 'http://127.0.0.1:4174', changeOrigin: true } },
  },
});
