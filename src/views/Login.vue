<template>
  <div class="login-wrapper">
    <div class="glass-card">
      <div class="left-content">
        <h1 class="brand-title">Gandalp</h1>
        <p class="brand-desc">Smart Scheduling for Healthcare Professionals</p>
      </div>
      <div class="right-content">
        <div class="logo-wrapper">
          <img src="@/assets/sidebar/image copy.png" alt="로고" class="login-logo" />
        </div>
        
        <form @submit.prevent="login">
          <input v-model="accountId" placeholder="아이디" class="input-box" />
          <input v-model="password" placeholder="비밀번호" type="password" class="input-box" />
          <button type="submit" class="login-btn">로그인</button>
          <p v-if="errorMessage" class="error-text" v-html="errorMessage"></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const accountId = ref('')
const password = ref('')
const auth = useAuthStore()
const errorMessage = ref('')

const login = async () => {
  if (!accountId.value || !password.value) {
    errorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.';
    return;
  }

  try {
    await auth.login({
      accountId: accountId.value,
      password: password.value,
    })
    errorMessage.value = '';

    const role = auth.userInfo.type
    if (role === 'ADMIN') {
      return router.push({ name: 'memberList' })
    } else if (role === 'PARAMEDIC') {
      return router.push({ name: 'hospitalMap' })
    }

    return router.push({ name: 'playground' })
  } catch (err) {
    const error = err.response?.data?.error;
    errorMessage.value = typeof error === 'string' ? error : '로그인 실패';
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard&display=swap');

.login-wrapper {
  height: 100vh;
  width: 100%;
  background-image: url('@/assets/sidebar/image copy 3.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Pretendard', 'Roboto', sans-serif;
}

.glass-card {
  width: 800px;
  height: 450px;
  display: flex;
  backdrop-filter: blur(20px);
  background: rgba(237, 247, 255, 0.4); /* 하늘색 투명 */
  border: 1px solid rgba(237, 247, 255, 0.6);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.left-content {
  flex: 1.2;
  padding: 40px;
  color: #0d1b2a; /* 진한 남색 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(237, 247, 255, 0.5); /* 하늘색 좀 더 진하게 */
}

.brand-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
}

.brand-desc {
  font-size: 20px;
  opacity: 0.8;
}

.right-content {
  flex: 1;
  background: rgba(237, 247, 255, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-logo {
  width: 180px;
  margin-bottom: 20px;
}

.input-box {
  width: 100%;
  padding: 14px;
  margin-bottom: 20px;
  border: 1px solid #a0d8ef; /* 테두리 살짝 진한 하늘색 */
  border-radius: 10px;
  background: white;
  font-size: 16px;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); /* 인풋 그림자 강화 */
}

.login-btn {
  width: 100%;
  padding: 14px;
  background-color: #a0d8ef; /* 버튼 색 진하게 */
  color: #1c2b4d;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #8ecae6; /* hover 시 더 진한 하늘색 */
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
</style>
