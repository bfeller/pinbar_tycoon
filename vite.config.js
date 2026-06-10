import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `npm run dev`, forward /api to a locally-running scores backend
// (cd server && npm install && DB_PATH=./highscores.sqlite npm start).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
