<template>
  <div class="bed-update-page">
    <h2 class="title">병상 수용 정보</h2>
    <v-card class="bed-update-card">
      <div class="description">📋 현재 병원의 응급실 병상 수를 입력해주세요.</div>

      <form @submit.prevent="handleSubmit" class="form-box">
        <div class="form-group">
          <label>🏥 병원명</label>
          <span class="value">{{ hospital.name }}</span>
        </div>

        <div class="form-group beds-group">
          <label for="available">🛏 가용 병상 수</label>
          <input
            id="available"
            v-model.number="availableErCount"
            type="number"
            min="0"
            :max="hospital.totalErCount"
            required
          />
          <span class="slash">/</span>
          <span class="total">{{ hospital.totalErCount }}</span>
          <span class="unit">전체</span>
        </div>
      </form>

      <div class="submit-box">
        <v-btn size="small" variant="tonal" color="primary" @click="handleSubmit">
          수정
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'

const hospital = ref({ id: null, name: '', totalErCount: 0 })
const availableErCount = ref(0)

onMounted(async () => {
  const res = await apiClient.get('/hospitals/data')
  hospital.value = res.data
  availableErCount.value = res.data.availableErCount
})

async function handleSubmit() {
  if (availableErCount.value < 0 || availableErCount.value > hospital.value.totalErCount) {
    alert(`가용 병상 수는 0 이상 ${hospital.value.totalErCount} 이하로 입력해주세요.`)
    availableErCount.value = hospital.value.availableErCount
    return
  }

  await apiClient.post('/hospitals', {
    hospitalId: hospital.value.id,
    availableErCount: availableErCount.value
  })

  alert('수정되었습니다.')
}
</script>

<style scoped>

.bed-update-page {
  padding: 24px;
  font-family: 'Noto Sans KR', sans-serif;
}

.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #222;
}

.bed-update-card {
  width: 75.6vw;
  min-height: 480px;
  background-color: white;
  padding: 40px 60px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  gap: 20px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.form-box {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 32px; /* 기존 24px → 더 여유 있게 */
  border-top: 1px solid #e5e5e5;
  padding-top: 32px; /* 위 패딩도 조금 늘림 */
}

.form-group {
  display: flex;
  align-items: center;
}

.form-group label {
  width: 120px;
  font-weight: 600;
  margin-right: 10px;
}

.value {
  font-size: 14px;
  color: #333;
}

.beds-group input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.slash {
  margin: 0 8px;
  font-size: 16px;
  color: #555;
}

.total {
  width: 80px;
  text-align: center;
  font-size: 14px;
  color: #555;
}

.unit {
  margin-left: 8px;
  font-size: 14px;
  color: #555;
}

.submit-box {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
  padding-right: 60px; /* form-card 오른쪽 패딩과 일치 */
}

.submit-box button {
  min-width: 70px;
  height: 32px;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s;
}
.submit-box button:hover {
  background: #bfc7cc;
}

</style>
