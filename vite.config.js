import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // absolute base — required for BrowserRouter: nested routes like /product/cargox
  // are served from the same index.html, so relative asset paths would break there.
  base: '/',
  plugins: [react()],
  // during `npm run dev`, proxy API calls to the local Node server (npm run server)
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
