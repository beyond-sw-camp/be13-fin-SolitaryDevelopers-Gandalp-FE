<template>
  <header class="header">

    <div class="header-inner">
<!--    관리자인 경우 계정 생성, 계정 목록 조회됨 -->

      <template v-if="isAdmin">
        <v-btn variant="text" class="nav-btn" to="/joinMember">계정 생성</v-btn>
        <v-btn variant="text" class="nav-btn" to="/memberList">계정 목록</v-btn>
      </template>

<!--       응급대원인 경우 지도 검색만 볼 수 있음-->
      <template v-else-if="isParamedic">
        <v-btn variant="text" class="nav-btn" to="/hospitalMap">병원 찾기</v-btn>
      </template>

      <template v-else>
        <v-btn variant="text" class="nav-btn" to="/calendar">캘린더</v-btn>
        <v-btn variant="text" class="nav-btn" to="/shifts">근무 교대 신청</v-btn>
        <v-btn variant="text" class="nav-btn" to="/surgeryReservation">수술실 예약</v-btn>

        <v-menu open-on-hover offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="nav-btn">근무 관리 ▾</v-btn>
          </template>
          <v-list>
            <v-list-item to="/showOff" title="오프" />
            <v-list-item to="/manageOff" title="오프 관리" />
            <v-list-item to="/work-management" title="근무 관리" />
          </v-list>
        </v-menu>

        <v-btn variant="text" class="nav-btn" to="/statistics">분석 차트</v-btn>

        <v-menu v-if="isHeadNurse" open-on-hover offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="nav-btn">간호사 관리 ▾</v-btn>
          </template>
          <v-list>
            <v-list-item to="/nurses" title="간호사 생성" />
            <v-list-item to="/nurseList" title="간호사 목록" />
          </v-list>
        </v-menu>

        <v-btn variant="text" class="nav-btn" to="/updateEr">병상 정보 수정</v-btn>
      </template>
      <v-btn variant="text" class="nav-btn" @click="auth.isLoggedIn ? logout() : login()">
        <v-icon color="white">{{ auth.isLoggedIn ? 'mdi-logout' : 'mdi-login' }}</v-icon>
      </v-btn>
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

::v-deep(.v-list-item) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

::v-deep(.v-list-item-title) {
  font-size: 13px !important;
}

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
  margin-left: 107px;
  width: 75.4vw;
  letter-spacing: .04rem;
  padding: 5px;
  background: linear-gradient(135deg, #1842fe 0%, #2b54ff 50%, #3a65ff 100%);

  margin-top: 10px;
  border-radius: 10px;
  height: 30px;
}

.header-inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
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
  gap: 2vw; 
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

.nav-btn {
  color: white !important;
  font-size: 14px;
  text-transform: none;
  padding: 0 12px;
  height: 36px;
}

.nav-btn:hover {
  color: #86e3d1  !important;
  background-color: transparent !important; /* ← 배경색 제거 */
  box-shadow: none !important;              /* ← 그림자 제거 (필요시) */
}

.auth-btn button {
  background-color: rgb(36, 36, 36);
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
