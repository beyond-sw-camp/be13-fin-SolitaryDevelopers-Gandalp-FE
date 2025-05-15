<template>
    <div class="create-nurse-container">
      <h2 class="title">간호사 정보 수정</h2>
      <form @submit.prevent="handleSubmit" class="form-box">
        <div class="form-group">
          <label for="name">이름</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input id="email" v-model="form.email" type="email" required />
        </div>
        <div class="submit-box">
          <button type="submit">수정</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import apiClient from '@/api/axios'
  
  const route = useRoute()
  const router = useRouter()
  const nurseId = route.params.id
  
  const form = ref({
    name: '',
    email: ''
  })
  
  // 기존 간호사 정보 불러오기
  onMounted(async () => {
    try {
      const res = await apiClient.get(`/nurses/${nurseId}`)
      form.value.name = res.data.name
      form.value.email = res.data.email
    } catch (err) {
      alert('간호사 정보를 불러오지 못했습니다.')
      console.error(err)
    }
  })
  
  // 수정 요청
  const handleSubmit = async () => {
    try {
      await apiClient.put(`/nurses/${nurseId}`, {
        name: form.value.name,
        email: form.value.email,
      })
      alert('수정되었습니다.')
      router.push('/nurseList')
    } catch (err) {
      alert(`수정 실패: ${err.response?.data || err.message}`)
      console.error(err)
    }
  }
  </script>
  
  <style scoped>
  .create-nurse-container {
    height: 100vh;
    background: #fff;
    padding: 40px 80px;
  }
  
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 30px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
  }
  
  .form-box {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    align-items: center;
  }
  
  .form-group label {
    width: 80px;
    font-weight: 600;
    margin-right: 10px;
  }
  
  .form-group input {
    flex: 1;
    max-width: 400px;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .submit-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .submit-box button {
    background-color: #d6e9f8;
    color: #000;
    font-weight: 600;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .submit-box button:hover {
    background-color: #c3ddf4;
  }
  </style>
  