import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxy = { '/api': 'http://127.0.0.1:8000' }

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { proxy },
  preview: { proxy },
})
