<template>
  <div class="statistic-page">

    <div class="page-wrapper">
    <!-- 1) 탭 네비게이션 -->
    <div class="tab-nav">
      <button
        v-for="t in tabs"
        :key="t.name"
        :class="{ active: currentTab === t.name }"
        @click="currentTab = t.name"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 2) 동적 컴포넌트 바인딩 -->
    <component
      :is="currentComponent"
      :key="currentTab"
      @refresh="onChildRefresh"
    />

    </div>

  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'

const tabs = [
  { name: 'er',    label: '응급실 병상 통계',      cmp: () => import('./ErBedStatistics.vue') },
  { name: 'work',  label: '간호사 근무 분석',      cmp: () => import('./NurseWorkingAnalysis.vue') },
  { name: 'ratio', label: '업무 비율 분석',        cmp: () => import('./NurseTaskRatioAnalysis.vue') },
]

const currentTab = ref('work')

// computed: defineAsyncComponent 로 포인트 지연 로딩
const currentComponent = computed(() =>
  defineAsyncComponent(tabs.find(t => t.name === currentTab.value).cmp)
)

// 자식 컴포넌트에서 @refresh 이벤트를 emit 하면 다시 loadData()
function onChildRefresh() {
  // 예: 공통 로딩 처리(UI 스피너 등)
}
</script>

<style scoped>
.tab-nav {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  justify-content: center;
}

.page-wrapper {
  margin: 0 auto;
  max-width: 1200px;
  padding: 16px 0;
}

.tab-nav button {
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}


.tab-nav button:hover {
  color: #333;
}

.tab-nav button.active {
  color: #111;
  border-bottom: 2px solid #666;
}
</style>
