<template>
    <div class="nurse-create-page">
        <h2 class="title">간호사 계정 생성</h2>

        <v-card class="form-card">
        <form @submit.prevent="handleSubmit" class="form-box">
            <div class="form-group">
            <label for="name">이름</label>
            <input id="name" v-model="form.name" type="text" required />
            </div>

            <div class="form-group">
            <label for="email">이메일</label>
            <input id="email" v-model="form.email" type="email" required />
            </div>

            <div class="form-group">
            <label for="password">비밀번호</label>
            <input id="password" v-model="form.password" type="password" required />
            </div>

            <div class="form-group">
              <label for="type">유형</label>
                <v-select
                    v-model="form.type"
                    :items="typeOptions"
                    item-value="value"
                    item-title="label"
                    placeholder="유형 선택"
                    class="type-select"
                    variant="none"
                    density="compact"
                    hide-details
                    bg-color="#edf7ff" 
                    />
            </div>

        </form>
        <div class="modal-btns">
              <v-btn size="small" variant="tonal" color="primary" @click="handleSubmit">등록</v-btn>
            </div>
      </v-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '@/api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
name: '',
email: '',
password: '',
type: null
})

const typeOptions = [
{ label: '수간호사', value: 'HEAD_NURSE' },
{ label: '일반간호사', value: 'NURSE' },
{ label: '야간전담', value: 'NIGHT_NURSE' }
]

const handleSubmit = async () => {
try {
    await apiClient.post('/nurses', form.value)
    alert('간호사 계정이 생성되었습니다.')
    form.value = { name: '', email: '', password: '', type: null }
    router.push('/nurseList')
} catch (err) {
    alert(`생성 실패: ${err.response?.data || err.message}`)
}
}
</script>

<style scoped>
/* v-select 높이 줄이기 및 폰트 정리 */
::v-deep(.type-select .v-input) {
  min-height: 36px !important;
  height: 36px !important;
  font-size: 13px !important;
  border-radius: 8px !important;
}

::v-deep(.type-select .v-field) {
  height: 32px !important;
  border-radius: 8px !important;
  background-color: #edf7ff !important;
  padding: 0 10px !important;
}

::v-deep(.type-select .v-field__input) {
  font-size: 13px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  height: 100% !important;
}

/* 드롭다운 항목도 작게 */
::v-deep(.v-overlay-container .v-list .v-list-item) {
  min-height: 32px !important;
  font-size: 13px !important;
  padding: 4px 10px !important;
}

.nurse-create-page {
padding: 24px;
border-radius: 10px;
font-family: 'Noto Sans KR', sans-serif;
}

.title {
text-align: center;
font-size: 18px;
font-weight: bold;
margin-bottom: 16px;
margin-top: 5px;
color: black;
}

.modal-btns {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
  padding-right: 60px; /* form-card 오른쪽 패딩과 일치 */
}

.modal-btns button {
  min-width: 70px;
  height: 32px;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-btns button:hover {
  background: #bfc7cc;
}


/* ✅ shift 페이지와 동일한 카드 스타일 */
.form-card {
  width: 75.5vw;
  background-color: white;
  padding: 40px 60px;
  border-radius: 25px;

  display: flex;
  flex-direction: column;
  align-items: center; /* form-box를 가운데로 */
}

.form-box {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
display: flex;
align-items: center;
gap: 12px;
}

.form-group label {
width: 100px;
font-weight: 600;
color: #334155;
font-size: 15px;
}

.form-group input,
.type-select {
  flex: 1;

  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  background-color: #edf7ff;
}

.submit-box {
display: flex;
justify-content: flex-end;
margin-top: 30px;
}

.submit-box button {
background-color: #38bdf8;
color: #fff;
font-weight: 600;
border: none;
padding: 10px 24px;
font-size: 14px;
border-radius: 12px;
box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.08);
cursor: pointer;
transition: background-color 0.2s ease-in-out;
}

.submit-box button:hover {
background-color: #0ea5e9;
}

</style>
