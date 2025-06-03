<template>
  <div class="work-management-page">
    <h2 class="title">근무 관리</h2>
    <v-card style="width: 75.5vw; background-color: white; padding: 2%; border-radius: 25px;">
<v-row justify="flex-end">
  <v-col class="text-end">
    <v-btn class="me-2" size="small" variant="tonal" color="primary" @click="onClickGenerate" :disabled="isLoading">자동 생성</v-btn>
    <v-btn class="me-2" size="small" variant="tonal" color="primary" @click="goCal" :disabled="isLoading">캘린더로가기</v-btn>
    <v-btn class="mx-2" size="small" variant="tonal" color="warning" @click="modify" :disabled="isLoading">근무 수정</v-btn>
    <v-btn class="ms-2" size="small" variant="tonal" color="success" @click="goToCreateShift" :disabled="isLoading">근무 반영</v-btn>
  </v-col>
</v-row>
      <vue-cal
        :key="eventKey"
        ref="vueCalRef"
        :views="{ month: { label: '월간' } }"
        view="month"
        locale="ko"
        :editable-events="false"
        :events-on-month-view="true"
        :events="workEvents"
        @cell-click="onCellClick"
        style="min-height: 80vh; height: auto;"
      >
        <template #event-content="{ event }">
          <div :class="event.class">{{ event.title }}</div>
        </template>
      </vue-cal>


    </v-card>

    <EditWorkModal
      v-if="showEditModal"
      :work="selectedWork"
      @close="showEditModal = false"
      @save="handleWorkUpdate"
    />

    <!-- ✅ 로딩 오버레이 -->
    <v-overlay :model-value="isLoading" persistent class="d-flex align-center justify-center" style="z-index: 9999; pointer-events: all;">
      <v-card style="padding: 20px; font-size: 16px; font-weight: bold; text-align: center; pointer-events: none;">
        ⏳ 잠시만 기다려 주세요...
      </v-card>
    </v-overlay>
  </div>
</template>
  
<script setup>
import { VueCal } from '@/vue-cal'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import EditWorkModal from '@/components/common/EditWorkModal.vue'

const router = useRouter()
const selectedDate = ref(null)
const selectedWork = ref([])
const showEditModal = ref(false)
const vueCalRef = ref(null)
const eventKey = ref(0)
const isLoading = ref(false) // ✅ 로딩 상태 추가
const generatedWorkIds = ref([]) // ✅ 생성된 workTempId 저장용

const workEvents = ref([])

function onCellClick({ cell }) {
  selectedDate.value = cell.start
}

const goCal = async () => {
  router.push('/calendar');
}

const onClickGenerate = async () => {
  isLoading.value = true // ✅ 로딩 시작
  try {
    const { data } = await apiClient.post('/gpt/generate-and-create')
    console.log('🗓️ 생성된 근무표:', data)
        // ✅ ID들만 따로 저장
    await loadWorkSchedules()
  } catch (err) {
    alert('생성 실패: ' + (err.response?.data || err.message))
  } finally {
    isLoading.value = false // ✅ 로딩 끝
  }
}
const goToCreateShift = async () => {
  if (!generatedWorkIds.value.length) {
    alert('자동 생성 후에만 반영할 수 있어요!')
    return
  }

  isLoading.value = true
  try {
    const { data } = await apiClient.post('/schedules/accept-works', generatedWorkIds.value)
    console.log('✅ 반영된 근무:', data)

    alert('근무 반영 완료!')
    generatedWorkIds.value = [] // ✅ 반영 후 초기화
    await loadWorkSchedules()
  } catch (err) {
    alert('근무 반영 실패: ' + (err.response?.data || err.message))
  } finally {
    isLoading.value = false
    router.push('/calendar');
  }
}

const getShiftType = (startDate, endDate) => {
  const startHour = startDate.getHours()
  const endHour = endDate.getHours()
  if (startHour === 6 && endHour === 14) return '데이'
  if (startHour === 14 && endHour === 22) return '이브닝'
  if (startHour === 22 && (endHour === 6 || endHour === 5)) return '나이트'
  return '기타'
}

