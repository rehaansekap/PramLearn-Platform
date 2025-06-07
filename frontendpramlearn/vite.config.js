import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import 'antd/dist/antd.css';`
      }
    }
  }
})