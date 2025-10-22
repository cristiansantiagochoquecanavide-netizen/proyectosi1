import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/pacientes': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/citas': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/seguridad': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/csrf': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
    }
  }
})
