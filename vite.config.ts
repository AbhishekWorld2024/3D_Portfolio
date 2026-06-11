import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy chatbot API calls to the Express server so the
      // ANTHROPIC_API_KEY never reaches the browser.
      '/api': 'http://localhost:3001',
    },
  },
})
