<template>

  <div class="join-content">


    <div class="title-container">
      <h2 class="title">계정 목록 조회</h2>

    </div>

    <div class="select-job">
      <label class="radio-box">
        <input type="radio" name="option" value="A" checked>
        <span class="box-label">구급대원</span>
      </label>

      <label class="radio-box">
        <input type="radio" name="option" value="A" checked>
        <span class="box-label">간호사</span>
      </label>

      <label class="radio-box">
        <input type="radio" name="option" value="A" checked>
        <span class="box-label">수 간호사</span>
      </label>
    </div>

    <div>

      <label class="hospital-label">
        <span class="hospital-label">병원</span>
        <input type="text">
      </label>

      <label class="hospital-label">
        <span class="hospital-label">진료과</span>
        <input type="text">
      </label>

      <label class="hospital-label">
        <span class="hospital-label">이름</span>
        <input type="text">
      </label>

      <label class="hospital-label">
        <span class="hospital-label">비밀번호</span>
        <input type="password">
      </label>

    </div>


    <div class="btn-box">
      <button @click="enroll">등록</button>
    </div>

    <div v-if="message" class="alert">
      {{message}}
    </div>


  </div>

</template>

<script setup>
import Sidebar from "@/components/common/Sidebar.vue";
import Header from "@/components/common/Header.vue";
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'

const type = ref('');
const hospital = ref('');
const accountId = ref('');
const password = ref('');
const department = ref('');
const message = ref('');

const enroll = async() =>{

  try{
    await apiClient.post('/auth/join',{

      type : type.value,
      hospital : hospital.value,
      department : department.value,
      accountId : accountId.value,
      password: password.value
    })

    message.value = '계정 생성이 완료되었습니다.'
  }catch(err){
    message.value = err.response?.data?.message || "계정을 생성할 수 없습니다.";
  }

};


</script>

<style lang="scss" scoped>




</style>
