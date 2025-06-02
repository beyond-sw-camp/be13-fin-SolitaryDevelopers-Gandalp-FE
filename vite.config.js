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

const bundlingConf = {
  minify: true,
  lib: {
    entry: resolve(__dirname, 'src/vue-cal/index.js'),
    name: 'vuecal',
    fileName: format => `vue-cal.${format}.js`
  },
  rollupOptions: {
    external: id => id === 'vue',
    output: {
      banner,
      globals: { vue: 'Vue' },
      chunkFileNames: chunkInfo => {
        if (chunkInfo.facadeModuleId?.endsWith('.json')) return 'i18n/[name].js'
        return '[name]-[hash].js'
      }
    }
  },
  copyPublicDir: false
}

export default defineConfig({
  base: '/vue-cal/',
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
  build: process.env.BUNDLE
    ? bundlingConf
    : {
        outDir: 'dist',
        emptyOutDir: true,
        assetsDir: 'assets', // 👉 이거 있어야 assets 폴더 분리됨
      },
  server: {
    proxy: {
      '/api': {
        target: 'https://api-gandalp.service.com',
        changeOrigin: true
      }
    }
  }
})
