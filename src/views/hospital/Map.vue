<template>
  <div class="map-container">
    <div id="map" />
  </div>
</template>

<script setup>
import customPinUrl from '@/api/icons/hospital-pin-red.png'
import hospitalIconUrl from '@/api/icons/hospital-plus-green.png'

import { ref, onMounted, watch, toRefs } from 'vue'

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
     }
 })

// 지도와 마커 보관
let map = null
// let markers = []
// id, marker, infowindow 객체 담음
const markersInfo = ref([])


// 지도를 초기화하고, 위치 데이터를 표시
function initMap(lat, lng) {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng),
    useStyleMap: true,
    zoom: 10,
    // 최소·최대 줌 레벨 지정
    minZoom: 6,
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
}

// 마커 생성 / 제거 , bounds 조정
function renderMarkers() {
  if (!map) return

  // (1) 기존 마커 제거
  markersInfo.value.forEach(info => {
    info.marker.setMap(null)
    info.infowindow.close()
  })
  markersInfo.value.length = 0

  // (2) 새 LatLngBounds 객체 생성
  const bounds = new naver.maps.LatLngBounds()

  // (3) 병원 리스트 순회 → 마커 생성 + bounds.extend
  props.hospitals.forEach(hospital => {
    // 3-1) LatLng 객체 생성
    const pos = new naver.maps.LatLng(hospital.latitude, hospital.longitude)
    // 3-2) bounds 확장
    bounds.extend(pos)

    // 3-3) 커스텀 아이콘 옵션
    const iconOptions = {
      url: customPinUrl,
      size: new naver.maps.Size(32, 32),
      origin: new naver.maps.Point(0, 0),
      anchor: new naver.maps.Point(16, 32),
      scaledSize: new naver.maps.Size(32, 32)
    }

    // 3-4) Marker 생성
    const marker = new naver.maps.Marker({
      position: pos,
      map,
      title: hospital.name,
      icon: iconOptions
    })

    // 3-5) InfoWindow 생성 (병원 이름 + 전화번호)
    const infowindow = new naver.maps.InfoWindow({
      content: `
        <div style="
          padding: 6px;
          text-align: center;
          color: #4e4b4b;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 200px;
          gap: 4px;
        ">
          <span style="font-weight: bold;">
            <img
              src="${hospitalIconUrl}"
              alt="병원 아이콘"
              style="width:16px; height:16px; margin-right:2px;"
            />
            ${hospital.name}
          </span>
          <span style="font-size: 13px; padding: 6px 6px 0 22px;">
            📞 ${hospital.phoneNumber}
          </span>
        </div>
      `
    })

    // 3-6) 마커 클릭 시 기존 인포윈도우 닫고 새 인포윈도우 열기
    naver.maps.Event.addListener(marker, 'click', () => {
      closeAllInfoWindows()
      infowindow.open(map, marker)
    })

    // 3-7) 마커+인포윈도우 정보를 전역 배열에 저장
    markersInfo.value.push({
      id: hospital.id,
      marker,
      infowindow
    })
  })

  // (4) hospitals 배열에 항목이 하나라도 있으면 fitBounds
    if (props.hospitals.length > 0) {
       map.fitBounds(bounds, 30)
    }
}


  function closeAllInfoWindows() {
    markersInfo.value.forEach(info => {
      info.infowindow.close()
    })
  }
  // 마커들이 지도에 들어올 수 있도록 범위 계산을 위한 LatLngBounds

 // 외부에서 지도 제어할 수 있게 노출
 function centerOn(lat, lng) {
   if (!map) return
   map.panTo(new naver.maps.LatLng(lat, lng))

 }

 function openInfoWindow(hospital) {
  if(!map) return
   map.panTo(new naver.maps.LatLng(hospital.latitude, hospital.longitude))
   closeAllInfoWindows()
   const found = markersInfo.value.find(info => info.id === hospital.id)
  if (found) {
    found.infowindow.open(map, found.marker)
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
     if(map) renderMarkers()
   },
   {immediate: true}
 )

 defineExpose({centerOn, openInfoWindow})

 //-----------------------------------------------------------
  // 병원 리스트 마커
