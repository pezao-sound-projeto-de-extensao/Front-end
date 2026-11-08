import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// A API é chamada direto pela URL absoluta de VITE_API_BASE_URL (ver README), sem proxy.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
