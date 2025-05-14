<template>
  <header class="header">


<!--    관리자인 경우 계정 생성, 계정 목록 조회됨 -->
    <nav class="nav">


      <div v-if ="!isAdmin">
        <RouterLink to="/joinMember">계정 생성</RouterLink>
        <RouterLink to="/memberList">계정 목록</RouterLink>

      </div>

      <div v-else>


        <RouterLink to="/calendar">캘린더</RouterLink>
        <RouterLink to="/shift-request">근무 교대 신청</RouterLink>
        <RouterLink to="/bed-info">병상 수용 정보</RouterLink>
        <RouterLink to="/surgery-reservation">수술실 예약</RouterLink>

        <div class="dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <span class="menu-title">근무 관리 ▾</span>
          <div class="dropdown-menu" v-if="showDropdown">
            <RouterLink to="/showOff">오프</RouterLink>
            <RouterLink to="/off-management">오프 관리</RouterLink>
            <RouterLink to="/work-management">근무 관리</RouterLink>
          </div>
        </div>

        <RouterLink to="/analytics">분석 차트</RouterLink>

      </div>

    </nav>

    <div class="auth-btn">
      <button @click="logout">로그아웃</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDropdown = ref(false)

const logout = () => {
  // 예시: 로컬스토리지 제거 후 이동
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 1px 5px 0 rgba(107, 119, 172, 0.2);
  font-weight: bold;
  position: relative;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
}
.logo img {
  height: 40px;
  margin-right: 10px;
}
.logo .brand {
  font-size: 22px;
  color: #1b9aaa;
}

.nav >*{
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav a {
  text-decoration: none;
  color: #001248;
  padding: 6px 10px;
}
.nav a:hover {
  color: #1b9aaa;
}

.menu-title {
color: #001248;
cursor: pointer;
}

.dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 25px;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.dropdown-menu a {
  display: block;
  padding: 8px 12px;
  color: #5a5d64;
  text-decoration: none;
}
.dropdown-menu a:hover {
  background-color: #f0f0f0;
}

.auth-btn button {
  padding: 6px 12px;
  border: 1px solid #1b9aaa;
  background: white;
  color: #1b9aaa;
  border-radius: 4px;
  cursor: pointer;
}
.auth-btn button:hover {
  background-color: #1b9aaa;
  color: white;
}
</style>
