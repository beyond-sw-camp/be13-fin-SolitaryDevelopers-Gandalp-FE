import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import autoprefixer from 'autoprefixer'
import pkg from './package.json'

const banner = `/**
  * ${pkg.name} v${pkg.version}
  * (c) 2024-${new Date().getFullYear()} ${pkg.author}
  * @license MIT
  */\n`

export default defineConfig({
  base: '/', // ✅ CloudFront 루트 배포 시 필수!
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
      input: resolve(__dirname, 'index.html'), // ✅ SPA 진입점 명시
      output: {
        banner // (선택) 빌드된 JS 상단 배너 삽입
      }
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
