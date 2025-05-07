<template>
    <div class="base-layout">
      <!-- 좌측 사이드바 -->
      <div class="sidebar">
        <Sidebar />
      </div>
  
      <!-- 우측: 헤더 + 본문 -->
      <div class="right-content">
        <Header />
        <main class="page-container">
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
  .base-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  
  /* 왼쪽 사이드바 */
  .sidebar {
    width: 280px;
    background-color: #B3EBED;
    padding: 16px;
    border-right: 1px solid #ccc;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  /* 오른쪽 전체 영역 */
  .right-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100vh;
  }
  
  /* 페이지 내용 */
  .page-container {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: #fff;
  }
  </style>
  