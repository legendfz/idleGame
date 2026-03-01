import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: uses custom domain or root, so base = '/'
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
