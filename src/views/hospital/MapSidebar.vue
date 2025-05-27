<!-- src/components/MapSidebar.vue -->
<template>
  <aside class="map-sidebar">
    <!-- 현위치 찾기 버튼 -->

      <div class="location-input">
        <button @click="locateMe">현재 위치 찾기</button>
      </div>



    <!-- 정렬 탭 -->
    <div class="tab-menu">
      <button
        :class="{ active: sortBy === 'DISTANCE' }"
        @click="changeSort('DISTANCE')"
      >거리순</button>
      <button
        :class="{ active: sortBy === 'ER_COUNT' }"
        @click="changeSort('ER_COUNT')"
      >가용 병상 순</button>
    </div>

    <!-- 병원 리스트 -->
    <ul class="hospital-list">
      <li
        v-for="h in sortedHospitals"
        :key="h.id"
        @click="$emit('select-hospital', h)"
      >
        <h5 class="name">{{ h.name }}</h5>
        <p class="addr">📍 {{ h.address }}</p>
        <p class="phone">📞 {{ h.phoneNumber }}</p>
        <p class="beds"> 가용 병상 수 {{ h.availableErCount }} / 전체 {{ h.totalErCount }}</p>
      </li>
    </ul>


    <div class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 0"
        @click="prevPage"
      >&lt;</button>

      <button
        v-for="p in totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: currentPage === p - 1 }"
        @click="changePage(p - 1)"
      >{{ p }}</button>

      <button
        class="page-btn"
        :disabled="currentPage >= totalPages - 1"
        @click="nextPage"
      >&gt;</button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import apiClient from '@/api/axios'
import { Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'


const stompClient = ref(null)


const emit = defineEmits(['select-hospital', 'find-location'])

// 정렬 옵션
const SORT_OPTIONS = ['DISTANCE', 'ER_COUNT']

const hospitals = ref([])
const sortBy = ref('DISTANCE')
const position = ref({ lat: null, lon: null })
const totalPages = ref(0)
const currentPage = ref(0)
const pageSize = ref(10)
const searchKeyword = ref('') // 검색어 관리

// 위치가 정해지면 API 호출
watch(
  [() => position.value.lat, () => position.value.lon, () => sortBy.value, () => searchKeyword.value],
  ([lat, lon]) => {
    if(lat != null && lon != null) {
      fetchHospitals()
    }
  }
)

onMounted(() => {
  connectWebSocket()
  locateMe()
})





const connectWebSocket = () => {
  const socket = new SockJS('http://localhost:8080/connect')
  stompClient.value = Stomp.over(socket)

  stompClient.value.connect(
    {
      Authorization: 'Bearer ' + localStorage.getItem('accessToken')
    },
    () => {
      console.log('✅ STOMP 연결됨')

      stompClient.value.subscribe('/topic/er-status', (message) => {
        const updated = JSON.parse(message.body)
        console.log('📦 병상 수 갱신 수신:', updated)
        updateHospitalInList(updated)
      })
    },
    (error) => {
      console.error('❌ STOMP 연결 실패:', error)
    }
  )
}

function updateHospitalInList(updatedHospital){
  const idx = hospitals.value.findIndex(h => h.id === updatedHospital.id)
  if(idx !== -1){
    hospitals.value[idx].availableErCount = updatedHospital.availableErCount
  }
}


// 병상수가 수정되면 그에 따라 가용 병상 순 리스트가 수정된다.
const sortedHospitals = computed(() => {
  if(sortBy.value === 'ER_COUNT'){
    return [...hospitals.value].sort((a,b) => b.availableErCount - a.availableErCount)
  }
  return hospitals.value
})


async function locateMe() {

  if( !('geolocation' in navigator)){
      alert('브라우저에서 Geolocation을 지원하지 않습니다.')
    return
  }

  if(navigator.permissions) {
    try{

      const status = await navigator.permissions.query({name : 'geolocation'})
      switch (status.state) {
        case 'granted' :
          getCurrentPosition()
          break
        case 'prompt' :
          getCurrentPosition()
          break
        case 'denied' :
          alert('위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.')
          break
      }
      // 권한 상태 변경 시 다시 처리 가능하게 함
      status.onchange = () => {
        if(status.state === 'granted') getCurrentPosition()
      }
    }catch(e) { // permission api 오류 시 바로 위치 조회
      getCurrentPosition()
    }
  } else { // permission api 미지원 시 위치 조회
    getCurrentPosition()
  }
}

// 현재 위치 가져옴
function getCurrentPosition() {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      position.value.lat = coords.latitude
      position.value.lon = coords.longitude

      emit('find-location', {lat: coords.latitude, lon : coords.longitude})
    },
    (err) => {
      console.error('위치 조회 실패:', err.message)
      alert('위치 정보를 가져오지 못했습니다.')
    }
  )
}

async function fetchHospitals(keyword) {

  if(typeof keyword === 'string'){
    searchKeyword.value =  keyword.trim()
    currentPage.value = 0
  }

  try {
    const res = await apiClient.post(
      '/hospitals/search',
      null,
      {
        params: {
          lat:        position.value.lat,
          lon:        position.value.lon,
          sortOption: sortBy.value,
          keyword:    searchKeyword.value || undefined,
          size: pageSize.value,
          page: currentPage.value

        }
      }
    )
    hospitals.value = res.data.content || []
    totalPages.value = res.data.totalPages
  } catch (err) {
    hospitals.value = []
    totalPages.value = 0
  }
}

// 검색창에 키워드 있는 경우 처리
function onSearch(keyword){
  searchKeyword.value = keyword
  currentPage.value = 0
  fetchHospitals()
}

function changeSort(option) {
  if (SORT_OPTIONS.includes(option)) {
    sortBy.value = option
    currentPage.value = 0
    fetchHospitals()
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    fetchHospitals()
  }
}

function changePage(p) {
  if (p < 0 || p >= totalPages.value) return
  currentPage.value = p
  fetchHospitals()
}

function  nextPage() {
  if(currentPage.value < totalPages.value - 1) {
    currentPage.value++
    fetchHospitals()
  }
}




defineExpose({ fetchHospitals, hospitals, searchKeyword, currentPage })
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
.hospital-list {
  list-style: none;
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

.beds {
  margin: 2px 0;
  font-size: 13px;
  color : #ff6b81;
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
