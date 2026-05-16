import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Agar `process.env.NODE_ENV` tersedia di beberapa library pihak ketiga
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV ?? mode),
    },
    build: {
      sourcemap: mode !== 'production',
    },
  }
})
