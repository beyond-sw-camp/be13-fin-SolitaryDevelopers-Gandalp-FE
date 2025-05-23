<template>
  <div class="bed-update-container">
    <h2 class="title">병상 수용 정보</h2>
    <form @submit.prevent="handleSubmit" class="form-box">
      <div class="form-group">
        <label>병원명</label>
        <span class="value">{{ hospital.name }}</span>
      </div>
      <div class="form-group beds-group">
        <label for="available">가용 병상 수</label>
        <input
          id="available"
          v-model.number="availableErCount"
          type="number"
          min="0"
          :max="hospital.tatalErCount"
          required
        />
        <span class="slash">/</span>
        <span class="total">{{ hospital.totalErCount }}</span>
        <span class="unit">전체 병상 수</span>
      </div>
      <div class="submit-box">
        <button type="submit">수정</button>
      </div>
    </form>
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

  if(availableErCount.value < 0  || availableErCount.value > hospital.value.totalErCount){
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
.bed-update-container {
  min-height: 100vh;
  background: #fff;
  padding: 40px 80px;
  box-sizing: border-box;
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
