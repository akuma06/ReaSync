import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({
    reactivityTransform: true
  }),
  VitePWA({
    manifest: {
      name: 'ReaSync',
      short_name: 'ReaSync',
      description: 'The best way to sync a reaction video with a source!',
      theme_color: '#1f191a'
    }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
