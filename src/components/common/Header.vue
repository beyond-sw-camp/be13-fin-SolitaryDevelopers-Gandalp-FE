<template>
  <header class="header">
    <div class="header-inner">
      <template v-if="isAdmin">
        <v-btn variant="text" class="nav-btn" to="/joinMember">계정 생성</v-btn>
        <v-btn variant="text" class="nav-btn" to="/memberList">계정 목록</v-btn>
      </template>

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
            <v-list-item v-if="isHeadNurse" to="/work-management" title="근무 관리" />
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

      <template v-if="auth.isLoggedIn">
        <v-menu open-on-click offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" class="profile-btn">
              <svg-icon type="mdi" :path="mdiAccount" class="profile-icon" />
            </v-btn>
          </template>

          <v-card class="profile-card">
            <v-card-text>
              <div class="profile-info-horizontal">
                <svg-icon type="mdi" :path="mdiAccount" class="profile-avatar-icon" />
                <div class="profile-meta">
                  <div class="profile-name-large">{{ auth.userInfo.username || '사용자' }} 님</div>
                  <div class="profile-subinfo-line">
                    <span>{{ myInfo.hospitalName }}</span>
                    <span>{{ myInfo.deptName }}</span>
                    <span>{{ myInfo.type }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-list-item class="centered-title" title="로그아웃" @click="logout" />
          </v-card>
        </v-menu>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount } from '@mdi/js'
import apiClient from '@/api/axios'

const router = useRouter()
const auth = useAuthStore()
const isAdmin = computed(() => auth.userInfo.type === 'ADMIN')
const isParamedic = computed(() => auth.userInfo.type === 'PARAMEDIC')
const isHeadNurse = computed(() => auth.userInfo.type === 'HEAD_NURSE')

const myInfo = ref({ hospitalName: '', deptName: '', type: '' })

const login = () => router.push("/login")

const logout = () => {
  if (confirm('정말로 로그아웃하시겠습니까?')) {
    auth.logout()
  }
}

onMounted(async () => {
  if (auth.isLoggedIn) {
    try {
      const res = await apiClient.get('/members/myInfo')
      myInfo.value = res.data
    } catch (e) {
      console.error('내 정보 조회 실패 : ', e)
    }
  }
})
</script>

<style scoped>
.profile-btn {
  background-color: transparent !important;
  box-shadow: none !important;
  transition: none !important;
}

.profile-btn:hover,
.profile-btn:focus,
.profile-btn:active {
  background-color: transparent !important;
  box-shadow: none !important;
}

.profile-icon {
  width: 24px;
  height: 24px;
  color: white;
  background-color: transparent;
}

.profile-card {
  min-width: 240px;
}

.profile-info-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 4px;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile-subinfo-line {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.profile-name-large {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.profile-avatar-icon {
  width: 48px;
  height: 48px;
  color: #888;
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
  height: 40px;
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

.centered-title {
  text-align: center;
  width: 100%;
}

.nav-btn {
  color: white !important;
  font-size: 14px;
  text-transform: none;
  padding: 0 12px;
  height: 36px;
}

.nav-btn:hover {
  color: #86e3d1 !important;
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>