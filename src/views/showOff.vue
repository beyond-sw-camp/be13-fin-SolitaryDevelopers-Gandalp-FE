<template>
    <div class="off-schedule-page">
      <h2 class="title">오프 일정 조회</h2>
  
      <div class="search-bar">
        <select v-model="searchType">
          <option disabled value="">검색 기준 선택</option>
          <option value="email">이메일</option>
          <option value="name">이름</option>
        </select>
        <input v-model="searchKeyword" placeholder="검색어를 입력하세요" />
        <button class="search-btn" @click="fetchList">검색</button>
      </div>
  
      <table class="schedule-table">
  <thead class="thead">
    <tr>
      <th style="text-align: left; padding-left: 20px;">신청한 오프 일정</th>
      <th>작성자</th>
      <th>최근 수정일자</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in scheduleList" :key="item.offScheduleTempId">
      <td>{{ formatDate(item.startTime) }} ~ {{ formatDate(item.endTime) }}</td>
      <td>{{ item.nurseName }}</td>
      <td>{{ formatDateTime(item.updatedAt) }}</td>
    </tr>
  </tbody>
</table>
  
      <div class="pagination">
  <button
    class="page-btn"
    :disabled="currentPage === 1"
    @click="changePage(currentPage - 1)">
    &lt;
  </button>

  <button
    v-for="page in totalPages"
    :key="page"
    class="page-btn"
    :class="{ active: currentPage === page }"
    @click="changePage(page)">
    {{ page }}
  </button>

  <button
    class="page-btn"
    :disabled="currentPage === totalPages"
    @click="changePage(currentPage + 1)">
    &gt;
  </button>
</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import apiClient from '@/api/axios'
  
  const totalPages = ref(1); // 혹은 적절한 기본값
  const searchType = ref('')
  const searchKeyword = ref('')
  const scheduleList = ref([])
  const currentPage = ref(1)
  const hasMore = ref(true)
  
  const fetchList = async () => {
  const { data } = await apiClient.get('/off/temp', {
    params: {
      type: searchType.value,
      keyword: searchKeyword.value,
      page: currentPage.value,
    },
  });

  console.log('💡 API 응답:', data); // 전체 응답 확인

  scheduleList.value = data.items;
  hasMore.value = data.hasMore;

  console.log('📋 scheduleList:', scheduleList.value); // 리스트 확인
}
  
  const formatDate = (dateStr) => dateStr?.slice(5)
  const formatDateTime = (dtStr) => dtStr?.replace('T', ' ').slice(0, 16)
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      fetchList()
    }
  }
  const nextPage = () => {
    if (hasMore.value) {
      currentPage.value++
      fetchList()
    }
  }
  
  onMounted(fetchList)
  </script>
  
  <style scoped>
  .off-schedule-page {
    padding: 24px;
  }
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 5px;
  }
  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .thead{
    background: linear-gradient(to right, #ADDDF9 0%, #C2EBFF 100%);
    border: none;
    color: #000;
    font-size: 13px;
    font-weight: bold;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    line-height: 1;
    padding: 0 8px;
  }
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  .search-btn {
  width: 5%;
  height: 36px;
  background: linear-gradient(to right, #ADDDF9 0%, #C2EBFF 100%);
  border: none;
  color: #000;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 8px;
  transition: all 0.2s ease-in-out;
}

.search-btn:hover {
  background: linear-gradient(to right, #8CCEF0 0%, #A0E4FF 100%);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
}

  .schedule-table th,
  .schedule-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  .pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  width: 25px;
  height: 25px;
  border: 1px solid #d0d0d0;
  background-color: white;
  border-radius: 6px;
  font-size: 16px;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.page-btn.active {
  border: 2px solid #409eff;
  color: #409eff;
  font-weight: bold;
}

.page-btn:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}
  </style>
  