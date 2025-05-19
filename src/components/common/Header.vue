<template>
  <header class="header">

  <div class="header-content">
<!--    관리자인 경우 계정 생성, 계정 목록 조회됨 -->
    <nav class="nav">


      <div v-if ="isAdmin">
        <RouterLink to="/joinMember">계정 생성</RouterLink>
        <RouterLink to="/memberList">계정 목록</RouterLink>

      </div>



      <!-- 응급대원인 경우 지도 검색만 볼 수 있음 -->
<!--      <div v-else-if="isParamedic">-->
<!--        <RouterLink to="/hospitalList">병상 수용 정보</RouterLink>-->
<!--      </div>-->

      <div v-else>



        <RouterLink to="/calendar">캘린더</RouterLink>
        <RouterLink to="/shifts">근무 교대 신청</RouterLink>
        <RouterLink to="/bed-info">병상 수용 정보</RouterLink>
        <RouterLink to="/surgery-reservation">수술실 예약</RouterLink>

        <div class="dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <span class="menu-title">근무 관리 ▾</span>
          <div class="dropdown-menu" v-if="showDropdown">
            <RouterLink to="/showOff">오프</RouterLink>
            <RouterLink to="/manageOff">오프 관리</RouterLink>
            <RouterLink to="/work-management">근무 관리</RouterLink>
          </div>

        </div>

        <RouterLink to="/statistics">분석 차트</RouterLink>

        <RouterLink to="/updateEr">병상 수용 정보</RouterLink>



        <div class="dropdown" v-if="isHeadNurse"  @mouseenter="showNurseDropDown = true" @mouseleave="showNurseDropDown = false">
          <span class="menu-title">간호사 관리 ▾</span>
          <div class="dropdown-menu" v-if="showNurseDropDown">
            <RouterLink to="/nurses">간호사 생성</RouterLink>
            <RouterLink to="/nurseList">간호사 목록</RouterLink>
          </div>
      </div>

    </div>
    </nav>
   </div>
    <div class="auth-btn">
        <button v-if="auth.isLoggedIn"  @click="logout">Logout</button>
        <button v-else @click="login">Login</button>
    </div>
 
  </header>
</template>

<script setup>

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDropdown = ref(false)
const auth    = useAuthStore()
const isAdmin = computed(() => auth.userInfo.type === 'ADMIN')
const isParamedic  = computed(() => auth.userInfo.type === 'PARAMEDIC')
const isHeadNurse = computed(() => auth.userInfo.type === 'HEAD_NURSE')
const showNurseDropDown = ref(false)




const login = () => {
  router.push("/login")
}

const logout = () => {
  if( confirm('정말로 로그아웃하시겠습니까?') ){
    auth.logout();
  }



}


</script>


<style scoped>
.nav a ,
.menu-title {
  font-size: 15px;
  color: #FFFFFF !important;
  padding: 6px 10px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
}

.header {
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;  
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 500;
  margin-left: 20px;
  width: 81vw;
  letter-spacing: .04rem;
  padding: 5px;
  background-color: rgb(36, 36, 36); /* header 배경색과 일치 */
  margin-top: 10px;
  border-radius: 10px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  gap: 4vw;
  align-items: center;
}

.nav a {
  text-decoration: none;
  color: #ffffff;
  padding: 6px 10px;
}
.nav a:hover {
  color: #4a73a5;
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
  border-radius: 10px;
  top: 25px;
  left: 0;
  background: black;
  border: 1px solid #ccc;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.dropdown-menu a {
   border-radius: 10px;
  display: block;
  padding: 8px 12px;
  color: #5a5d64;
  text-decoration: none;
}
.dropdown-menu a:hover {
   border-radius: 10px;
  background-color: #5a5d64;
}



.auth-btn button {
  background-color: #f5f5f5;
  padding: 9px 12px;
  border: none;
  color: black;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 100px;
}
.auth-btn button:hover {
  background-color: #424449;
  color: white;
}
</style>
