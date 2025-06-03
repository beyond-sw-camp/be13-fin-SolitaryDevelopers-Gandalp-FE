import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import autoprefixer from 'autoprefixer'
import pkg from './package.json'

export default defineConfig({
  base: '/', // ✅ CloudFront에서 root로 배포 시 필수
  define: {
    'process.env': {
      VITE_APP_VERSION: process.env.npm_package_version,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    global: 'globalThis'
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: '@use "@/scss/variables" as *;'
      }
    },
    postcss: {
      plugins: [autoprefixer]
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
