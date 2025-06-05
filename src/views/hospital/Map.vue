<template>
  <div class="map-container">
    <div id="map" />
  </div>
</template>

<script setup>
import customPinUrl from '@/api/icons/hospital-pin-red.png'
import hospitalIconUrl from '@/api/icons/hospital-plus-green.png'
import hospitalPhoneUrl from '@/api/icons/hospital-phone.png'
import { ref, onMounted, watch } from 'vue'

// 부모로부터 받을 병원 리스트 + 초기 지도 중심 좌표(위도, 경도)
 const props = defineProps({
   hospitals: {
     type: Array,
       required: true,
       default: () => []
   },
   centerLat: {
       type: Number,
         required: true
   },
   centerLng: {
       type: Number,
         required: true
   },
   showCurrent: { // 현재 위치에서 검색중인지 받음
     type:Boolean,
     required: false,
     default: true
   }
 })

// 지도와 마커 보관
let map = null
let activeMarker = null // 현재 열린 마커
// id, marker, infowindow 객체 담음
const markersInfo = ref([])


// 현재 위치 마커
let currentLocationMarker = null

// 지도를 초기화하고, 위치 데이터를 표시
function initMap(lat, lng) {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng),
    useStyleMap: true,
    zoom: 11,
    // 최소·최대 줌 레벨 지정
    minZoom: 8,
    maxZoom: 16,
    //mapTypeControl: true,
    mapTypeControlOptions: {
      style: naver.maps.MapTypeControlStyle.BUTTON,
      position: naver.maps.Position.TOP_LEFT
    },
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT
    }
  })

  renderMarkers()

  // 현재 위치인 경우만 중심에 현재 위치 마커 생성
  if(props.showCurrent) {
    renderCurrentLocation(props.centerLat, props.centerLng)
  }
}

// 마커 생성 / 제거 , bounds 조정
function renderMarkers() {
  if (!map) return

  // 기존 마커 제거
  markersInfo.value.forEach(info => {
    info.marker.setMap(null)
    info.infowindow.close()
  })
  markersInfo.value.length = 0
  activeMarker = null

  // 새 LatLngBounds 객체 생성
  const bounds = new naver.maps.LatLngBounds()

  // 병원 리스트 순회 → 마커 생성 + bounds.extend
  props.hospitals.forEach(hospital => {
    // LatLng 객체 생성
    const pos = new naver.maps.LatLng(hospital.latitude, hospital.longitude)
    // bounds 확장
    bounds.extend(pos)

    // 애니메이션을 줄 html 요소를 생성
    const markerAni = document.createElement('div')
    markerAni.classList.add('marker-drop')
    markerAni.innerHTML = `
      <img src="${customPinUrl}" style="width:32px; height:32px;" />
    `
    // Marker 생성
    const marker = new naver.maps.Marker({
      position: pos,
      map,
      title: hospital.name,
      draggable: false,
      icon: {
        content: markerAni,
        size: new naver.maps.Size(32, 32),
        anchor: new naver.maps.Point(16, 32)
      }
    })

    requestAnimationFrame(() => {
      markerAni.classList.add('show')
    })

    const infowindow = new naver.maps.InfoWindow({
      content: `
          <div class="info-content-box" style="
            margin: 15px;
            width: 200px;
            user-select: none;
            display: flex;
            color: #4e4b4b;
            text-align: center;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <span style="font-weight: bold;">
              <img src="${hospitalIconUrl}" style="width:16px; height:16px; margin-right:2px;" />
              ${hospital.name}
            </span>
            <span style="font-size: 13px; padding: 6px 22px 0 22px;">
              <img src="${hospitalPhoneUrl}" style="width:14px; height:14px; margin-right:5px;" />
              ${hospital.phoneNumber}
            </span>
          </div>
        </div>
      `
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      if(infowindow.getMap()) {
        infowindow.close()
        return
      }
      closeAllInfoWindows()
      infowindow.open(map, marker)
    })

    // 마커+인포윈도우 정보를 배열에 저장
    markersInfo.value.push({
      id: hospital.id,
      marker,
      infowindow
    })
  })

  // hospitals 배열에 데이터가 하나라도 있으면 fitBounds
  if (props.hospitals.length > 0) {
    map.fitBounds(bounds, 0)
  }
}

function closeAllInfoWindows() {
  markersInfo.value.forEach(info => {
    info.infowindow.close()
  })
}

// 현재 위치 마커 생성
function renderCurrentLocation(lat, lng) {

  if(!map) return

  if(currentLocationMarker) {
    currentLocationMarker.setMap(null)
    currentLocationMarker = null
  }

  const pulseAni = document.createElement('div')
  pulseAni.classList.add('pulse-marker')
  pulseAni.innerHTML = `
  <div class= "pulse"> </div>
  <div class= "dot"></div>
  `

  currentLocationMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(lat, lng),
    map,
    icon: {
      content: pulseAni,
      size: new naver.maps.Size(16, 16),
      anchor: new naver.maps.Point(8, 8)
    },
    clickable: false
  })
}
 // 외부에서 지도 제어할 수 있게 노출
 function centerOn(lat, lng) {
   if (!map) return
   map.panTo(new naver.maps.LatLng(lat, lng))

 }

 function openInfoWindow(hospital) {

   const found = markersInfo.value.find(i => i.id === hospital.id)
  if (found && map) {
    closeAllInfoWindows()
    found.infowindow.open(map, found.marker)


    // 사이드바에서 연 경우에도 닫기 버튼 연결
    naver.maps.Event.addListener(found.infowindow, 'domready', () => {
      const wrapper = found.infowindow.getElement()
      if (!wrapper) return
      const closeBtn = wrapper.querySelector('.btn-close-info')
      if (!closeBtn) return
      closeBtn.addEventListener('click', () => {
        found.infowindow.close()
      })
    })

  }

 }

 onMounted(() => {
   if(!window.naver || !window.naver.maps) {
     console.error('네이버 맵 스크립트 로드 실패')
     return
   }

   initMap(props.centerLat, props.centerLng)

 })

 watch(

   () => props.hospitals,
   () => {
     if (map) {
       renderMarkers()
     }
   },
   {immediate : true}
 )
// watch를 분리해서 사용
watch(
  () => [props.centerLat, props.centerLng, props.showCurrent],
  ([newLat, newLng, newShow]) => {
    if(newShow) {
      renderCurrentLocation(newLat, newLng)
    } else {
      // 현재 위치가 아니면 pulse 마커를 없앰
      if(currentLocationMarker) {
        currentLocationMarker.setMap(null)
        currentLocationMarker = null
      }
    }
  }
)

 defineExpose({centerOn, openInfoWindow})


</script>

<style>


.map-container {
  margin-bottom: 70px;
  width: 75.4vw;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
}

.marker-drop {
  opacity: 0;
  transform: translateY(-20px);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.marker-drop.show {
  opacity: 1;
  transform: translateY(0);
}
.pulse-marker {
  position: relative;
  width: 16px;
  height: 16px;
}
.pulse-marker .pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background-color: rgba(0, 51, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-animation 2s ease-out infinite;
  z-index: 1;
}
.pulse-marker .dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background-color: #007aff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
@keyframes pulse-animation {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(3.5);
    opacity: 0;
  }
}

</style>
