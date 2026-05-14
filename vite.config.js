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
        manualChunks(id) {
          if (id.includes('@solana/web3.js') || id.includes('@solana/spl-token')) {
            return 'solana';
          }
          if (id.includes('vue') || id.includes('vue-router')) {
            return 'vue-vendor';
          }
        }
      }
    }
  }
})
