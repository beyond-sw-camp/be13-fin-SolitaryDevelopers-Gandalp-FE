<template>
  <div class="page-container">

    <!-- 2) 기간 선택 -->
    <div class="filter-bar">
      <div class="period-select">
        <button
          v-for="p in periods"
          :key="p.value"
          :class="{ active: period === p.value }"
          @click="period = p.value"
        >{{ p.label }}</button>
      </div>
      <div class="date-inputs">
        <input v-model.number="year"  type="number" placeholder="YYYY" />
        <input v-if="period !== 'YEAR'" v-model.number="month" type="number" placeholder="MM" />
        <input v-if="period === 'DAY'"    v-model.number="day"   type="number" placeholder="DD" />
        <button class="btn" @click="loadData">조회</button>
      </div>
    </div>

    <!-- 3) 카드 + 차트 -->
    <div class="card">
      <h2 class="card-title">응급실 병상 시간대별 사용 통계</h2>
      <div class="chart-area">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import apiClient from '@/api/axios'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip)

const tabs    = ['응급실 병상 통계', '간호사 근무 분석', '간호사별 업무 비율 분석']
const activeTab = ref(tabs[0])

const periods = [
  { label: '일', value: 'DAY' },
  { label: '월', value: 'MONTH' },
  { label: '연', value: 'YEAR' }
]
const period = ref('DAY')

const year  = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const day   = ref(new Date().getDate())

const chartCanvas  = ref(null)
let   chartInstance = null

async function loadData() {
  // API 경로·파라미터는 실제 엔드포인트에 맞춰 조정하세요.
  const params = { period: period.value, year: year.value }
  if (period.value !== 'YEAR')  params.month = month.value
  if (period.value === 'DAY')   params.day   = day.value

  const res = await apiClient.post('/hospitals/inspect', {
    erOption: period.value,
    year: year.value,
    ...(period.value !== 'YEAR' && {month: month.value}),
    ...(period.value === 'DAY' && {day: day.value})
  })
  // 예시 응답: [ { hour:0, count: 30 }, { hour:3, count:50 }, ... ]
  const rawData = res.data
  
  // 1. period에 따라 label 및 빈 데이터 생성
  let fullData = []
  let labels = []

  if(period.value === 'DAY' ){
    fullData = Array.from({length: 24}, (_,hour) => ({hour, count: 0}))
    labels = fullData.map(d => `${d.hour}시`)
    rawData.forEach(d => {

      const match = fullData.find(f => f.hour === d.hour)
      if(match) match.count = d.count
    })
  }else if(period.value === 'MONTH'){
    const lastDay = new Date(year.value, month.value, 0).getDate()
    fullData = Array.from({ length: lastDay }, (_, i) => ({ day: i + 1, count: 0 }))
    labels = fullData.map(d => `${d.day}일`)
    
    rawData.forEach(d => {
      const match = fullData.find(f => f.day === d.day)
      if (match) match.count = d.count
    })
  } else if (period.value === 'YEAR') {
    fullData = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }))
    labels = fullData.map(d => `${d.month}월`)
    
    rawData.forEach(d => {
      const match = fullData.find(f => f.month === d.month)
      if (match) match.count = d.count
    })
  }
  

  const counts = fullData.map(d => d.count)

  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '사용량',
        data: counts,
        fill: false,
        tension: 0.3,
        borderColor: 'red',         // 🔴 선 색상
        backgroundColor: 'red',     // 🔴 포인트(점) 색상
        pointBorderColor: 'red',
        pointBackgroundColor: 'red',
        borderWidth: 1 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: sans-serif;
}

/* 1) 탭 네비게이션 */
.tabs {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 16px;
}
.tabs button {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
}
.tabs button.active {
  color: #333;
  border-bottom: 2px solid #377dff;
}

/* 2) 필터 바 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.period-select {
  display: flex;
  gap: 8px;
}
.period-select button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
}
.period-select button.active {
  background: #377dff;
  color: white;
  border-color: #377dff;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-inputs input {
  width: 60px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}
.date-inputs .btn {
  padding: 6px 16px;
  background: #377dff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 3) 카드 + 차트 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.card-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.chart-area {
  position: relative;
  height: 400px;
}
</style>