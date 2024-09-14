import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // Allows external access
    port: 5173, // Default port
  },
  plugins: [react()],
})
