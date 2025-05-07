<template>
    <div class="base-layout">
      
      <!-- 헤더 -->
      <Header/>
  
      <!-- 메인 콘텐츠 영역 -->
      <main class="main-content">
  
        <!-- 실제 페이지 콘텐츠 -->
        <section class="page-container">
          <router-view />
        </section>
      </main>
  
      <!-- 하단 영역 -->
      <footer class="footer">
        © 2025 간달프
      </footer>
    </div>
  </template>
  
  <script setup>
import Header from '@/components/common/Header.vue'
</script>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  display: flex; /* 좌우 레이아웃 */
  flex-grow: 1;
  background-color: #f9f9f9;
}

.sidebar {
  width: 240px;
  background-color: #e0f7fa;
  padding: 16px;
  border-right: 1px solid #ccc;
  position: sticky;
  top: 0;
  height: calc(100vh - 60px); /* 헤더 높이 감안 */
  overflow-y: auto;
}

.page-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 아래는 스타일 예시 */
.legend {
  margin-top: 20px;
  font-size: 0.9rem;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.red { background: #f55; }
.blue { background: #55f; }
.purple { background: #a5a; }
.gray { background: #888; }

.footer {
  text-align: center;
  padding: 10px;
  background-color: #e0e0e0;
  font-size: 0.85rem;
  color: #333;
}
</style>