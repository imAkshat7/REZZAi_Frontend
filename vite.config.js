import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = process.env.VITE_API_URL || 'https://rezzai-backend.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/me': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/agent': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

