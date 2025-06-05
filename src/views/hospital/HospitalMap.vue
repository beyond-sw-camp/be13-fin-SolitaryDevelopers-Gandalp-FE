<template>
  <div class="hospital-map">


    <MapSidebar
      :hospitals = "sortedHospitals"
      :total-pages="totalPages"
      :current-page="currentPage"
      :sort-by="sortBy"
      :search-keyword="searchKeyword"
      :is-loading="isLoading"
      :is-locating="isLocating"
      @locate-me="onLocateMe"
      @search="onSearch"
      @change-sort="onChangeSort"
      @change-page="onChangePage"
      @select-hospital="onSelectHospital"
    />

    <div class="map-container">

      <Header/>
      <div class="map-search">

        <input
          v-model="searchKeyword"
          @keyup.enter="onSearch(searchKeyword)"
          type="text"
          placeholder="빠른 검색 결과를 위해 의료기관 이름을 정확하게 검색해주세요"
        />

        <button class="btn-search" @click="onSearch(searchKeyword)">
          검색</button>
      </div>


      <div class="map-wrapper">
        <Map
          v-if="userPosition.lat !== null"
          ref="mapRef"
          :hospitals="hospitals"
          :center-lat="userPosition.lat"
          :center-lng="userPosition.lon"
          :auto-fit-bounds="false"
          :show-current="!isSearching"
        />

      </div>

      <!--      아이콘 저작권 표시 -->
      <div class="icon-attribution">
        아이콘 제작자
        <a
          href="https://www.flaticon.com/authors/i3oundless"
          target="_blank"
          rel="noopener noreferrer"
        >
          I3oundless
        </a>,
        <a
          href="https://www.flaticon.com/authors/pixel-perfect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pixel perfect
        </a>,
        <a
          href="https://www.flaticon.com/authors/meaicon"
          target="_blank"
          rel="noopener noreferrer"
        >
          meaicon
        </a>
        from
        <a
          href="https://www.flaticon.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Flaticon
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import Map from './Map.vue'
import MapSidebar from "@/views/hospital/MapSidebar.vue";
import Header from "@/components/common/Header.vue";
import apiClient from "@/api/axios.js";

//  네이버 내비/지도 앱 방식 반영
//  소수점 5자리(≈1.1m) 반올림 : GPS 흔들림(±0.5m) 방지
//  첫 로딩 시 마지막 위치 활용: onMounted에서 한 번만 위치 얻기
//  이후 “현재 위치 찾기” 시, 이미 userPosition이 있으면 GPS 재호출 없이 fetchHospitals()


// 소수점 5자리까지 반올림 (≈1.1m 단위)
function roundToFiveDecimal(value) {
  return Math.round(value * 100000) / 100000;
}


// 상태 정의
const searchKeyword = ref('')
const sortBy = ref('DISTANCE')
const currentPage = ref(0)
const pageSize = 10
const totalPages = computed(() => Math.ceil(hospitals.value.length/ pageSize))
const mapRef = ref(null)

// 전달할 병원 리스트
const hospitals = ref([])

// 서버에서 받아온 데이터 정렬
const sortedHospitals = computed(() => {
  const arr = [...hospitals.value]
  if(sortBy.value === 'DISTANCE') {
    arr.sort((a, b) => {
      if(!Number.isFinite(a.distanceKm)) return 1
      if(!Number.isFinite(b.distanceKm))return -1
        return a.distanceKm - b.distanceKm
    })
  } else {
    arr.sort((a, b) => b.availableErCount - a.availableErCount)
  }
  return arr
})
// 현재 위치(반올림된 값)
const userPosition = reactive({lat: null, lon: null})
// “마지막으로 서버에 병원 조회 요청을 보냈던” 위치를 저장
const lastPosition = reactive({ lat: null, lon: null })
const stompClient = ref(null)

// 로딩 상태
const isLoading = ref(false)
// 현재 위치 조회 중 상태
const isLocating = ref(false)

const isSearching = ref(false)


