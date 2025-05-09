<template>
  <div class="base-layout">
    <Sidebar class="sidebar" />

    <div class="right-content">
      <Header />
      <div class="page-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/common/Header.vue'
import Sidebar from '@/components/common/Sidebar.vue'
</script>

<style scoped>
.base-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 왼쪽 사이드바: 전체 높이 */
.sidebar {
  width: 270px;
  border-right: 1px solid #ccc;
  padding: 16px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
}

/* 오른쪽 콘텐츠: 헤더 + 본문 */
.right-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  overflow: hidden;
}

/* 본문 영역 */
.page-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
