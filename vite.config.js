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
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
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
  server: {
    proxy: {
      '/api': {
        target: 'https://api-gandalp.service.com',
        changeOrigin: true,
      }
    }
  }
})
