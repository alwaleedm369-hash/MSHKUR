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
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
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
