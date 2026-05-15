import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    css: false,
    server: {
      deps: {
        inline: [/(@csstools|@asamuzakjp)/],
      },
    },
  },
  server: {
    port: 3000,
    // Proxy all /api/* calls to the YARP gateway — no CORS issues in dev
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
