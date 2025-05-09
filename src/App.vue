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
  import Documentation from '@/documentation/index.vue'
  
  const $waveui = inject('$waveui')
  const store = useAppStore()
  const route = useRoute()
  const isProduction = import.meta.env.PROD
  
  const isCalendarBaseLayout = computed(() => {
    return route.path.startsWith('/calendar')
  })
  
  onMounted(() => {
    store.applyTheme(localStorage.theme || $waveui?.preferredTheme)
  })
  </script>
  