const loadWorkSchedules = async () => {
  try {
    const { data } = await apiClient.get('/schedules/temp')
    workEvents.value = data.map(item => {
      const start = new Date(item.startTime)
      const end = new Date(item.endTime)
      const shift = getShiftType(start, end)
      const workTempId = item.workTempId

      generatedWorkIds.value.push(workTempId)

      let eventClass = ''
      if (shift === '데이') eventClass = 'shift-day'
      else if (shift === '이브닝') eventClass = 'shift-evening'
      else if (shift === '나이트') eventClass = 'shift-night'

      return {
        workTempId,
        start,
        end,
        title: `${shift} - ${item.nurseName}`,
        class: eventClass
      }
    })
  } catch (e) {
    alert('근무 일정 불러오기 실패: ' + (e.response?.data || e.message))
  }
}

onMounted(async () => {
  await loadWorkSchedules()
})

const modify = () => {
  if (!selectedDate.value) {
    alert('날짜를 먼저 선택해주세요!')
    return
  }

  const matched = workEvents.value.filter(event =>
    new Date(event.start).toDateString() === new Date(selectedDate.value).toDateString()
  )

  if (!matched.length) {
    alert('선택한 날짜에 근무가 없습니다!')
    return
  }

  selectedWork.value = matched
  showEditModal.value = true
}

const handleWorkUpdate = (updatedWork) => {
  const index = workEvents.value.findIndex(e => e.workTempId === updatedWork.workTempId)
  if (index !== -1) {
    const shift = getShiftType(new Date(updatedWork.startTime), new Date(updatedWork.endTime))
    let eventClass = ''
    if (shift === '데이') eventClass = 'shift-day'
    else if (shift === '이브닝') eventClass = 'shift-evening'
    else if (shift === '나이트') eventClass = 'shift-night'

    const updatedEvent = {
      ...workEvents.value[index],
      title: `${shift} - ${updatedWork.nurseName}`,
      class: eventClass
    }

    workEvents.value = [
      ...workEvents.value.slice(0, index),
      updatedEvent,
      ...workEvents.value.slice(index + 1)
    ]
    eventKey.value++
  }

  showEditModal.value = false
}
</script>

  
  <style scoped>
  .title {
    color: black;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 5px;
  }

  ::v-deep(.vuecal__event.shift-day) {
  background-color: #f5e0e4; /* 빨간색 */
  color: #c06374;
  font-weight: bold;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 6px;
  border: none;
  margin: 5px;
    display: inline-block;
  width: auto; /* 또는 max-content도 가능 */
  max-width: 100%;

  
  /* ✅ 핵심 설정 */
  max-width: 80%;         /* 최대 너비 제한 */
  white-space: normal;      /* 줄바꿈 허용 */
  word-break: break-word;   /* 단어 중간에서도 줄바꿈 허용 */
  overflow-wrap: break-word;
}

::v-deep(.vuecal__event.shift-evening) {
  background-color: #e3ecf7; /* 파란색 */
  color: #6c9dd6;
  font-weight: bold;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 6px;
  border: none;
  margin: 5px;
      display: inline-block;
  width: auto; /* 또는 max-content도 가능 */

  
  /* ✅ 핵심 설정 */
  max-width: 80%;          /* 최대 너비 제한 */
  white-space: normal;      /* 줄바꿈 허용 */
  word-break: break-word;   /* 단어 중간에서도 줄바꿈 허용 */
  overflow-wrap: break-word;
}



::v-deep(.vuecal__event.shift-night) {
  background-color: #e9f5ea; /* 초록색 */
  color: #4eb053;
  font-weight: bold;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 6px;
  border: none;
  margin: 5px;
      display: inline-block;
  width: auto; /* 또는 max-content도 가능 */

  
  /* ✅ 핵심 설정 */
  max-width: 80%;         /* 최대 너비 제한 */
  white-space: normal;      /* 줄바꿈 허용 */
  word-break: break-word;   /* 단어 중간에서도 줄바꿈 허용 */
  overflow-wrap: break-word;
}

.v-col {
  height: 70px;
}

.work-management-page {
    padding: 24px;
    border-radius: 10px;
    font-family: 'Noto Sans KR', sans-serif;
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