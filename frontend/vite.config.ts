import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@contracts': fileURLToPath(new URL('../packages/contracts/src', import.meta.url)),
    },
  },
  server: {
    // VITE_HOST=0.0.0.0 is set by docker-compose so the container port is
    // reachable from the host. Falls back to localhost for local dev.
    host: process.env.VITE_HOST ?? 'localhost',
    port: Number(process.env.PORT) || 5174,
    proxy: {
      '/api': {
        // VITE_API_PROXY_TARGET is set to http://backend:4000 inside Docker so
        // the Vite dev server forwards /api/* to the backend container.
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
