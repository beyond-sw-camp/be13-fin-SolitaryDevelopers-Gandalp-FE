<template>
    <vue-cal
      :views="{ month: { label: '월간' } }"
      view="month"
      locale="ko"
      v-model:selected-date="selectedDate"
      :events="[]"
      @cell-click="onCellClick"
      style="height: 600px"
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
  </template>
  
  <script setup>
  import { VueCal } from '@/vue-cal'
  import { ref } from 'vue'
  
  const selectedDate = ref(null)
  
  function onCellClick({ cell }) {
    console.log('셀 정보:', cell);
    selectedDate.value = cell.start;
  }
  
  function isSelected(date) {
    return selectedDate.value &&
      new Date(selectedDate.value).toDateString() === new Date(date).toDateString()
  }
  </script>
  
  <style scoped>
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
  </style>
  