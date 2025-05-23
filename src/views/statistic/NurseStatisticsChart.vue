<template>
  <div class="chart-wrapper">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  dataList: { type: Array, default: () => [] },
  status:   { type: String, default: 'ON' }    // ON / IN_SURGERY / OFF
})

const canvas = ref(null)
let chartInstance = null

function renderChart() {
  if (chartInstance) chartInstance.destroy()

  const labels = props.dataList.map(d => d.nurseName)
  const dayData     = props.dataList.map(d => d.dayCount)
  const eveningData = props.dataList.map(d => d.eveningCount)
  const nightData   = props.dataList.map(d => d.nightCount)
  const surgeryData = props.dataList.map(d => d.surgeryCount)
  const offData     = props.dataList.map(d => d.offCount)

  // 최대값 계산
  // 각 간호사의 스택 합계를 구함
  const stackSums = labels.map((_, i) => {
       if (props.status === 'ON') {
         return dayData[i] + eveningData[i] + nightData[i]
       } else if (props.status === 'IN_SURGERY') {
         return surgeryData[i]
       } else {
         return offData[i]
       }
  })
  const maxVal = Math.max(...stackSums, 0)
  // 10단위 올림 + 10
  const step    = 10
  const rounded = Math.ceil(maxVal / step) * step    // ex: 59 → 60
  const yMax    = rounded + step                     // → 70
  // status 에 따라 datasets 구성
  const thin = 40
  let datasets = []
  if (props.status === 'ON') {
    datasets = [
      { label: 'Day',     data: dayData,     backgroundColor: '#82D173', borderRadius: 4, barThickness: thin },
      { label: 'Evening', data: eveningData, backgroundColor: '#FFC107', borderRadius: 4, barThickness: thin },
      { label: 'Night',   data: nightData,   backgroundColor: '#4A90E2', borderRadius: 4, barThickness: thin }
    ]
  }
  else if (props.status === 'IN_SURGERY') {
    datasets = [
      { label: 'Surgery', data: surgeryData, backgroundColor: '#A5D8FF', borderRadius: 4, barThickness: thin }
    ]
  }
  else {
    datasets = [
      { label: 'Off', data: offData, backgroundColor: '#E0E0E0', borderRadius: 4, barThickness: thin }
    ]
  }

  // 캔버스 최소 너비 계산 & 적용
  // 한 그룹당 너비: barThickness + 추가 여백(약 20px)
  const groupWidth = thin + 20                            // ← 그룹당 총 너비
  const minGroups  = 5                                    // ← 최소 5명
  const groups     = labels.length                        // ← 실제 간호사 수
  const width      = Math.max(minGroups * groupWidth,     // ← 5명이 안 되면 5*groupWidth,
    groups * groupWidth)        //    그 이상이면 labels.length*groupWidth
  canvas.value.style.minWidth = `${width}px`

  // 차트 생성
  chartInstance = new Chart(canvas.value, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          stacked: true,
          categoryPercentage: 0.05,
          barPercentage: 0.6,
          grid: { display: false },
          ticks: { color: '#333' }
        },
        y: {
          stacked: true,
          min: 0,
          max: yMax,
          ticks: {
            stepSize: step,
            color: '#999'
          },
          grid: {
            color: '#F5F5F5',
            borderDash: [3, 3]
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, padding: 16, color: '#666' }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#333',
          bodyColor: '#555',
          borderColor: '#ddd',
          borderWidth: 1
        }
      }
    }
  })
}

onMounted(renderChart)
watch([() => props.dataList, () => props.status], renderChart)
</script>

<style scoped>
.chart-wrapper {
  margin: 0 auto;
  max-width: 1200px;
  height: 500px;
  overflow-x: auto;
}
.chart-wrapper canvas {
  height: 100% !important;
}
</style>
