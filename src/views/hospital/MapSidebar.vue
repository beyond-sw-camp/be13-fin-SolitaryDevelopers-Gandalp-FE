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
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, defineExpose, computed } from 'vue'
import apiClient from '@/api/axios'
import { Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'


const stompClient = ref(null)


// 정렬 옵션
const SORT_OPTIONS = ['DISTANCE', 'ER_COUNT']

const hospitals = ref([])
const sortBy = ref('DISTANCE')
const position = ref({ lat: null, lon: null })

// 위치가 정해지면 API 호출
watch(
  [() => position.value.lat, () => position.value.lon, () => sortBy.value],
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
      switch (status.state){
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
    },
    (err) => {
      console.error('위치 조회 실패:', err.message)
      alert('위치 정보를 가져오지 못했습니다.')
    }
  )
}

async function fetchHospitals(keyword = '') {
  try {
    const res = await apiClient.post(
      '/hospitals/search',
      null,
      {
        params: {
          lat:        position.value.lat,
          lon:        position.value.lon,
          sortOption: sortBy.value,
          keyword:    keyword || undefined

        }
      }
    )
    hospitals.value = res.data.content || []
  } catch (err) {
    console.error('병원 조회 실패:', err)
    alert('병원 정보를 불러오지 못했습니다.')
  }
}

function changeSort(option) {
  if (SORT_OPTIONS.includes(option)) {
    sortBy.value = option
  }
}

defineExpose({fetchHospitals})

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
.addr, .phone, .beds {
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}
</style>
