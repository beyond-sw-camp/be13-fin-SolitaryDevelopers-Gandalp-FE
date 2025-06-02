<template>
  <div class="page-container">
    <!-- 탭 네비게이션 슬롯 -->
    <slot name="tabs"></slot>

    <h1 class="page-title">간호사 근무 통계</h1>

    <!-- 필터 카드 -->
    <form class="filter-form" @submit.prevent="loadStatistics">
      <div class="filter-group">
        <label for="year">년도</label>
        <input id="year" type="number" v-model.number="year" min="2000" max="2099" />
      </div>
      <div class="filter-group">
        <label for="opt">옵션</label>
        <select id="opt" v-model="selectOption">
          <option value="MONTH">월별</option>
          <option value="QUARTER">분기별</option>
          <option value="YEAR">연도별</option>
        </select>
      </div>
      <div class="filter-group" v-if="selectOption==='MONTH'">
        <label for="month">월</label>
        <input id="month" type="number" v-model.number="month" min="1" max="12" />
      </div>
      <div class="filter-group" v-if="selectOption==='QUARTER'">
        <label for="quarter">분기</label>
        <input id="quarter" type="number" v-model.number="quarter" min="1" max="4" />
      </div>
      <div class="filter-group status-group">
        <label>상태</label>
        <div class="radios">
          <input type="radio" id="st-on" value="ON" v-model="status" />
          <label for="st-on">근무</label>
          <input type="radio" id="st-sur" value="IN_SURGERY" v-model="status" />
          <label for="st-sur">수술</label>
          <input type="radio" id="st-off" value="OFF" v-model="status" />
          <label for="st-off">오프</label>
        </div>
      </div>
    </form>

    <!-- 차트+테이블 카드 -->
    <div class="chart-container">
      <div v-if="loading" class="overlay">
        <div class="spinner">로딩 중...</div>
      </div>

      <!-- 차트 -->
      <div class="chart-area">
        <NurseStatisticsChart :dataList="statistics" :status="status" />
      </div>

      <!-- 테이블 -->
      <div class="table-area">
        <table class="stats-table">
          <thead>
          <tr>
              <th>간호사</th>
              <!-- ON 상태일 때 -->
              <th v-if="status === 'ON'">Day</th>
              <th v-if="status === 'ON'">Evening</th>
              <th v-if="status === 'ON'">Night</th>
              <!-- IN_SURGERY 상태일 때 -->
              <th v-else-if="status === 'IN_SURGERY'">Surgery</th>
              <!-- OFF 상태일 때 -->
              <th v-else-if="status === 'OFF'">Off</th>
            </tr>
            </thead>
          <tbody>

          <tr v-for="stat in statistics" :key="stat.nurseId">
            <td>{{ stat.nurseName }}</td>

            <!-- ON: Day, Evening, Night -->
            <template v-if="status === 'ON'">
              <td>{{ stat.dayCount }}</td>
              <td>{{ stat.eveningCount }}</td>
              <td>{{ stat.nightCount }}</td>
            </template>

            <!-- IN_SURGERY: Surgery only -->
            <template v-else-if="status === 'IN_SURGERY'">
              <td>{{ stat.surgeryCount }}</td>
            </template>

            <!-- OFF: Off only -->
            <template v-else-if="status === 'OFF'">
              <td>{{ stat.offCount }}</td>
            </template>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import apiClient from '@/api/axios'
import NurseStatisticsChart from './NurseStatisticsChart.vue'

// “지난 달” 기본값 계산
const now = new Date()
// 현재가 1월이면 지난 달 = 작년 12월, 그렇지 않으면 getMonth() (0=1월,…) 그대로
const defaultYear  = now.getMonth() === 0
  ? now.getFullYear() - 1
  : now.getFullYear()
const defaultMonth = now.getMonth() === 0
  ? 12
  : now.getMonth()         // getMonth(): 0=1월,1=2월,… → 지난 달

const selectOption = ref('MONTH')
const year         = ref(defaultYear)
const month        = ref(defaultMonth)
const quarter      = ref(1)
const status       = ref('ON')
const statistics   = ref([])
const loading      = ref(false)

// ─── 2) 실제 호출 시 아무 옵션 없으면 지난 달, 있으면 그대로 전달 ────────
async function loadStatistics() {
  loading.value = true
  statistics.value = []
  try {
    const params = {
      status:       status.value || null,
      selectOption: selectOption.value,
      year:         year.value,
      month:        selectOption.value === 'MONTH'   ? month.value   : null,
      quarter:      selectOption.value === 'QUARTER'? quarter.value: null
    }
    const res = await apiClient.post('/schedules/status/working', params)
    statistics.value = res.data
  } catch (e) {
    console.error(e)
    // alert('통계 조회 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 3) 마운트 시 자동 로드
onMounted(loadStatistics)

watch([selectOption, year, month, quarter, status], () => {
  loadStatistics()
})

</script>

<style scoped>


.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  max-width: 1200px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.filter-group label {
  margin-bottom: 6px;
  font-weight: 500;
}

.filter-group input[type="number"],
.filter-group select {
  width: 100px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.status-group .radios {
  display: flex;
  gap: 12px;
}

.status-group input[type="radio"] {
  display: none;
}

.status-group label {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.status-group input:checked + label {
  background: #377dff;
  border-color: #377dff;
  color: #fff;
}

.chart-container {
  position: relative;
  margin: 0 auto;
  max-width: 1200px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: grid;
  grid-template-rows: auto auto;
  gap: 24px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  font-size: 1.2rem;
  color: #666;
}

.chart-area {
  width: 100%;
  height: 500px;
}

.table-area {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}


</style>
