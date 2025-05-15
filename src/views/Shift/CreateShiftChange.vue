<template>
  <div class="shift-create-page">
    <h2 class="title">교대근무 교환 신청</h2>
    <div class="shift-form">
      <select v-model="selectedMonth">
        <option disabled value="">월</option>
        <option v-for="month in months" :key="month" :value="month">{{ month }}월</option>
      </select>
      <select v-model="selectedDay">
        <option disabled value="">일</option>
        <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}일</option>
      </select>
      <select v-model="selectedTime">
        <option disabled value="">타임</option>
        <option v-for="time in times" :key="time" :value="time">{{ time }}</option>
      </select>
    </div>
    <div class="btns">
      <button class="submit-btn" @click="submitShift">확인</button>
      <button class="cancel-btn" @click="resetForm">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import apiClient from '@/api/axios'

// 월, 일, 타임 옵션
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const selectedMonth = ref('')
const selectedDay = ref('')
const selectedTime = ref('')
const times = ['데이', '이브닝', '나이트']

// 일 수 동적 계산 (윤년 등은 단순화)
const daysInMonth = computed(() => {
  const month = Number(selectedMonth.value)
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return Array.from({ length: 31 }, (_, i) => i + 1)
  if ([4, 6, 9, 11].includes(month)) return Array.from({ length: 30 }, (_, i) => i + 1)
  if (month === 2) return Array.from({ length: 29 }, (_, i) => i + 1) // 윤년 단순화
  return []
})


// 교대근무 교환 신청
const submitShift = async () => {
  if (!selectedMonth.value || !selectedDay.value || !selectedTime.value) {
    alert('월, 일, 타임을 모두 선택해 주세요.')
    return
  }
  // content 예시: "5월 12일 데이"
  const content = `${selectedMonth.value}월 ${selectedDay.value}일 ${selectedTime.value}`
  try {
    await apiClient.post('/shifts/create', {
    //   memberId,
    //   departmentId,
      content
    })
    alert('교대근무 교환 신청이 완료되었습니다.')
    resetForm()
  } catch (err) {
    alert('신청 중 오류가 발생했습니다.')
    console.error(err)
  }
}

const resetForm = () => {
  selectedMonth.value = ''
  selectedDay.value = ''
  selectedTime.value = ''
}
</script>

<style scoped>
.shift-create-page {
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}
.shift-form {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}
.shift-form select {
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #b3e0fc;
  background: #f9fcff;
}
.btns {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.submit-btn, .cancel-btn {
  width: 100px;
  height: 36px;
  font-size: 15px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: linear-gradient(to right, #ADDDF9 0%, #C2EBFF 100%);
  color: #222;
  transition: all 0.2s;
}
.submit-btn:hover, .cancel-btn:hover {
  background: linear-gradient(to right, #8CCEF0 0%, #A0E4FF 100%);
  color: #222;
}
</style>
