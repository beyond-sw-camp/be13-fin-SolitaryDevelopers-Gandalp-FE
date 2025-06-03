<template>
  <div class="hospital-map">
    <MapSidebar
      ref="sidebarRef"
      @find-location="onFindLocation"
      @select-hospital="onSelectHospital"
      @update-list="hospitals = $event"
    />

    <div class="map-container">

      <Header/>
      <div class="map-search">

        <input
          v-model="searchQuery"
          @keyup.enter="searchHospital"
          type="text"
          placeholder="의료기관 검색"
        />

        <button class="btn-search" @click="searchHospital">
          검색</button>
      </div>

<!--      지도-->
      <Map ref="mapRef" :hospitals="hospitals"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Map from './Map.vue'
import MapSidebar from "@/views/hospital/MapSidebar.vue";
import Header from "@/components/common/Header.vue";

const searchQuery = ref('')
const mapRef = ref(null)
const sidebarRef = ref(null)
// 전달할 병원 리스트
const hospitals = ref([])

function searchHospital() {

  if(!sidebarRef.value) return
  sidebarRef.value.fetchHospitals(searchQuery.value).then(() => {
   // fetchHospitals가 끝난 뒤 사이드바의 hospitals를 복사
    hospitals.value = sidebarRef.value.hospitals.value
  })

}

// 현재 위치 찾기 버튼 누른 경우
async function onFindLocation({lat, lon}) {

  // 검색창 비우기
  searchQuery.value=''

  // 사이드바 내부 검색어도 클리어 & 페이지 초기화
  if(sidebarRef.value) {
    // sidebarRef.value.searchKeyword.value = ''
    // sidebarRef.value.currentPage.value = 0

    // 현재 위치를 기준으로 다시 조회
    // await sidebarRef.value.fetchHospitals('')
    // hospitals.value = sidebarRef.value.hospitals.value
    await sidebarRef.value.locateMe()
    hospitals.value = [...sidebarRef.value.hospitals.value]
    }


  if(mapRef.value) {
    mapRef.value.centerOn(lat, lon)
  }
}

function onSelectHospital(h) {
  // 지도를 해당 병원 위치로 이동
  if(mapRef.value) {
    mapRef.value.centerOn(h.latitude, h.longitude)
  }
}

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
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
}

.map-search {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  gap: 8px;

}

.map-search input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ff6b81;
  border-radius: 20px;
  outline: none;
  margin-left: 107px;
}

.btn-search {
  background: #ff6b81;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}

#map {
  flex: 1;
}
</style>
