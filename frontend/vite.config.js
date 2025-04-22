import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    cssCodeSplit: false,     // CSS 파일 분리 안 함 → 메모리 줄임
    sourcemap: false,        // 소스맵 생성 안 함 → 디스크, 메모리 줄임
    minify: false,           // 코드 압축 안 함 → CPU, 메모리 절약
    target: 'es2015'         // 더 낮은 트랜스파일 대상 → 속도 개선
  }
})
