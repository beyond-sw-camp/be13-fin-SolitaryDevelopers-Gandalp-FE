<template>
    <div class="login-wrapper">
        <div class="login-box">
            <h2 class="title">로그인</h2>
            <form @submit.prevent="login">
              <input v-model="accountId" placeholder="아이디" class="input-box" />
              <input v-model="password" placeholder="비밀번호" type ="password" class="input-box" />
              <button type="submit" class="login-btn">확인</button>
            </form>
        </div>

    </div>
</template>

<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const accountId = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()


const login = async () => {
    try{
      await auth.login({
        accountId: accountId.value,
        password: password.value,
      })
    }catch (err){
        console.error(err) 
        alert(err.response?.data?.message || '로그인 실패') 
    }
}
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}

.login-box {
  border: 2px solid #53a8ff;
  border-radius: 10px;
  padding: 32px;
  width: 360px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 24px;
}

.input-box {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #53a8ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.login-btn:hover {
  background-color: #3a91e8;
}
</style>