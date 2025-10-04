import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for IPFS deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure compatibility with older browsers
    target: 'es2015'
  }
})