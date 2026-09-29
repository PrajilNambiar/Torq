import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API's CORS policy only allows http://localhost:3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
})
