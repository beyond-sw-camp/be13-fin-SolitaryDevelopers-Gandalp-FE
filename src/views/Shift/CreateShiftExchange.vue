<template>
  <div class="shift-create-page">
    <span class="title">교대근무 교환 신청</span>
    <br><br>

    <v-card class="form-card" flat>
      <v-row class="form-row" dense>
        <v-col cols="3.5">
          <v-select
            v-model="selectedMonth"
            :items="months"
            label="월"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="3.5">
          <v-select
            v-model="selectedDay"
            :items="daysInMonth"
            label="일"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="5">
          <v-select
            v-model="selectedTime"
            :items="times"
            label="타임"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row class="btn-row" justify="center" dense>
        <v-btn class="btn" size="small" variant="tonal" color="primary" @click="openUserCheckModal">확인</v-btn>
        <v-btn class="btn" size="small" variant="tonal" color="error" @click="resetForm">취소</v-btn>
      </v-row>
    </v-card>
    
  </div>

  <!-- 사용자 확인 모달 -->
  <UserCheckModalV2
    v-if="showModal"
    @close="showModal = false"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import apiClient from '@/api/axios'
import UserCheckModal from '@/components/UserCheckModal.vue'
import { useRouter } from 'vue-router'
import UserCheckModalV2 from '@/components/UserCheckModalV2.vue'
const router = useRouter()

const showModal = ref(false)
const nurseInfo = ref(null)

const months = Array.from({ length: 12 }, (_, i) => i + 1)
const selectedMonth = ref('')
const selectedDay = ref('')
const selectedTime = ref('')
const times = ['데이', '이브닝', '나이트']

const daysInMonth = computed(() => {
  const month = Number(selectedMonth.value)
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return Array.from({ length: 31 }, (_, i) => i + 1)
  if ([4, 6, 9, 11].includes(month)) return Array.from({ length: 30 }, (_, i) => i + 1)
  if (month === 2) return Array.from({ length: 29 }, (_, i) => i + 1)
  return []
})


const handleSubmit = async ({ email, password }) => {
  try {
    const res = await apiClient.post('schedules/check', null, {
      params: { email, password }
    })
    nurseInfo.value = res.data
    showModal.value = false
    await submitShift()

  } catch (err) {
  alert('이메일이나 비밀번호가 잘못 입력되었습니다.')
  showModal.value = false;
  }
}

const resetForm = () => {
  selectedMonth.value = ''
  selectedDay.value = ''
  selectedTime.value = ''
  router.push({ name: 'shift-list' }) // ← 취소 시 이동
}

// 과거 선택 방지 코드
const now = new Date()
const getShiftStartHour = (time) => {
  if (time === '데이') return 6
  if (time === '이브닝') return 14
  if (time === '나이트') return 22
  return 0
}
const isPast = (month, day, time) => {
  const year = now.getFullYear()
  const date = new Date(year, month - 1, day, getShiftStartHour(time), 0, 0)
  return date < now
}
const openUserCheckModal = () => {
  if (!selectedMonth.value || !selectedDay.value || !selectedTime.value) {
    alert('월, 일, 타임을 모두 선택해 주세요.')
    return
  }
  if (isPast(selectedMonth.value, selectedDay.value, selectedTime.value)) {
    alert('과거 일정은 신청할 수 없습니다.')
    return
  }
  showModal.value = true
}

const submitShift = async () => {
  const year = new Date().getFullYear()
  const month = selectedMonth.value
  const day = selectedDay.value
  const time = selectedTime.value
  const startHour = getShiftStartHour(time)
  const startTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(startHour).padStart(2, '0')}:00:00`
  const nurseId = nurseInfo.value.id

  // 1. 일정 존재 여부 확인
  const exists = await apiClient.get('/schedules/exists', { params: { nurseId, startTime } })
  if (!exists.data) {
    alert('해당 시간에 근무 일정이 없습니다.')
    return
  }
  // 2. 교대근무 신청
  await apiClient.post('/shifts/create', { content: `${month}월 ${day}일 ${time}`, nurseId })
  alert('교대근무 교환 신청이 완료되었습니다.')
  resetForm()
  router.push({ name: 'shift-list' })
}


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

.form-card {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  margin-bottom: 16px;
}

.btn-row {
  gap: 10px;
}

/* .btn {
  min-width: 100px;
} */

.shift-create-page {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Noto Sans KR', sans-serif;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: black; /* 참고본 스타일 적용 */
}

.shift-form {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

/* 참고본의 select 스타일 적용 */
.shift-form select {
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
              -2px -2px 5px rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 11px;
  transition: all 0.2s ease-in-out;
  outline: none;
}


.submit-btn, .cancel-btn {
  height: 32px;
  min-width: 70px;
  background: white;
  border: 1.3px solid #a0adb4;
  font-size: 0.85rem;
  font-weight: normal;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 12px;
  transition: all 0.2s ease-in-out;
  margin-top: 2px;
}
.submit-btn:hover, .cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.2);
  color: white !important;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
</style>
