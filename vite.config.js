import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative base so the build works from any static-host sub-path (e.g. GitHub Pages)
  base: './',
  plugins: [react()],
  // during `npm run dev`, proxy API calls to the local Node server (npm run server)
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
