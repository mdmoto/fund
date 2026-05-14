import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: './',
  plugins: [vue(), nodePolyfills()],
  server: {
    port: 5173,
    proxy: {
      '/buyer': {
        target: 'https://api.maollar.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'solana': ['@solana/web3.js', '@solana/spl-token'],
          'vue-vendor': ['vue', 'vue-router'],
        }
      }
    }
  }
})