// Haversine 공식: 두 위경도 사이의 거리(m) 계산
function calcDistance(lat1, lon1, lat2, lon2) {
  const toRad = (d) => d * Math.PI / 180
  const R = 6371e3
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1),
    Δλ = toRad(lon2 - lon1)
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ** 마지막 전송 시각과 마지막 전송 좌표 관리 (10초, 50m)
let lastSent = { lat: null, lon: null, time: 0 }
const SEND_INTERVAL = 15_000  // 10초
const SEND_DISTANCE  = 150    // 100m 이상으로 해야 gps 오차를 감안할 수 있음

// 위치를 조건마다 STOMP로 전송
//  - 15초가 지나고, 마지막 전송 시 위치로부터 100m 이상 이동했을 때만 전송
function trySendLocation(lat, lon) {
  const now = Date.now()

  // 15초가 경과해야 하고
  if (now - lastSent.time <= SEND_INTERVAL) {
    return
  }

  // 마지막으로 전송했던 좌표가 없으면 바로 전송 ( 처음 )
  if (lastSent.lat === null || lastSent.lon === null) {
    stompClient.value.publish({
      destination: '/publish/location',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
      body: JSON.stringify({ lat, lon })
    })
    lastSent = { lat, lon, time: now }
    return
  }

  //  마지막 전송했던 좌표로부터 실제 이동 거리가 150m 이상이면 전송
  const distance = calcDistance(lastSent.lat, lastSent.lon, lat, lon)
  if (distance >= SEND_DISTANCE) {
    stompClient.value.publish({
      destination: '/publish/location',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
      body: JSON.stringify({ lat, lon })
    })
    lastSent = { lat, lon, time: now }
  }
}


// 현재 위치 기반 데이터 조회 ( 페이지 첫 랜더링 시 보여줄 화면 데이터 )
async function fetchHospitals() {

  if (userPosition.lat == null || userPosition.lon == null) {
    console.warn('[fetchHospitals] 위치 정보가 설정되지 않아 API 호출을 건너뜁니다.')
    return
  }

  // API 호출 직전에 로딩 ON
  isLoading.value = true


  try {
    const res = await apiClient.post (
      '/hospitals/search',
      null,
      {
        params: {
          lat: userPosition.lat,
          lon: userPosition.lon,
          sortOption: sortBy.value,
          keyword: searchKeyword.value ? searchKeyword.value : undefined,
          // page : currentPage.value,
          // size : pageSize
        }
      }
    )

    hospitals.value = (res.data || []).map(h =>({
      ...h,
      distanceKm : Number(h.distanceKm),
      durationSec : Number(h.durationSec),
      availableErCount: Number(h.availableErCount),
      totalErCount : Number(h.totalErCount)
    }))

    // 조회 후 lastPosition 업데이트: 마지막으로 조회한 위치 기록
    lastPosition.lat = userPosition.lat
    lastPosition.lon = userPosition.lon

    // 받은 후 현재 페이지를 0으로 초기화 후 페이징 정렬 적용
    currentPage.value = 0
  }catch(err) {
    console.error('[fetchHospitals] 에러', err.response?.data || err.message)
    hospitals.value  = []
  } finally {
    // 결과를 받았든 에러가 나든 항상 로딩 OFF
    isLoading.value = false
  }
}



function updateHospitalInList(updatedHospital) {
  // hospitals.value 배열에서 같은 id를 찾아서
  const idx = hospitals.value.findIndex(h => h.id === updatedHospital.id)
  if (idx !== -1) {
    // availableErCount와 totalErCount를 동시 업데이트
    hospitals.value[idx].availableErCount = updatedHospital.availableErCount
    hospitals.value[idx].totalErCount     = updatedHospital.totalErCount
  }
}

// STOMP 연결 실시간 업데이트

