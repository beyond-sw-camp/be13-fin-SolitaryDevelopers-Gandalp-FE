<template>
  <div class="page-container">
    <div class="card">
    <h2>응급실 병상 통계</h2>
    <div class="filter">
      <input type="number" v-model.number="year" />년
      <input type="number" v-model.number="month" />월
      <button @click="loadData">조회</button>
    </div>
      <div class="chart-area">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, PieController, ArcElement, Tooltip } from 'chart.js'
import apiClient from '@/api/axios'

Chart.register(PieController, ArcElement, Tooltip)

const year  = ref(new Date().getFullYear())
const month = ref(new Date().getMonth()+1)
const chartCanvas = ref(null)
let chartInstance = null

async function loadData() {
  const res = await apiClient.get('/api/v1/statistics/er-bed', { params:
      {
        year: year.value,
        month: month.value }
  })
  const data = res.data
  const labels = data.map(d => d.ward)
  const occupied = data.map(d => d.occupied)
  const free     = data.map(d => d.total - d.occupied)

  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartCanvas.value, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        { label:'Occupied', data: occupied },
        { label:'Free',     data: free     }
      ]
    },
    options: { responsive:true }
  })
}

onMounted(loadData)
</script>

<style scoped>
 .page-container { padding: 0 24px; }
 .card {
   margin: 0 auto;
   max-width: 1200px;
   background: #fff;
   border-radius: 12px;
   padding: 24px;
   box-shadow: 0 4px 12px rgba(0,0,0,0.05);
 }
.chart-area {
  height: 500px;
}
canvas { width:100%; height:100% !important; }
</style>

