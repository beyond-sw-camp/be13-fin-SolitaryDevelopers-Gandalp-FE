<template>
    <div class="off-schedule-page">
      <h2 class="title" style="color: black;">오프 일정 조회</h2>
  
      <div class="search-bar">
        <select class="search-option" v-model="searchType">
          <option disabled value="">검색 기준 선택</option>
          <option value="email">이메일</option>
          <option value="name">이름</option>
        </select>
        <input class="search-input" v-model="searchKeyword" placeholder="검색어를 입력하세요" />
        <button class="search-btn" @click="fetchListByEmailOrName(searchType, searchKeyword)">
          <!-- <div style="color: #a0adb4;"> -->
            검색
          <!-- </div> -->
        </button>
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
  <tbody class="tbody">
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
<div style="display: flex; justify-content: flex-end; margin-top: 8px;">
  <button class="create-off" @click="goToOffCalendar">오프 신청</button>
</div>
  
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
import { useRouter } from 'vue-router'

const router = useRouter()

const totalPages = ref(1)
const searchType = ref('')
const searchKeyword = ref('')
const scheduleList = ref([])
const currentPage = ref(1)
const hasMore = ref(true)

const goToOffCalendar = () => {
  router.push({ path: '/OffCalendar' })
}

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

  scheduleList.value = data.items.filter(item => item && item.offScheduleTempId)
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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');
  .off-schedule-page {
    padding: 24px;
    background: white;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
                -2px -2px 5px rgba(255, 255, 255, 0.8); /* 양쪽 그림자 효과 */
    border-radius: 10px;
  }
  .tbody {
    font-family: 'Noto-sans KR', sans-serif;
    font-size: 12px;
  }
  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 5px;
  }
  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    margin-left:957px;
  }
  .search-input {
    border: 1px solid #ddd;
    background: #fff;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
                -2px -2px 5px rgba(255, 255, 255, 0.8); /* 양쪽 그림자 효과 */
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 11px;
    transition: all 0.2s ease-in-out;
    outline: none;
  }
  .search-option {
    border: 1px solid #ddd;
    background: #fff;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
                -2px -2px 5px rgba(255, 255, 255, 0.8); /* 양쪽 그림자 효과 */
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 11px;
    transition: all 0.2s ease-in-out;
    outline: none;
  }
  .thead{
    /* background: linear-gradient(to right, #dee5ef 0%, #dee5ef 100%); */
    background: rgb(36, 36, 36);
    border: none;
    color: #fff;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    
    line-height: 1;
    padding: 0 8px;

    height: 40px;

    font-family: "Noto Sans KR", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-size: 13px; 
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
  /* background-color: #d9f5ef; */
  color: #26a69a; /* 진한 민트 */
}

.rejected {
  /* background-color: #fbeaea;  */
  color: #e74c3c;
}

.pending {
  /* background-color: #fff7e6;  */
  color: #f39c12;
}
.create-off {
  height: 36px;
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
  border: none;
  color: #000;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 16px;
  transition: all 0.2s ease-in-out;
  align-self: flex-end;
}

.create-off:hover {
  /* background: linear-gradient(to right, #8CCEF0 0%, #A0E4FF 100%); */
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.search-btn {
  height: 32px;
  min-width: 70px;
  background: white;
  border: 1.3px solid #a0adb4;
  font-size: 0.85rem;
  font-weight: normal;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 12px;
  transition: all 0.2s ease-in-out;
  margin-top: 2px;
}

.search-btn:hover {
  background-color: rgba(0, 0, 0, 0.2) ;
  color: white  !important;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}



  .schedule-table th,
  .schedule-table td {
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
  border-color: #a9adb4;
  color: #a9adb4;
}

.page-btn.active {
  border: 2px solid #a9adb4;
  color: #a9adb4;
  font-weight: bold;
}

.page-btn:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}
.cancel-btn {
  height: 25px;
  min-width: 60px;
  background: linear-gradient(to right, #f1dfdf 0%, #f1dfdf  100%);
  border: none;
  color: #000;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0 8px;
  transition: all 0.2s ease-in-out;
}

.cancel-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}


  </style>
  