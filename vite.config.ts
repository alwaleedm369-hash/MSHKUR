import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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