<template>
  <div class="off-schedule-page">
    <h2 class="title">오프 일정 조회</h2>
    <v-card style="width: 75.5vw; background-color: white; padding: 2%; border-radius: 25px;">
    <div class="search-bar">
      <v-select
        v-model="searchType"
        :items="[
          { title: '이메일', value: 'email' },
          { title: '이름', value: 'name' }
        ]"
        label="검색 기준 선택"
        density="compact"
        variant="solo"
        class="small-select no-shadow"
        style="width: 130px; border-radius: 10px; background-color: #edf7ff;"
        hide-details
        flat
        bg-color="#edf7ff"  
      />

      <v-text-field
        v-model="searchKeyword"
        placeholder="검색어를 입력하세요"
        @keydown.enter="fetchListByEmailOrName(searchType, searchKeyword)"
        clearable
        rounded="lg"
        variant="Outlined"
        density="compact"
        append-inner-icon="mdi-magnify"
        @click:append-inner="fetchListByEmailOrName(searchType, searchKeyword)"
        hide-details
        class="small-text-field"
        style="flex: 1"
        bg-color="#edf7ff"
      />
    </div>

    <v-table class="elevation-1" density="comfortable" style="border-radius: 10px; box-shadow: none;">
      <thead>
        <tr style="background-color: #4f72f5;">
          <th class="text-center" style="color: white;">신청한 오프 일정</th>
          <th class="text-center" style="color: white;">작성자</th>
          <th class="text-center" style="color: white;">완료 여부</th>
          <th class="text-center" style="color: white;">최근 수정일자</th>
          <th class="text-center" style="color: white;">취소</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in scheduleList" :key="item.offScheduleTempId">
          <td class="text-center">{{ formatKoreanDate(item.startTime) }}</td>
          <td class="text-center">{{ item.nurseName }}</td>
          <td class="text-center">
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
          <td class="text-center">{{ formatDateTime(item.updatedAt) }}</td>
          <td class="text-center">
            <v-btn
              v-if="item.codeLabel !== '반려'"
              class="cancel-btn"
              size="x-small"
              color="error"
              variant="tonal"
              @click="deleteOff(item.offScheduleTempId)"
            >
              취소
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div class="pagination-bar">
      <div class="pagination">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          color="black"
          size="small"
          @update:modelValue="changePage"
        />
      </div>

      <v-btn
        size="small"
        variant="tonal"
        color="success"
        @click="goToOffCalendar"
      >
        <v-icon size="12" class="mr-1 icon-black" style="vertical-align: middle">mdi-pencil</v-icon>
        <span>오프 신청</span>
      </v-btn>
    </div>
    </v-card>
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

const changePage = (page) => {
  currentPage.value = page;
  if (searchType.value && searchKeyword.value) {
    fetchListByEmailOrName(searchType.value, searchKeyword.value)
  } else {
    fetchList()
  }
}

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
      page: currentPage.value - 1,
    },
  })

  // console.log("📦 응답 데이터:", data)

  let content = []

  if (Array.isArray(data.content)) {
    content = data.content
  } else if (Array.isArray(data.items?.content)) {
    content = data.items.content
  } else {
    console.warn("📛 예상하지 못한 응답 구조:", data)
  }

  scheduleList.value = content

  totalPages.value = data.totalPages
  ?? data.items?.totalPages
  ?? 1;
  hasMore.value = currentPage.value < totalPages.value
}

const fetchListByEmailOrName = async (type, keyword) => {
  if (!type || !keyword) {
    alert('검색 기준과 키워드를 모두 입력해주세요.')
    return
  }

  let url = ''
  const params = {
    type: type,
    keyword: keyword,
    page: currentPage.value - 1
  }

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
    console.log(data);
    
    let content = []

    if (Array.isArray(data.content)) {
      content = data.content
      totalPages.value = data.totalPages ?? 1
    } else if (Array.isArray(data.items?.content)) {
      content = data.items.content
      totalPages.value = data.items.totalPages ?? 1
    } else {
      console.warn("📛 예상하지 못한 응답 구조:", data)
    }

    
    

    scheduleList.value = content
    currentPage.value = 1 // ✅ 첫 페이지로 초기화
    hasMore.value = currentPage.value < totalPages.value

    

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
  /* .off-schedule-page {
    padding: 24px;
    background: white;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
                -2px -2px 5px rgba(255, 255, 255, 0.8);
    border-radius: 10px;
  } */

  ::v-deep(.small-select .v-field) {
    min-height: 35px !important;
    height: 35px !important;
    font-size: 13px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  ::v-deep(.small-select) {
    max-width: 200px;
    font-size: 13px;
  }

  ::v-deep(.small-text-field .v-field) {
    min-height: 40px !important;
    height: 40px !important;
    font-size: 13px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  ::v-deep(.small-text-field) {
    max-width: 300px;
    font-size: 13px;
  }

  ::v-deep(.small-text-field .v-input__control) {
    min-height: 40px !important;
    height: 40px !important;
  }

  ::v-deep(.small-text-field .v-field__input) {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    padding: 0 15px !important;
    font-size: 13px !important;
    line-height: 1.2 !important;
  }

  ::v-deep(.small-text-field input) {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 36px !important;
    height: 36px !important;
  }

  ::v-deep(.v-table) {
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
  }

/* ::v-deep(.v-table thead th),
::v-deep(.v-table tbody td) {
  border-right: 1px solid #ddd;
} */

::v-deep(.v-table thead th:last-child),
::v-deep(.v-table tbody td:last-child) {
  border-right: none;
}

.highlight-row {
  background-color: #e8ecf8;
}

  .off-schedule-page {
    padding: 24px;
    border-radius: 10px;
    font-family: 'Noto Sans KR', sans-serif;
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
    color: black;
  }
  .search-bar {
    display: flex;  
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    justify-content: flex-end
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
.thead {
  background: rgb(36, 36, 36);
  color: #fff;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  line-height: 1;
  padding: 0 8px;
  height: 40px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;
  font-size: 13px;
}

  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 13px;
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

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.pagination {
  flex: 1;
  display: flex;
  justify-content: center;
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

.custom-btn {
  padding: 4px 8px !important;
  font-size: 12px;
  min-height: 32px !important;
  /* background: linear-gradient(to right, #8d8f91 0%, #828486 100%) !important; */
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
}

  .schedule-table th,
  .schedule-table td {
    padding: 8px;
    text-align: center;
    border: none;
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