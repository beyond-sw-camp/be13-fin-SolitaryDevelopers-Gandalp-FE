<template>
  <v-container class="main-wrapper">
    <v-row justify="space-between">
      <v-col class="text-end">
        <v-btn class="custom-btn" @click="createOff">오프 신청</v-btn>
      </v-col>
    </v-row>
    
    <vue-cal
      :views="{ month: { label: '월간' } }"
      view="month"
      locale="ko"
      v-model:selected-date="selectedDate"
      :events="[]"
      @cell-click="onCellClick"
      style="height: 550px"
    >
      <!-- 날짜 셀 커스텀 -->
      <template #cell-date="{ cell }">
        <div class="cell-date-wrapper">
          <!-- 선택된 날짜면 ✔ 표시, 아니면 날짜 숫자 표시 -->
          <span
            class="day-circle"
            :class="{ selected: isSelected(cell.start) }"
          >
            {{ isSelected(cell.start) ? '✔' : cell.start.getDate() }}
          </span>
        </div>
      </template>
    </vue-cal>
  </v-container>
    <!-- 사용자 확인 모달 -->
    <UserCheckModalV2
      v-if="showModal"
      @close="showModal = false"
      @submit="handleSubmit"
    />
  </template>
  
  <script setup>
  import { VueCal } from '@/vue-cal'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import UserCheckModalV2 from '@/components/UserCheckModalV2.vue'
  import apiClient from '@/api/axios'

  const router = useRouter()

  const showModal = ref(false)
  const nurseInfo = ref(null)

  const createOff = () => {
    if (!selectedDate.value) {
    alert('날짜를 먼저 선택해주세요!')
    return
  }
    showModal.value = true
  }

  const handleSubmit = async ({ email, password }) => {
    try {
      const res = await apiClient.post('schedules/check', null, {
        params: { email, password }
      })
      
      console.log('👉 요청 성공:', res)
      console.log('👉 응답 데이터:', res.data)
      
      nurseInfo.value = res.data
      showModal.value = false
      
      console.log(nurseInfo.value);
      
      
      await createOffSchedule()
    } catch (err) {
      alert('계정 확인 실패: ' + err.response?.data || err.message)
    }
  }

  const createOffSchedule = async () => {
  try {
    const selected = new Date(selectedDate.value)

const startTime = new Date(
  selected.getFullYear(),
  selected.getMonth(),
  selected.getDate(),
  0, 0, 0
)

const endTime = new Date(
  selected.getFullYear(),
  selected.getMonth(),
  selected.getDate(),
  23, 59, 59
)

const requestDto = {
  email: nurseInfo.value.email,
  content: '오프 신청',
  startTime: formatKST(startTime),
  endTime: formatKST(endTime),
}
    console.log('🕒 요청 DTO:', requestDto)

    const res = await apiClient.post('schedules/off', requestDto)
    alert('오프 신청 완료!')
  } catch (err) {
    alert('오프 신청 실패: ' + (err.response?.data || err.message))
  }
}

const pad = (n) => String(n).padStart(2, '0')

const formatKST = (date) => {
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const HH = pad(date.getHours())
  const MM = pad(date.getMinutes())
  const SS = pad(date.getSeconds())
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`
}
  const selectedDate = ref(null)
  
  function onCellClick({ cell }) {
    selectedDate.value = cell.start
    console.log('선택한 날짜:', selectedDate.value)
  }
  
  function isSelected(date) {
    return selectedDate.value &&
      new Date(selectedDate.value).toDateString() === new Date(date).toDateString()
  }
  </script>
  
  <style scoped>

.v-col {
  height: 70px;
}

.main-wrapper {
  margin: 0 auto;
  padding: 0px 100px !important;
}

  .custom-btn {
    padding: 4px 8px !important;
    font-size: 12px;
    min-height: 32px !important;
    /* background: linear-gradient(to right, #8d8f91 0%, #828486 100%) !important; */
    background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%) !important;
  }

  .cell-date-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* 공통 동그라미 스타일 */
  .day-circle {
    width: 42px;
    height: 42px;
    /* border-radius: 50%; */
    display: flex;
    align-items: center;
    justify-content: center;
    /* font-size: 10px; */
    /* font-weight: bold; */
    color: black;
  }
  
  /* 선택된 날짜일 때 스타일 */
  .day-circle.selected {
    background-color: #42d1a9;
    color: white;
    font-size: 20px;
  }

  .create-off{
  width: 6%;
  height: 36px;
  margin-top: 10px;
  margin-left: 94%;
  background: linear-gradient(to right, #ADDDF9 0%, #C2EBFF 100%);
  border: none;
  color: #000;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 8px;
  transition: all 0.2s ease-in-out;
}
.create-off:hover {
  background: linear-gradient(to right, #8CCEF0 0%, #A0E4FF 100%);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
}

  </style>