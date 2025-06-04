<!-- src/components/MapSidebar.vue -->
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
      <!-- (C-1) 로딩 중 -->
<!--      <div v-if="isLoading" class="loader-container">-->
<!--        <v-progress-circular indeterminate color="gray" size="36" />-->
<!--        <p class="loader-text">데이터를 불러오고 있습니다...</p>-->
<!--      </div>-->

      <!-- (C-2) 로딩 끝났으나 hospitals 배열이 비어있다면 -->
      <div v-if="!isLoading && hospitals.length === 0" class="loader-container">
        <p class="loader-text">주변 병원이 없습니다</p>
      </div>

    <!-- 병원 리스트 props.hospitals에서 가져옴 -->
    <ul class="hospital-list">
      <li
        v-for="h in pagedHospitals"
        :key="h.id"
        @click="$emit('select-hospital', h)"
      >
        <h5 class="name">{{ h.name }}</h5>
        <p class="addr">📍 {{ h.address }}</p>
        <p class="phone">
<!--          <v-icon set="flaticon" icon="fi fi-tr-emergency-call" class="phone-icon" />-->
          📞 {{ h.phoneNumber }}</p>
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
import '@flaticon/flaticon-uicons/css/all/all.css'
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

// const stompClient = ref(null)
//
// // 위치 전송을 위한 상태
// let lastSent = {lat: null, lon: null, time: 0}
// const SEND_INTERVAL = 10_000 // 10초
// const SEND_DISTANCE = 500 // 500m
//
//
//
//
//
// const emit = defineEmits(['select-hospital', 'find-location'])
//
// // 정렬 옵션
// const SORT_OPTIONS = ['DISTANCE', 'ER_COUNT']
//
// const hospitals = ref([]) // 서버에서 받은 전체 데이터
// const sortBy = ref('DISTANCE')
// const position = ref({ lat: null, lon: null })
// const totalPages = computed(() => Math.ceil(hospitals.value.length/ pageSize.value))
// const currentPage = ref(0)
// const pageSize = ref(10)
// const searchKeyword = ref('') // 검색어 관리
// const token = localStorage.getItem('accessToken')
//
//
// // Haversine 거리 계산 함수 ( 이런 작은 계산에서는 하버사인 거리 계산 코드를 직접 씀)
// function calcDistance(lat1, lon1, lat2, lon2) {
//   const toRad = d => d * Math.PI / 180
//   const R = 6371e3
//   const φ1 = toRad(lat1), φ2 = toRad(lat2)
//   const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1)
//   const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   return R * c
// }
//
// // 위치 전송 조건
// function trySendLocation(lat, lon) {
//   const now = Date.now()
//   const dist = lastSent.lat !== null
//     ? calcDistance(lastSent.lat, lastSent.lon, lat, lon)
//     : Infinity
//
//   if(now - lastSent.time > SEND_INTERVAL || dist > SEND_DISTANCE) {
//
//     stompClient.value.publish({
//       destination : '/publish/location',
//       headers: { Authorization: 'Bearer ' + token },
//       body: JSON.stringify({lat, lon})
//     })
//
//     console.log(
//       `[STOMP] 위치 전송: lat=${lat.toFixed(6)}, lon=${lon.toFixed(6)}, ` +
//       `interval=${now - lastSent.time}ms, dist=${dist.toFixed(1)}m`
//     )
//
//
//     lastSent = {lat, lon, time : now}
//
//   }
// }
//
//
//
// // 서버에서 받은 병원 데이터를 한 번 더 검사해서 다시 정렬
// // 화면에 제대로 뿌리기 위해 검사
// const sortedHospitals = computed(() => {
//   let list = [...hospitals.value]
//   if(sortBy.value === 'ER_COUNT' ) {
//     list.sort((a, b) => b.availableErCount - a.availableErCount)
//   } else {
//     list.sort((a, b) => {
//       // a.distanceKm, b.distanceKm가 둘 다 유효한 숫자여야 비교
//       if (!Number.isFinite(a.distanceKm)) return 1
//       if (!Number.isFinite(b.distanceKm)) return -1
//       return a.distanceKm - b.distanceKm
//     })
//   }
//   const start = currentPage.value * pageSize.value
//
//   return list.slice(start, start + pageSize.value)
// })
//
//
// const formatDuration = (ms) => {
//   const totalSec = Math.round(ms/1000)
//   const hours = Math.floor(totalSec / 3600)
//   const minutse = Math.floor((totalSec % 3600)/ 60)
//
//   if(hours === 0) {
//      // 1시간 이하
//     return `${Math.ceil(totalSec / 60)} 분`
//   }
//
//   const hh = String(hours).padStart(2,'0' )
//   const mm = String(minutse).padStart(2,'0' )
//
//   return `${hh}시간 ${mm}분`
// }
//
// // 위치가 정해지면 API 호출
// watch(
//   [() => position.value.lat, () => position.value.lon, () => sortBy.value, () => searchKeyword.value],
//   ([lat, lon]) => {
//     if(lat != null && lon != null) {
//       fetchHospitals()
//     }
//   }
// )
//
// onMounted(() => {
//   locateMe()
// })
//
//
//
//
// // stomp 연결 및 subscribe  설정
// const connectWebSocket = () => {
//   const socket = new SockJS('http://localhost:8080/connect')
//   stompClient.value = Stomp.over(socket)
//
//   stompClient.value.connect(
//     {
//       Authorization: 'Bearer ' + localStorage.getItem('accessToken')
//     },
//     () => {
//       console.log('✅ STOMP 연결됨')
//
//
//       // 1:1 응답을 받을 구독 경로
//        stompClient.value.subscribe(
//           '/user/queue/near-hospitals',
//            ({ body }) => {
//              hospitals.value = JSON.parse(body)
//             //totalPages.value = Math.ceil(hospitals.value.length/ pageSize.value)
//              emit('update-list', hospitals.value)
//           }
//       )
//
//       stompClient.value.subscribe('/topic/er-status', (message) => {
//         const updated = JSON.parse(message.body)
//         console.log('📦 병상 수 갱신 수신:', updated)
//         updateHospitalInList(updated)
//       })
//
//
//       // 위치 전송용 토픽
//
//       if(navigator.geolocation){
//         navigator.geolocation.watchPosition(
//           ({coords}) => {
//
//             const lat = coords.latitude
//             const lon = coords.longitude
//
//             position.value = {lat, lon}
//
//             trySendLocation(lat, lon)
//           },
//           err =>  console.error('위치 추적 오류:', err),
//           {enableHighAccuracy : true, maximumAge: 5000}
//         )
//       }
//     },
//     (error) => {
//       console.error('❌ STOMP 연결 실패:', error)
//     }
//   )
// }
// // 병상 수 갱신 로직
// function updateHospitalInList(updatedHospital){
//   const idx = hospitals.value.findIndex(h => h.id === updatedHospital.id)
//   if(idx !== -1){
//     hospitals.value[idx].availableErCount = updatedHospital.availableErCount
//   }
// }
//
//
// // 초기 위치 조회 및 전송 + rest 호출
// function locateMe() {
//   console.log('[locateMe] 호출됨')
//   if( !('geolocation' in navigator)){
//       alert('브라우저에서 Geolocation을 지원하지 않습니다.')
//     return
//   }
//
//
//       // granted, prompt
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       async ({coords}) => {
//         const lat = coords.latitude
//         const lon = coords.longitude
//
//
//         position.value = {lat, lon}
//
//         // 검색어 초기화
//         searchKeyword.value = ''
//         currentPage.value = 0
//
//
//         // 최초 한 번 rest로 데이터 받아옴
//         await fetchHospitals('')
//
//         // rest 후에 stomp 연결
//         connectWebSocket()
//
//         // 최초 위치도 stomp로 보냄 (10초 대기일 수 있으니까...)
//         stompClient.value.publish({
//           destination: '/publish/location',
//           headers: {Authorization: 'Bearer ' + token},
//           body: JSON.stringify({lat, lon})
//         })
//
//
//         // distance값이 유효하게 내려오는지 확인
//         await fetchHospitals('')
//         emit('find-location', { lat, lon })
//
//         resolve()
//       },
//       err => {
//         console.error('초기 위치 조회 실패:', err)
//         alert('위치 정보를 가져올 수 없습니다.')
//       },
//       {enableHighAccuracy: true}
//     )
//
//
//   })
//
// }
//
// // 현재 위치 가져옴
// // function getCurrentPosition() {
// //   navigator.geolocation.getCurrentPosition(
// //     ({ coords }) => {
// //       position.value.lat = coords.latitude
// //       position.value.lon = coords.longitude
// //
// //       emit('find-location', {lat: coords.latitude, lon : coords.longitude})
// //     },
// //     (err) => {
// //       console.error('위치 조회 실패:', err.message)
// //       alert('위치 정보를 가져오지 못했습니다.'),
// //         {enableHighAccuracy: true}
// //     }
// //   )
// // }
//
// // 병원 데이터 호출
// async function fetchHospitals(keyword) {
//
//   if(typeof keyword === 'string'){
//     searchKeyword.value =  keyword.trim()
//     currentPage.value = 0
//   }
//
//
//   try {
//     const res = await apiClient.post(
//       '/hospitals/search',
//       null,
//       {
//         params: {
//           lat:        position.value.lat,
//           lon:        position.value.lon,
//           sortOption: sortBy.value,
//           keyword:    searchKeyword.value || undefined,
//         }
//       }
//     )
//
//     console.log('✅ [fetchHospitals] 요청 URL   :', res.config.baseURL + res.config.url)
//     console.log('✅ [fetchHospitals] 요청 params:', res.config.params)
//     //hospitals.value = res.data || []
//     //totalPages.value = Math.ceil(hospitals.value.length/pageSize.value)
//
//     hospitals.value = (res.data || []).map(h => ({
//            ...h,
//            distanceKm: Number(h.distanceKm),
//            durationSec: Number(h.durationSec)
//     }))
//
//     emit('update-list', hospitals.value)
//     // 디버그 로그
//     console.log('서버에서 받은 전체 병원 수:', hospitals.value.length)
//     console.log('총 페이지 수:', totalPages.value)
//
//
//
//   } catch (err) {
//     console.error('❌ [fetchHospitals] 에러 상태:', err.response?.status)
//     console.error('❌ [fetchHospitals] 에러 메시지:', err.response?.data)
//     hospitals.value = []
//     //totalPages.value = 0
//   }
// }
//
// // 검색창에 키워드 있는 경우 처리
// // function onSearch(keyword){
// //   searchKeyword.value = keyword
// //   currentPage.value = 0
// //   fetchHospitals()
// // }
//
// function changeSort(option) {
//   if (SORT_OPTIONS.includes(option)) {
//     sortBy.value = option
//     currentPage.value = 0
//     fetchHospitals()
//   }
// }
//
// function prevPage() {
//   if (currentPage.value > 0) {
//     currentPage.value--
//     fetchHospitals()
//   }
// }
//
// function changePage(p) {
//   if (p < 0 || p >= totalPages.value) return
//   currentPage.value = p
//   fetchHospitals()
// }
//
// function  nextPage() {
//   if(currentPage.value < totalPages.value - 1) {
//     currentPage.value++
//     fetchHospitals()
//   }
// }
//
//
//
//
//
// defineExpose({ fetchHospitals, hospitals, searchKeyword, currentPage, locateMe })
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
