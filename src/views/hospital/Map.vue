<template>
  <div class="map-container">
    <div id="map" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'


// 부모로부터 받을 병원 위치 리스트와 현재 위치
const props = defineProps({
  hospitals : {
    type: Array,
    default : () => []
  }
})

// 지도와 마커 보관
let map = null
let markers = []


// 지도를 초기화하고, 위치 데이터를 표시
function initMap(lat, lng) {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng),
    useStyleMap: true,
    zoom: 14,
    minZoom: 8,
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
}

// 마커 생성 / 제거 , bounds 조정
function renderMarkers(){

  // 기존 마커 제거
  markers.forEach(m => m.setMap(null))
  markers = []

  if(!props.hospitals.length){
    return
  }
  // 마커들이 지도에 들어올 수 있도록 범위 계산을 위한 LatLngBounds
  const bounds = new naver.maps.LatLngBounds()

  // 병원 리스트 마커
  props.hospitals.forEach(h => {
    const pos = new naver.maps.LatLng(h.latitude, h.longitude)
    bounds.extend(pos)

    const marker = new naver.maps.Marker({
      position: pos,
      map,
      title: h.name
    })

    // 마커 클릭 시 병원 이름, 전화번호
    const infow = new naver.maps.InfoWindow({
      content : `<div style="padding:6px;">${h.name}</div>`
    })

    naver.maps.Event.addListener(marker, 'click', () =>{
      infow.open(map, marker)
    })
    markers.push(marker)
  })

  // 모든 마커가 보이도록 지도 레벨 / 센터 조정
  map.fitBounds(bounds, 50) // 50px 여백
}

function centerOn(lat, lng) {
  if (!map) return
  map.panTo(new naver.maps.LatLng(lat, lng))
}


onMounted(() => {

  if (!window.naver || !window.naver.maps) {
    console.error('네이버 맵 스크립트가 로드되지 않았습니다.')
    return
  }
  // 브라우저 위치 권한 요청 및 초기 위치 설정
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => initMap(coords.latitude, coords.longitude),
    () => initMap(37.568554, 126.980010)
  )
})



// 병원 데이터가 바뀌면 마커 재렌더링
watch(
  () => props.hospitals,
  () =>{
    if (map) {
      renderMarkers()
    }
  },
  { immediate: true }
)

defineExpose({centerOn})

</script>

<style scoped>
.map-container {
  margin-left: 107px;
  height: 100%;
  width: 75.4vw;
}
#map {
  width: 100%;
  height: 100%;
}
</style>
