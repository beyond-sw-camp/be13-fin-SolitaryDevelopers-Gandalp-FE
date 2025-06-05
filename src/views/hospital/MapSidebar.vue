<template>
  <aside class="map-sidebar">
    <!-- 현위치 찾기 버튼 -->
      <div class="location-input">
        <button @click="$emit('locate-me')" :disabled="isLocating">
          <span v-if="isLocating">위치 확인 중</span>
          <span v-else>현재 위치 찾기</span>
        </button>
      </div>

    <!-- 정렬 버튼 ( 부모로 데이터, 이벤트 전달 ) -->
    <div class="tab-menu">
      <button
        v-for="option in SORT_OPTIONS"
        :key="option"
        :class="{ active: sortBy === option }"
        @click="$emit('change-sort', option)"
      >
        {{option === 'DISTANCE' ? '거리순': '가용 병상 순'}}
      </button>
    </div>

    <div class="hospital-list-wrapper">
      <!--  로딩 중 -->
      <div v-if="isLoading" class="loader-container">
        <v-progress-circular
          indeterminate
          color="gray"
          size="36"
          style=" position: absolute; top: 50%; transform: translate(-50%, -50%); z-index: 9999" />
     <!-- <p class="loader-text">데이터를 불러오고 있습니다...</p>-->
      </div>

      <!-- 로딩 끝났으나 hospitals 배열이 비어있다면 -->
      <div v-if="!isLoading && hospitals.length === 0" class="loader-container">
        <p class="loader-text">해당 병원이 없습니다</p>
      </div>

    <!-- 병원 리스트 props.hospitals에서 가져옴 -->
    <ul class="hospital-list">
      <li
        v-for="h in pagedHospitals"
        :key="h.id"
        @click="$emit('select-hospital', h)"
      >
        <h5 class="name">{{ h.name }}</h5>
        <p class="addr">
          <img :src="hospitalPinSideUrl" style="width: 17px; height: 15px;"/>
          {{ h.address }}</p>
        <p class="phone">
          <img :src="hospitalPhoneUrl" style="width: 14px; height: 14px; margin-right:5px;"/>
          {{ h.phoneNumber }}</p>
        <p class="beds"> 가용 병상 수 {{ h.availableErCount }} / 전체 {{ h.totalErCount }}</p>
      <!--   NaN인 경우 - 대기 표시 -->
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
        :disabled="currentPage === 0"
        @click="$emit('change-page', currentPage -1)"
      >
        &lt;
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: currentPage === p - 1 }"
        @click="$emit('change-page', p - 1)"
      >{{ p }}</button>

      <button
        class="page-btn"
        :disabled="currentPage >= totalPages - 1"
        @click="$emit('change-page', currentPage + 1)"
      >&gt;</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import hospitalPinSideUrl from '@/api/icons/hospital-pin-red-sidebar.png'
import hospitalPhoneUrl from '@/api/icons/hospital-phone.png'

const SORT_OPTIONS = ['DISTANCE', 'ER_COUNT']

// props
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
  isLocating: { // 현재 위치 조회 중인지 부모에서 전달받음
    type: Boolean,
    required: true,
    default: false
  }
})

const isSearching = computed(() => props.searchKeyword.trim().length > 0)

// 페이징 처리
const pagedHospitals = computed(() => {
  // sortBy, hospitals.length로 slice
  const start = props.currentPage * 10
  return props.hospitals.slice(start, start + 10)
})

// 소요 시간 포맷
function formatDuration(ms) {
  const totalSec = Math.round(ms/1000)
  const hours = Math.floor(totalSec / 3600)
  const minutse = Math.floor((totalSec % 3600)/ 60)

  if(hours === 0) {
    // 1시간 이하
    return `${Math.ceil(totalSec / 60)} 분`
  }

  const hh = String(hours).padStart(2,'0' )
  const mm = String(minutse).padStart(2,'0' )

  return `${hh}시간 ${mm}분`
}

defineEmits(['locate-me', ' search', 'change-sort', 'select-hospital', 'change-page'])

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
