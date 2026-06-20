import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Basepad. Lokaal en op Netlify '/'. Op GitHub Pages zet de deploy-workflow
  // VITE_BASE op '/<repo-naam>/' (zie .github/workflows/deploy.yml).
  base: process.env.VITE_BASE || '/',
  server: {
    // Respecteer een door de omgeving toegewezen poort (preview/hosting).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
