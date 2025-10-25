import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy para desarrollo local - redirige las peticiones al backend Django
      '/api': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/pacientes': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/citas': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/seguridad': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/admin': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/media': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
      '/csrf': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true, 
        secure: false 
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimizaciones para producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
})
