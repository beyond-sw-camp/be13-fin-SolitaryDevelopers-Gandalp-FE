<template>
  <div class="sidebar">
    <div class="logo">
      <img :src="gandalpLogo" alt="GANDALP 로고" />
    </div>

      <div class="notice-section"  v-if ="!isAdmin">
        <h4 class="notice-title">📌 공지사항</h4>

        <div class="notice-box">
          <div class="notice-content">
            <p>간달프 시스템 점검 예정</p>
            <p>29일 10시 수술실 예약</p>
            <p>5월 1일 근무자 일정 업데이트</p>
            <p>5월 1일 근무자 일정 업데이트</p>
            <p>5월 1일 근무자 일정 업데이트</p>
            <p>5월 1일 근무자 일정 업데이트</p>
            <p>5월 1일 근무자 일정 업데이트</p>
            <p>5월 1일 근무자 일정 업데이트</p>
          </div>
        </div>
      </div>

        <!--  -->
        <NurseStatusSidebar v-if="!isAdmin"/>
    </div>
</template>
<script setup>
import gandalpLogo from '@/assets/sidebar/gandalp_logo.png'
import NurseStatusSidebar from './NurseStatusSidebar.vue';
import {useAuthStore} from "@/stores/auth.js";
import {computed} from "vue";


const auth    = useAuthStore()
const isAdmin = computed(() => auth.userInfo.type === 'ADMIN')


</script>

<style scoped>
.sidebar {
  width: 240px;
  padding: 16px;
  background-color: #f5f5f5;
  box-sizing: border-box;
  border: none;              /* ✅ 테두리 없음 */
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  gap: 20px;
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

.notice-section {
  background-color: white;
    border: #ddd solid 1px;
  border-radius: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    padding-top: 10px;
    padding-left: 10px;

}
.status-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-title,
.status-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  padding-left: 10px;
}

.notice-box {
  
  padding: 12px;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;


}

.notice-content p {
  margin: 4px 0;
  line-height: 1.4;
  font-size: 12px;
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

.pink { background-color: #f48fb1; }
.blue { background-color: #64b5f6; }
.gray { background-color: #b0bec5; }
</style>
