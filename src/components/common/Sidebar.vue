<template>
  <div class="sidebar">
    <div class="logo">
      <img :src="gandalpLogo" alt="GANDALP 로고" @click="router.push('/')" class="logo-img"/>
    </div>
      <NoticeSidebar v-if="!isAdmin"/>
      <NurseStatusSidebar v-if="!isAdmin"/>
    </div>
</template>
<script setup>
import gandalpLogo from '@/assets/sidebar/gandalp_logo.png'
import NurseStatusSidebar from './NurseStatusSidebar.vue';
import NoticeSidebar from './NoticeSidebar.vue';
import {useAuthStore} from "@/stores/auth.js";
import {computed} from "vue";
import { useRouter } from 'vue-router';

const router = useRouter()
const auth    = useAuthStore()
const isAdmin = computed(() => auth.userInfo.type === 'ADMIN')


</script>


<style scoped>
.sidebar {  
  min-height: 100vh;    
  width: 240px;
  padding: 16px;
  background-color: #edf7ff;
  box-sizing: border-box;
  border: none;              /* ✅ 테두리 없음 */
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  gap: 20px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

}

.logo {
  display: flex;
  justify-content: center;   /* 가운데 정렬 */
  align-items: center;
  margin-top: 10px;
  margin-bottom: 16px;       /* 여백 살짝 늘리기 */
  height: 100px;           /* 로고 영역 고정 높이 */
  width: 200px;
}

.logo img {
  max-height: 130%;
  max-width: 130%;
  object-fit: contain;
}


.status-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  padding-left: 10px;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
  padding-left: 25px;
}

.nurse-name {
  font-weight: bold;
  margin-right: 10px;
  min-width: 50px;
  color: #545454;
}

.status-text {
  font-size: 14px;
  color: #584e4e;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.logo-img {
  cursor: pointer;
}

.pink { background-color: #f48fb1; }
.blue { background-color: #64b5f6; }
.gray { background-color: #b0bec5; }
</style>