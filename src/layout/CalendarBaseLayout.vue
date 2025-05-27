<template>
  <div class="calendar-layout">
    <Sidebar class="sidebar" />

    <div class="right-section">
      <Header />
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
  overflow: hidden;
}

.sidebar {
  width: 270px;
  border-right: none;
  padding: 20px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.right-section {
  background-color: #edf7ff;
  display: flex;
  flex-direction: column;
  /* flex-grow: 1; */
  flex: 1;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 100px;
  background-color: #edf7ff;
}
</style>