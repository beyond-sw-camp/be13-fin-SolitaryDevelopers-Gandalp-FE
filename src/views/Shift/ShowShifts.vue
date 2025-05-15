<template>
  <div class="shift-exchange-page">
    <h2 class="title">교대근무 교환 게시판</h2>

    <div class="search-bar">
      <select v-model="searchType">
        <option disabled value="">검색 기준 선택</option>
        <option value="content">바꿀 교대 타임</option>
      </select>
      <input v-model="searchKeyword" placeholder=" 검색어를 입력하세요" />
      <button class="search-btn" @click="fetchListByContent">검색</button>
    </div>

    <table class="shift-table">
      <thead class="thead">
        <tr>
          <th style="text-align: left; padding-left: 20px;">바꿀 교대 타임</th>
          <th>상태</th>
          <th>작성일자</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in shiftList" :key="item.boardId">
          <td style="text-align: left;">{{ item.content }}</td>
          <td>
            <span
              :class="{
                badge: true,
                completed: item.boardStatusLabel === '요청 수리됨',
                waiting: item.boardStatusLabel === '요청 대기중'
              }"
            >
              {{ item.boardStatusLabel }}
            </span>
          </td>
          <td>{{ formatDateTime(item.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
    <button class="write-post" @click="goToCreateShift">
      글 작성
    </button>


    <div class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
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
      <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import dayjs from 'dayjs'

const shiftList = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchType = ref('content')
const searchKeyword = ref('')
const router = useRouter()

// 글 등록 페이지로 이동
const goToCreateShift = () => {
  router.push({ name: 'create-shiftchange' })
}

// 교대 요청 글 목록 기본 조회
const fetchList = async () => {
  try {
    const { data } = await apiClient.get('/shifts', {
      params: {
        page: currentPage.value - 1, // Spring은 0-base page
        size: 10
      },
    })
    shiftList.value = data.content
    totalPages.value = data.totalPages
  } catch (err) {
    alert('목록 조회 중 오류가 발생했습니다.')
    console.error(err)
  }
}

// 교대 요청 글 검색 & 조회
const fetchListByContent = async () => {
  if (!searchType.value || !searchKeyword.value) {
    alert('검색 기준과 키워드를 모두 입력해주세요.')
    return
  }
  try {
    const { data } = await apiClient.get('/shifts/search', {
      params: {
        keyword: searchKeyword.value,
        searchOption: searchType.value.toUpperCase(), // 예시: "CONTENT"
        page: currentPage.value - 1,
        size: 10
      },
    })
    shiftList.value = data.content
    totalPages.value = data.totalPages
  } catch (err) {
    alert('검색 중 오류가 발생했습니다.')
    console.error(err)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  // 검색 조건이 있으면 검색, 아니면 전체 조회
  if (searchKeyword.value) {
    fetchListByContent()
  } else {
    fetchList()
  }
}

// 날짜+시간 포맷: "2025-05-12 14:00"
const formatDateTime = (dtStr) => {
  if (!dtStr) return '-'
  return dayjs(dtStr).format('YYYY-MM-DD HH:mm')
}

onMounted(fetchList)
</script>


  
  <style scoped>
  /* .shift-table,
  .shift-table th,
  .shift-table td {
    border: none;
  } */

  /* 새로 추가 */
  .shift-exchange-page {
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
  .shift-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
}

/* 상태별 색상 */
.completed {
  background-color: #d9f5ef; /* 옅은 민트 */
  color: #26a69a; /* 진한 민트 */
}


.waiting {
  background-color: #fff7e6; /* 옅은 노랑 */
  color: #f39c12;
}

.write-post{
  width: 6%;
  height: 36px;
  margin-left: 94%;
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
.write-post:hover {
  background: linear-gradient(to right, #8CCEF0 0%, #A0E4FF 100%);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
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

  .shift-table th,
  .shift-table td {
    border: none;
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

.cancel-btn{
  width: 50%;
  height: 36px;
  background: linear-gradient(to right, #F2A39F 0%, #F5B8B4 100%);
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
.cancel-btn:hover {
  background: linear-gradient(to right, #F2A39F 0%, #F5B8B4 100%);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
}
  </style>