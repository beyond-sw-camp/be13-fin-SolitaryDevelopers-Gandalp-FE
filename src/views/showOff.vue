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
        <button class="search-btn" @click="fetchListByEmailOrName(searchType, searchKeyword)">검색</button>
      </div>
  
      <table class="schedule-table">
  <thead class="thead">
    <tr>
      <th style="text-align: left; padding-left: 20px;">신청한 오프 일정</th>
      <th>작성자</th>
      <th>완료 여부</th>
      <th>최근 수정일자</th>
      <th>취소</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in scheduleList" :key="item.offScheduleTempId">
    <td style="text-align: left
    ;">{{ formatKoreanDate(item.startTime) }}</td> <!-- 🟡 날짜 범위 포맷 적용 -->
    <td>{{ item.nurseName }}</td>
    <td class="code-label">
      <span
        :class="{
          badge: true,
          approved: item.codeLabel === '승인',
          rejected: item.codeLabel === '반려',
          pending: item.codeLabel === '대기중'
        }"
      >
        {{ item.codeLabel }}
      </span>
    </td>
    <td>{{ formatDateTime(item.updatedAt) }}</td>
    <td><button v-if="item.codeLabel !== '반려'" class="cancel-btn" v-on:click="deleteOff(item.offScheduleTempId)">취소</button></td>
    </tr>
  </tbody>
</table>
<button class="create-off">
  오프 신청
</button>
  
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
import dayjs from 'dayjs'

const totalPages = ref(1)
const searchType = ref('')
const searchKeyword = ref('')
const scheduleList = ref([])
const currentPage = ref(1)
const hasMore = ref(true)

const deleteOff = async (scheduleTempId) => {
  const confirmed = confirm('정말로 이 오프 신청을 취소하시겠습니까?')
  if (!confirmed) return
  try {
    await apiClient.delete(`/schedules/off/temp/${scheduleTempId}`)
    alert('취소되었습니다.')
    
     // 검색 조건이 있을 경우만 검색 API 호출
    if (searchType.value && searchKeyword.value) {
      fetchListByEmailOrName(searchType.value, searchKeyword.value)
    } else {
      fetchList() // 전체 목록 새로고침
    }


  } catch (err) {
    console.error('삭제 실패:', err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const fetchList = async () => {
  const { data } = await apiClient.get('/schedules/off/temp', {
    params: {
      type: searchType.value,
      keyword: searchKeyword.value,
      page: currentPage.value,
    },
  })

  scheduleList.value = data.items
  hasMore.value = data.hasMore
}
const fetchListByEmailOrName = async (type, keyword) => {
  if (!type || !keyword) {
    alert('검색 기준과 키워드를 모두 입력해주세요.')
    return
  }

  let url = ''
  const params = {}

  if (type === 'email') {
    url = '/schedules/off/temp/nurse'
    params.email = keyword
  } else if (type === 'name') {
    url = '/schedules/off/temp/nurse/name'
    params.name = keyword
  } else {
    alert('올바른 검색 기준을 선택해주세요.')
    return
  }

  try {
    const { data } = await apiClient.get(url, { params })

    scheduleList.value = data // 컨트롤러에서 Map이 아닌 List만 반환 중
    hasMore.value = false // 페이징 없음
  } catch (err) {
    console.error('검색 실패:', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// ✅ 날짜 포맷 함수: "05월 12일"
const formatKoreanDate = (dateStr) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('MM월 DD일')
}

// ✅ 날짜 범위 포맷 함수: "05월 12일 ~ 05월 14일"
const formatRange = (start, end) => {
  if (!start || !end) return '-'
  return `${formatKoreanDate(start)} ~ ${formatKoreanDate(end)}`
}

// ✅ 날짜+시간 포맷: "2025-05-12 14:00"
const formatDateTime = (dtStr) => {
  if (!dtStr) return '-'
  return dayjs(dtStr).format('YYYY-MM-DD HH:mm')
}

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
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
}

/* 상태별 색상 */
.approved {
  background-color: #d9f5ef; /* 옅은 민트 */
  color: #26a69a; /* 진한 민트 */
}

.rejected {
  background-color: #fbeaea; /* 옅은 빨강 */
  color: #e74c3c;
}

.pending {
  background-color: #fff7e6; /* 옅은 노랑 */
  color: #f39c12;
}

.create-off{
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
.create-off:hover {
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
  