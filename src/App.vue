<template>
    <div>
      <documentation v-if="isCalendarBaseLayout" :class="{ prod: isProduction }" />
      <router-view v-else />
    </div>
  </template>
  
  <script setup>
  import { onMounted, inject, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/store'
  import { useAuthStore } from './stores/auth'
  import Documentation from '@/documentation/index.vue'
  
  const $waveui = inject('$waveui')
  const store = useAppStore()
  const route = useRoute()
  const auth = useAuthStore()
  const isProduction = import.meta.env.PROD
  
  const isCalendarBaseLayout = computed(() => {
    return route.path.startsWith('/calendar')
  })
  
  onMounted(() => {
    store.applyTheme(localStorage.theme || $waveui?.preferredTheme)


    // 로그인 상태 유지
    auth.checkLogin()
  })
  </script>
  <style>
    @font-face {
      font-family: 'NanumSquareRound';
      src: url('src\assets\fonts\NanumFontSetup_OTF_SQUARE\NanumSquareOTF_acR.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
  </style>  
  