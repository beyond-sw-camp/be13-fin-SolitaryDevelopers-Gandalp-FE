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

.sidebar {
  width: 270px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.right-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  overflow: hidden;
}

.page-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
