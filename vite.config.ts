import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { URL, fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  // Плагин для Vue 3 уже есть. Никаких vite-plugin-vue2 не нужно.
  plugins: [
    vue(),
    svgLoader()
  ],

  resolve: {
    alias: {
      // Используем современный и надежный способ определения пути
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})