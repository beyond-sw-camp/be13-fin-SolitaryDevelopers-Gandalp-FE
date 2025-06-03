<template>
  <div class="login-wrapper">
    <div class="logo-circle">
      <img src="@/assets/sidebar/gandalp_login_logo.png" alt="로고" class="logo-img" />
    </div>
    <div class="login-box">
      <form @submit.prevent="login">
        <input v-model="accountId" placeholder="아이디" class="input-box" />
        <input v-model="password" placeholder="비밀번호" type="password" class="input-box" />
        <button type="submit" class="login-btn">확인</button>
        <p v-if="errorMessage" class="error-text" v-html="errorMessage"></p>
      </form>
    </div>
  </div>
</template>


<script setup>

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const accountId = ref('')
const password = ref('')
const auth = useAuthStore()
const errorMessage = ref('')

const login = async () => {
  if (!accountId.value || !password.value) {
    errorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.';
    return;
  }

    try{
      await auth.login({
        accountId: accountId.value,
        password: password.value,
      })
      errorMessage.value = '';

      const role = auth.userInfo.type
      if(role === 'ADMIN') {
        return router.push({name: 'memberList'})
      }else if (role ==='PARAMEDIC') {
        return router.push({name: 'hospitalMap'})
      }

      return router.push({name: 'playground'})
    }catch (err){
      const error = err.response?.data?.error;
      errorMessage.value = typeof error === 'string' ? error : '로그인 실패';

    }
}
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #5b7cff; /* 이미지와 동일한 파란색 */
  position: relative;
}

.logo-circle {
  width: 280px;
  height: 280px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 48px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.logo-img {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

.login-box {
  border: none;
  border-radius: 10px;
  padding: 32px 32px 24px 32px;
  width: 360px;
  background: transparent;
  box-shadow: none;
  margin-top: 0;
}

.title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 24px;
  color: #fff;
}

.input-box {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  color: black;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.login-btn:hover {
  background-color: #d4d8dd;
}
.error-text {
  color: #fff;
  background: #ff4d4f;
  border-radius: 4px;
  margin-top: 8px;
  padding: 6px 0;
  white-space: pre-line;
  text-align: center;
}

/* .login-wrapper {
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
.error-text {
  color: red;
  margin-top: 8px;
  white-space: pre-line;
} */

</style>