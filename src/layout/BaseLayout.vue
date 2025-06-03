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
  min-height: 100vh;
  height: max-content;
  overflow: hidden;
}

.sidebar {
  width: 270px;
  border-right: none;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.right-content {
  background-color: #edf7ff;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.page-container {
  flex: 1;
  padding: 24px;
  background-color: transparent;
  margin-left: 56px;
}
</style>
