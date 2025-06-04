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
  background-color: #edf7ff; /* 하늘색으로 깔아줄 부분 */
  display: flex;
  min-height: 100vh;
  height: max-content;
  overflow: hidden;
}

.sidebar {
  width: 270px;
  height: 100vh;
  border-right: none;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.right-content {
  background-color: #edf7ff;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
  overflow: hidden;
}

.page-container {
  flex: 1;
  padding: 24px;
  background-color: transparent;
  margin-left: 56px;
}
</style>