function connectWebSocket() {
  if (stompClient.value && stompClient.value.connected) return;

  // ✅ SockJS 객체 생성
  // const socket = new SockJS('https://api.gandalp-service.com/connect');
  const socket = new SockJS('http://localhost:8080/connect');

  // ✅ SockJS로 STOMP 클라이언트 생성 (factory 생략)
  stompClient.value = Stomp.over(socket);

  // ✅ 연결 시도
  stompClient.value.connect(
    {
      Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
    },
    onConnected,
    onError
  );
}

// 📌 연결 성공 시 콜백
function onConnected() {
  console.log('✅ STOMP 연결됨');

  // ✅ 병원 리스트 수신 (1:1 큐)
  stompClient.value.subscribe('/user/queue/near-hospitals', ({ body }) => {
    hospitals.value = JSON.parse(body);
    emit('update-list', hospitals.value);
  });

  // ✅ 병상 수 실시간 업데이트
  stompClient.value.subscribe('/topic/er-status', (message) => {
    const updated = JSON.parse(message.body);
    console.log('📦 병상 수 갱신 수신:', updated);
    updateHospitalInList(updated);
  });

  // ✅ 위치 추적 및 전송
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      ({ coords }) => {
        const lat = roundToFiveDecimal(coords.latitude);
        const lon = roundToFiveDecimal(coords.longitude);
        userPosition.lat = lat;
        userPosition.lon = lon;
        trySendLocation(lat, lon);
      },
      (err) => console.error('위치 추적 오류:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }
}

// 📌 연결 실패 시 콜백
function onError(error) {
  console.error('❌ STOMP 연결 실패:', error);
}


// ----------------------------------------------------------------------------------
// 현재 위치 찾기 버튼
//  이미 userPosition이 세팅되어 있으면 바로 fetchHospitals()만 호출 (GPS 재호출 생략)
// 아니면 getCurrentPosition → 반올림 → fetchHospitals → STOMP

// 현재 위치 찾기 버튼
// 사용자 위치 정보 허용
// 초기 위치 조회 및 전송 + rest 호출
// wifi로 얻어오는거 실패하면 gps로 얻어오는거 추가함
async function onLocateMe() {
    // 버튼을 비활성화
    isLocating.value = true
    searchKeyword.value = ''
    currentPage.value = 0

    console.log('[locateMe] 호출됨')
    if( !('geolocation' in navigator)){
      alert('브라우저에서 Geolocation을 지원하지 않습니다.')
      isLocating.value = false;
      return
    }

    // 이미 위치가 세팅되어 있으면, GPS 재호출 없이 바로 병원 조회
    if (userPosition.lat !== null && userPosition.lon !== null) {
      await fetchHospitals()
      isLocating.value = false
      return
    }

    // 위치가 있는 경우 gps 호출 없이 stomp로 위치 보냄
    if (stompClient.value && stompClient.connected) {
      stompClient.value.publish({
        destination: '/publish/location',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
        body: JSON.stringify({ lat: userPosition.lat, lon: userPosition.lon })
      })
      lastSent = { lat: userPosition.lat, lon: userPosition.lon, time: Date.now() }
   }

  // 위치 없는 경우 최초 한번만 실행
  navigator.geolocation.getCurrentPosition(

    async ({coords}) => {

      // 검색창 비우기
      searchKeyword.value = ''
      // 페이지 0으로 초기화
      currentPage.value = 0

      // 정렬 기준은 초기화 할까 말까...
      //sortBy.value = 'DISTANCE'

      // 유저 위치 ( gps 좌표를 소수점 5자리로 반올림 )
      userPosition.lat = roundToFiveDecimal(coords.latitude);
      userPosition.lon = roundToFiveDecimal(coords.longitude);

      // 최초 한 번 rest로 데이터 받아옴
      await fetchHospitals('')

      // gps로 현재 위치를 얻은 경우
      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.publish({
          destination: '/publish/location',
          headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
          body: JSON.stringify({ lat: userPosition.lat, lon: userPosition.lon })
        })
        lastSent = { lat: userPosition.lat, lon: userPosition.lon, time: Date.now() }
      }

      // 버튼 다시 활성화
      isLocating.value = false

      // rest api 후에 stomp(실시간 업데이트) 연결
      connectWebSocket()


    },
    async(err) => {
      // wifi로 가져오는게 실패한 경우
      if (err.code === 3) {
        navigator.geolocation.getCurrentPosition(
          async ({coords}) => {
            userPosition.lat = roundToFiveDecimal(coords.latitude)
            userPosition.lon = roundToFiveDecimal(coords.longitude)
            await fetchHospitals()

            if (stompClient.value && stompClient.value.connected) {
              stompClient.value.publish({
                destination: '/publish/location',
                headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
                body: JSON.stringify({ lat: userPosition.lat, lon: userPosition.lon })
              })
              lastSent = { lat: userPosition.lat, lon: userPosition.lon, time: Date.now() }
            }

            connectWebSocket()
            isLocating.value = false
          },
          (highErr) => {
            // gps도 실패한 경우
            console.error('[onLocateMe] high-accuracy 실패 코드:', highErr.code, '메시지:', highErr.message)
            alert('GPS에서도 위치를 찾을 수 없습니다. 권한을 확인해주세요.')
            isLocating.value = false
          },
          {enableHighAccuracy: true, timeout: 100000, maximumAge: 0}
        )
      } else {
        if (err.code === 1) {
          alert('위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요')
        } else {
          alert('위치 정보를 가져오지 못했습니다. 다시 시도해주세요.')
        }
        isLocating.value = false
      }
    },
    {enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
  )

}


// 검색 버튼 혹은 엔터 키 누른 경우
async function onSearch(keyword) {
  isSearching.value = true
  searchKeyword.value = keyword.trim()
  currentPage.value = 0
  await fetchHospitals()

  isSearching.value =false
}

// 정렬 기준
async function onChangeSort(option) {

  if(['DISTANCE', 'ER_COUNT'].includes(option)) {
    sortBy.value = option
    currentPage.value = 0
    //await fetchHospitals()
  }

}

// 페이지 바꿀 때
async function onChangePage(page) {
  if(page < 0 || page >= totalPages.value) return
  currentPage.value = page
  //await fetchHospitals()
}

// 사이드바 목록 클릭하면 지도 포커스 이동
function onSelectHospital(hospital) {
  // 부모가 받은 병원 데이터를 지도로 전달

  if (mapRef.value) {
    mapRef.value.centerOn(hospital.latitude, hospital.longitude)
    mapRef.value.openInfoWindow(hospital)
  }
}


onMounted(async () => {
  // 앱 구동 시, 마지막에 캐시된 위치(1분 이내 있으면)나 빠른 Wi-Fi 기반 위치를 얻어옴
  if ('geolocation' in navigator) {
    isLocating.value = true
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 300000, maximumAge: 60000 }
        )
      })
      userPosition.lat = roundToFiveDecimal(pos.coords.latitude)
      userPosition.lon = roundToFiveDecimal(pos.coords.longitude)

      await fetchHospitals()
      connectWebSocket()
    } catch (err) {
      console.error('초기 위치 조회 실패:', err)
    } finally {
      isLocating.value = false
    }
  }
})

</script>

<style scoped>
.hospital-map {
  display: flex;
  height: 100vh;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;
}

.map-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
}

.map-search {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  margin-left: 75px;
  gap: 8px;

}

.map-search input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ff6b81;
  border-radius: 20px;
  outline: none;
  margin: 40px 10px 40px 40px;
  max-width: 900px;
  height: 40px;
}

.btn-search {
  background: #ff6b81;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}

.map-wrapper {
  margin-left: 107px;
  position: relative;
  flex: 1;

}


#map {
  flex: 1;
}

/* 저작권 표시 스타일 */
.icon-attribution {
  font-size: 12px;
  text-align: right;
  margin-right: 10px;
  padding: 6px 0;
  background: transparent;
  color: #555;
}

.icon-attribution a {
  color: #007aff;
  text-decoration: none;
}

.icon-attribution a:hover {
  text-decoration: underline;
}
</style>
