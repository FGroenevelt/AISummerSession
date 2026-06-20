import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Respecteer een door de omgeving toegewezen poort (preview/hosting).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
