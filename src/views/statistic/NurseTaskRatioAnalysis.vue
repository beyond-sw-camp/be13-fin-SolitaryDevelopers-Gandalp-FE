<template>
  <div class="page-container">

    <!-- 1) 필터 카드 -->
    <div class="filter-card">
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
        <button type="submit" class="btn">조회</button>
      </form>
    </div>

    <!-- 2) 범례 (한 번만) -->
    <div class="legend-wrapper">
      <span class="legend-item"><span class="dot work"></span>근무</span>
      <span class="legend-item"><span class="dot surgery"></span>수술</span>
      <span class="legend-item"><span class="dot off"></span>오프</span>
    </div>

    <!-- 3) 파이 차트 리스트 -->
    <div class="chart-list">
      <div
        v-for="stat in statistics"
        :key="stat.nurseId"
        class="chart-item"
      >
        <canvas :ref="el => canvasMap.set(stat.nurseId, el)"></canvas>
        <h3 class="nurse-name">{{ stat.nurseName }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import apiClient from '@/api/axios'
import { Chart, PieController, ArcElement, Tooltip } from 'chart.js'
Chart.register(PieController, ArcElement, Tooltip)

const now = new Date()
const defaultYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth()

const selectOption = ref('MONTH')
const year         = ref(defaultYear)
const month        = ref(defaultMonth)
const quarter      = ref(1)

const statistics   = ref([])
const canvasMap    = new Map()
const chartMap     = new Map()

async function loadStatistics() {
  const params = {
    selectOption: selectOption.value,
    year:         year.value,
    month:        selectOption.value==='MONTH'   ? month.value   : null,
    quarter:      selectOption.value==='QUARTER'? quarter.value : null
  }
  const res = await apiClient.post('/schedules/status/working', params)
  statistics.value = res.data

  // 차트 갱신
  statistics.value.forEach(stat => {
    const ctx = canvasMap.get(stat.nurseId)
    if (!ctx) return
    if (chartMap.get(stat.nurseId)) chartMap.get(stat.nurseId).destroy()

    const workCount    = stat.dayCount + stat.eveningCount + stat.nightCount
    const surgeryCount = stat.surgeryCount
    const offCount     = stat.offCount
    const data = [workCount, surgeryCount, offCount]

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['근무','수술','오프'],
        datasets: [{
          data,
          backgroundColor: ['#82D173','#A5D8FF','#E0E0E0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label(ctx) {
                const val = ctx.parsed
                const total = data.reduce((a,b)=>a+b,0)
                const pct = total?Math.round(val/total*100):0
                return `${ctx.label} ${pct}%`
              }
            }
          }
        }
      }
    })
    chartMap.set(stat.nurseId, chart)
  })
}

onMounted(loadStatistics)

watch([selectOption, year, month, quarter], loadStatistics, { immediate: true })
</script>

<style scoped>
.page-container {
  padding: 0 24px 40px;
}

/* ─── 1) 필터 카드 ───────────────────────────────── */
.filter-card {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}
.filter-form {
  display: flex;
  gap: 12px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.filter-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.filter-group label {
  margin-bottom: 4px;
}
.filter-group input,
.filter-group select {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.btn {
  height: 36px;
  padding: 0 16px;
  background: #377dff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* ─── 2) 범례 (한 번만) ───────────────────────────── */
.legend-wrapper {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.work    { background: #82D173; }
.dot.surgery { background: #A5D8FF; }
.dot.off     { background: #E0E0E0; }

/* ─── 3) 차트 리스트 ───────────────────────────────── */
.chart-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 24px;
}
.chart-item {
  flex: 0 0 240px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
}
.chart-item canvas {
  width: 100% !important;
  height: 200px !important;
}
.nurse-name {
  margin-top: 12px;
  font-size: 16px;
  color: #333;
}
</style>
