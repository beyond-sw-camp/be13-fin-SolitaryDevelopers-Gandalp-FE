<template>
  <div class="calendar-layout">
    <Sidebar class="sidebar" />

    <div class="right-section">
      <Header class="header" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/common/Header.vue'
import Sidebar from '@/components/common/Sidebar.vue'
</script>

<style scoped>
.calendar-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 270px;
  border-right: 1px solid #ccc;
  padding: 16px;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;
}

.right-section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
  overflow: hidden;
}

.header {
  height: 60px;
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
}
</style>