//   props.hospitals.forEach(h => {
//     const pos = new naver.maps.LatLng(h.latitude, h.longitude)
//     bounds.extend(pos)
//
//     // 커스텀 마커
//     //    - url: PNG 파일 경로
//     //    - size: 이미지 실제 크기 (예: 24×24)
//     //    - origin: (0,0)부터 시작한다고 가정
//     //    - anchor: (아이콘이 지도 위에서 어떤 지점을 기준으로 찍힐지 설정)
//     const iconOptions = {
//       url: customPinUrl,
//       size: new naver.maps.Size(32, 32),
//       origin: new naver.maps.Point(0, 0),
//       anchor: new naver.maps.Point(16, 32), // (width/2, height) 로 설정하면, 핀의 바닥 중앙이 좌표에 위치
//       scaledSize: new naver.maps.Size(32, 32)
//     }
//
//     const marker = new naver.maps.Marker({
//       position: pos,
//       map,
//       title: h.name,
//       icon:iconOptions
//     })
//
//     // 마커 클릭 시 병원 이름, 전화번호
//     // const infow = new naver.maps.InfoWindow({
//     //   content : `<div style="padding:6px;">${h.name}</div>`
//     // })
//     const infowindow = new naver.maps.InfoWindow({
//            content: `
//        <div style="padding:6px;
//        flex-direction: column;
//        justify-content: center;
//        align-content: center;
//        text-align: center;
//        color: #4e4b4b;
//        display:flex;
//        align-items:center;
//        width: 200px;
//        gap:4px;">
//
//          <span style="font-weight:bold;">
//              <img
//            src="${hospitalIconUrl}"
//            alt="병원 아이콘"
//            style="width:16px; height:16px; vertical-align:middle; margin-right: 2px"
//          />
//           ${h.name}
//           </span>
//           <span style="padding:6px 6px 0 22px; font-size:13px;">📞 ${h.phoneNumber}</span>
//        </div>
//
//      `
//        })
//
//     //마커를 클릭했을 때 해당 infoWindow만 열리고, 이전의 마커 인포는 닫음
//     // naver.maps.Event.addListener(marker, 'click', () =>{
//     //   infow.open(map, marker)
//     // })
//
//     naver.maps.Event.addListener(marker, 'click', () => {
//       closeAllInfoWindows()
//       infowindow.open(map, marker)
//     })
//     //markers.push(marker)
//     markersInfo.push({id: h.id, marker, infowindow})
//   })
//
//   // 모든 마커가 보이도록 지도 레벨 / 센터 조정
//   map.fitBounds(bounds, 30) // 50px 여백
// }
//
// // 모든 InfoWindow를 닫음
// function closeAllInfoWindows() {
//   markersInfo.forEach(info => {
//     info.infowindow.close()
//   })
// }
//
// // 외부에서 호출하는 특정 병원의 InfoWindow 여는 메서드
// function openInfoWindow(hospital) {
//   if (!map) return
//
//   // 지도 중심을 해당 병원으로
//   map.panTo(new naver.maps.LatLng(hospital.latitude, hospital.longitude))
//
//   // 이미 열려 있는 InfoWindow는 닫기
//   closeAllInfoWindows()
//
//   // 병원 id와 매칭되는 Marker+InfoWindow 찾기
//   const found = markersInfo.find(info => info.id === hospital.id)
//   if (found) {
//     found.infowindow.open(map, found.marker)
//   }
// }
//
// // 지도를 해당 좌표로 이동만 시키는 메서드
// function centerOn(lat, lng) {
//   if (!map) return
//   map.panTo(new naver.maps.LatLng(lat, lng))
// }
//
//
// onMounted(() => {
//
//   if (!window.naver || !window.naver.maps) {
//     console.error('네이버 맵 스크립트가 로드되지 않았습니다.')
//     return
//   }
//   // 브라우저 위치 권한 요청 및 초기 위치 설정
//     navigator.geolocation.getCurrentPosition(
//       ({ coords }) => initMap(coords.latitude, coords.longitude),
//     () => initMap(37.568554, 126.980010)
//   )
// })
//
//
//
// // 병원 데이터가 바뀌면 마커 재렌더링
// watch(
//   () => props.hospitals,
//   () =>{
//     if (map) {
//       renderMarkers()
//     }
//   },
//   { immediate: true }
// )
//
// defineExpose({centerOn, openInfoWindow})

</script>

<style scoped>
.map-container {
  margin-left: 107px;
  margin-bottom: 70px;
  width: 75.4vw;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
}

</style>
