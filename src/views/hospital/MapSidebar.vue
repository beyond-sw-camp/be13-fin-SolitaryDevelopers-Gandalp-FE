<template>
  <aside class="map-sidebar">
    <!-- 현위치 찾기 버튼 -->
    <div class="location-input">
      <button @click="$emit('locate-me')" :disabled="isLocating">
        <span v-if="isLocating">위치 확인 중</span>
        <span v-else>현재 위치 찾기</span>
      </button>
    </div>

    <!-- 정렬 버튼 -->
    <div class="tab-menu">
      <button
        v-for="option in SORT_OPTIONS"
        :key="option"
        :class="{ active: sortBy === option }"
        @click="$emit('change-sort', option)"
      >
        {{ option === 'DISTANCE' ? '거리순' : '가용 병상 순' }}
      </button>
    </div>

    <!-- 병원 리스트 영역 -->
    <div class="hospital-list-wrapper">
      <!-- 로딩 중 -->
      <div v-if="isLoading" class="loader-container">
        <v-progress-circular
          indeterminate
          color="gray"
          size="36"
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999"
        />
      </div>

      <!-- 로딩 끝났으나 목록이 비어있다면 -->
      <div v-if="!isLoading && hospitals.length === 0" class="loader-container">
        <p class="loader-text">해당 병원이 없습니다</p>
      </div>

      <!-- 실제 병원 목록 -->
      <ul class="hospital-list">
        <li
          v-for="h in pagedHospitals"
          :key="h.id"
          @click="$emit('select-hospital', h)"
        >
          <h5 class="name">{{ h.name }}</h5>
          <p class="addr">
            <img :src="hospitalPinSideUrl" style="width: 17px; height: 15px;" />
            {{ h.address }}
          </p>
          <p class="phone">
            <img
              :src="hospitalPhoneUrl"
              style="width: 15px; height: 15px; margin-right:5px;"
            />
            {{ h.phoneNumber }}
          </p>
          <p class="beds">
            가용 병상 수 {{ h.availableErCount }} / 전체 {{ h.totalErCount }}
          </p>
          <p class="km">
            최단 거리
            <span v-if="Number.isFinite(h.distanceKm)">
              {{ h.distanceKm.toFixed(1) }} km
            </span>
            <span v-else>–</span>
          </p>
          <p class="duration">
            예상 소요 시간
            <span v-if="Number.isFinite(h.durationSec)">
              {{ formatDuration(h.durationSec) }}
            </span>
            <span v-else>–</span>
          </p>
        </li>
      </ul>
    </div>

    <div class="pagination">
      <button
        class="page-btn"
        :disabled="groupIndex === 0"
        @click="prevGroup"
      >
        &laquo;
      </button>

      <button
        class="page-btn"
        :disabled="currentPage === 0"
        @click="$emit('change-page', currentPage - 1)"
      >
        &lt;
      </button>

      <button
        v-for="p in pageNumbers"
        :key="p"
        class="page-btn"
        :class="{ active: currentPage === p }"
        @click="$emit('change-page', p)"
      >
        {{ p + 1 }}
      </button>

      <button
        class="page-btn"
        :disabled="currentPage >= totalPages - 1"
        @click="$emit('change-page', currentPage + 1)"
      >
        &gt;
      </button>

      <button
        class="page-btn"
        :disabled="(groupStart + 10) >= totalPages"
        @click="nextGroup"
      >
        &raquo;
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import hospitalPinSideUrl from '@/api/icons/hospital-pin-red-sidebar.png'
import hospitalPhoneUrl from '@/api/icons/hospital-phone.png'

const SORT_OPTIONS = ['DISTANCE', 'ER_COUNT']

const props = defineProps({
  hospitals: {
    type: Array,
    required: true,
    default: () => []
  },
  totalPages: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  searchKeyword: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true,
    default: false
  },
  isLocating: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['locate-me', 'change-sort', 'select-hospital', 'change-page'])

const groupIndex = computed(() => Math.floor(props.currentPage / 10))

const groupStart = computed(() => groupIndex.value * 10)

const groupEnd = computed(() =>
  Math.min(groupStart.value + 9, props.totalPages - 1)
)

// 화면에 보여줄 페이지 번호를 10개까지만 배열로 생성
const pageNumbers = computed(() => {
  const arr = []
  for (let i = groupStart.value; i <= groupEnd.value; i++) {
    arr.push(i)
  }
  return arr
})

// << 버튼 클릭 시 이전 첫 페이지로 이동
function prevGroup() {
  if (groupIndex.value > 0) {
    const target = (groupIndex.value - 1) * 10
    emit('change-page', target)
  }
}

// >> 버튼 클릭 시 다음 첫 페이지로 이동
function nextGroup() {
  const target = (groupIndex.value + 1) * 10
  if (target < props.totalPages) {
    emit('change-page', target)
  }
}

//0개씩 보여주기
const pagedHospitals = computed(() => {
  const start = props.currentPage * 10
  return props.hospitals.slice(start, start + 10)
})

// 예상 소요 시간(ms → 시:분) 포맷 함수
function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours === 0) {
    return `${Math.ceil(totalSec / 60)} 분`
  }
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return `${hh}시간 ${mm}분`
}
</script>


<style scoped>
.map-sidebar {
  width: 300px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-input {
  display: flex;
  justify-content: center;
}
.location-input button {
  background: #ff6b81;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}
.tab-menu {
  display: flex;
  gap: 8px;
  user-select: none;
}
.tab-menu button {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
}
.tab-menu .active {
  background: #ff6b81;
  color: #fff;
}


.hospital-list-wrapper {
  position: relative;
  flex: 1;
  overflow-y: auto;
}

.loader-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loader-text {
  width: 260px;
  height: 60px;
  margin-top: 8px;
  font-size: 14px;
  color: #888;
  background-color: white;
}

.hospital-list {
  list-style: none;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}
.hospital-list li {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.hospital-list li:hover {
  background: #fafafa;
}
.name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: bold;
}
.addr, .phone {
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}

.km {
  margin: 2px 0;
  font-size: 13px;
  /*color: #4ca58a;*/
  color: #52abef;
}

.duration {
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}

.beds {
  margin: 2px 0;
  font-size: 13px;
  font-weight: bold;
  color : #ff6b81;
}

.phone {
  display: flex;
  align-items: center;
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}

/* Flaticon 아이콘(v-icon)이 렌더링하는 <i> 태그에 적용 */
.phone-icon {
  font-size: 16px;     /* 아이콘 크기 */
  color: #ff4d4f;      /* 아이콘 색상 */
  margin-right: 4px;   /* 번호와 간격 */
}
.phone-icon {
  font-size: 16px !important;
  color: #ff4d4f !important;
  margin-right: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  margin-top: 12px;
}

.page-btn {
  padding: 3px 5px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 1px;
  font-size: 14px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.page-btn.active {
  background: #ff6b81;
  color: white;
  border-color: #ff6b81;
}
</style>
