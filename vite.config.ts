import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['util', 'buffer', 'process'],
  },
  build: {
    rollupOptions: {
      external: ['stream', 'timers', 'events', 'buffer', 'util', 'path'],
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
