import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // MapLibre's worker is an ES module importing a shared chunk; keep workers as ES modules.
  worker: { format: 'es' },
  server: {
    // Listen on all interfaces so the dev server is reachable from outside the Docker container.
    host: true,
    port: 5173,
    watch: { usePolling: process.env.VITE_USE_POLLING === 'true' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    },
  },
})
