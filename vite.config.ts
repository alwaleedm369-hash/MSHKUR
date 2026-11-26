import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
<<<<<<< HEAD
import path from 'path';

// GitHub Pages deployment: base path is '/MSHKUR/' for repository name
const base = process.env.GITHUB_PAGES ? '/MSHKUR/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@imgly/background-removal', 'onnxruntime-web', 'onnxruntime-web/webgpu'],
  },
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@apps': path.resolve(__dirname, './src/apps'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@types': path.resolve(__dirname, './src/shared/types'),
      '@styles': path.resolve(__dirname, './src/shared/styles'),
      '@skills': path.resolve(__dirname, './src/shared/skills'),
      '@engines': path.resolve(__dirname, './src/shared/engines'),
      '@assistants': path.resolve(__dirname, './src/shared/assistants'),
      '@integrations': path.resolve(__dirname, './src/shared/integrations'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-select', '@radix-ui/react-slider', '@radix-ui/react-switch', '@radix-ui/react-separator', '@radix-ui/react-scroll-area', '@radix-ui/react-collapsible', '@radix-ui/react-hover-card', '@radix-ui/react-popover'],
          animation: ['framer-motion'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['zustand', 'lucide-react', 'clsx', 'tailwind-merge', 'date-fns', 'date-fns-tz', 'idb', 'dexie'],
          media: ['react-dropzone', 'react-image-crop', 'embla-carousel-react'],
        },
      },
    },
  },
});
=======
import { VitePWA } from 'vite-plugin-pwa';

// Project Pages URLs include the repository name, unlike the local app URL.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/MSHKUR/' : '/';

export default defineConfig({
  base,
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
        start_url: base,
        icons: [
          { src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,mjs,wasm,css,html,svg,woff2,png}'],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith(`${base}api/`), handler: 'NetworkOnly' }
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
>>>>>>> 5cac2c6638c612a91f5d8042e523b39575bf6267
