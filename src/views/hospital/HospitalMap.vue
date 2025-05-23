<template>
  <div class="hospital-map">
    <MapSidebar
      ref="sidebarRef"
      @find-location="onFindLocation"
      @select-hospital="onSelectHospital"
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
      <div id="map" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MapSidebar from "@/views/hospital/MapSidebar.vue";
import Header from "@/components/common/Header.vue";

const searchQuery = ref('')
const sidebarRef = ref(null)

function onFindLocation() {
  // 현재 위치 찾기 로직
  alert('현재 위치 찾기!')
}

function searchHospital() {

  if(!sidebarRef.value) return
  sidebarRef.value.fetchHospitals(searchQuery.value)

}

function onSelectHospital(h) {
  // 지도를 해당 병원 위치로 이동
  console.log('선택된 병원:', h)
}



onMounted(() => {
  // 지도 라이브러리 초기화 (예: KakaoMap, NaverMap 등)
  const container = document.getElementById('map')
  // new kakao.maps.Map(container, {...})
})
</script>

<style scoped>
.hospital-map {
  display: flex;
  height: calc(100vh - 20px);
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
