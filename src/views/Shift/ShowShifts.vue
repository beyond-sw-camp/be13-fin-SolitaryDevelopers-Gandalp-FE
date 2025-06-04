<template>
  <div class="shift-exchange-page">
    <h2 class="title">교대근무 교환 게시판</h2>
      <v-card style="width: 75.5vw; background-color: white; padding: 2%; border-radius: 25px;">
        <div class="search-bar">
          <v-select
            v-model="searchType"
            :items="searchOptions"
            density="compact"
            variant="solo"
            label="검색 기준 선택"
            class="small-select no-shadow"
            style="width: 130px; border-radius: 10px; background-color: #edf7ff;"
            hide-details
            flat
            bg-color="#edf7ff"
          />
          
          <v-text-field
            v-model="searchKeyword"
            placeholder="교대 타임을 입력하세요"
            @keydown.enter="onSearchClick"
            clearable
            rounded="lg"
            variant="Outlined"
            density="compact"
            append-inner-icon="mdi-magnify"
            @click:append-inner="onSearchClick"
            hide-details
            class="small-text-field"
            style="flex: 1;"
            bg-color="#edf7ff"
            
          />
        </div>

        <v-table class="elevation-1" density="comfortable" style="border-radius: 10px;">
          <thead>
            <tr style="background-color: #4f72f5;">
              <th class="text-center" style="color: white;">바꿀 교대 타임</th>
              <th class="text-center" style="color: white;">상태</th>
              <th class="text-center" style="color: white;">작성자</th>
              <th class="text-center" style="color: white;">작성일자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in shiftList" :key="item.boardId"
            :class="{ 'disabled-row': item.boardStatusLabel === '요청 수리됨' }">
              <td
      class="content-cell"
      :class="{ 'disabled-cell': item.boardStatusLabel === '요청 수리됨' }"
      :style="item.boardStatusLabel === '요청 수리됨' ? 'pointer-events: none; color: #aaa; cursor: not-allowed;' : 'cursor: pointer;'"
      @click="item.boardStatusLabel === '요청 수리됨' ? null : goToDetails(item.boardId)"
    >
      {{ item.content }}
    </td>
    <td
  class="text-center boardStatusLabel"
  :style="item.boardStatusLabel === '요청 대기중'
    ? 'cursor: pointer;'
    : 'pointer-events: none; cursor: not-allowed;'"
  @click="item.boardStatusLabel === '요청 대기중' ? goToDetails(item.boardId) : null"
>
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

        <td class="text-center"
          :style="item.boardStatusLabel === '요청 수리됨' ? 'pointer-events: none; cursor: not-allowed; color: #aaa;' : 'cursor: pointer;'"
          @click="item.boardStatusLabel === '요청 수리됨' ? null : goToDetails(item.boardId)"
        >{{ item.nurseName }}</td>

            <td class="text-center"
              :style="item.boardStatusLabel === '요청 수리됨' ? 'pointer-events: none; cursor: not-allowed; color: #aaa;' : 'cursor: pointer;'"
              @click="item.boardStatusLabel === '요청 수리됨' ? null : goToDetails(item.boardId)"
            >
              {{ formatDateTime(item.createdAt) }}
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
            @click="goToCreateShift"
          >
            <v-icon size="12" class="mr-1 icon-black" style="vertical-align: middle">mdi-pencil</v-icon>
            <span>작성</span>
          </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import dayjs from 'dayjs'
import { mdiAccount, mdiLogout } from '@mdi/js'

const boardId = ref('')
const shiftList = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchType = ref('')
const searchKeyword = ref('')
const router = useRouter()

const searchOptions = [
  { title: '바꿀 교대 타임', value: 'content' }
];

const headers = [
  { text: '바꿀 교대 타임', value: 'content', align: 'start' },
  { text: '상태', value: 'boardStatusLabel' },
  { text: '작성자', value: 'nurseName' },
  { text: '작성일자', value: 'updatedAt' },
];

// 글 등록 페이지로 이동
const goToCreateShift = () => {
  router.push({ name: 'create-shiftchange' })
}

// 글 상세보기 페이지로 이동
const goToDetails = (boardId) => {
  if (!boardId) {
    alert('게시글 번호가 없습니다.')
    return
  }
  router.push({ name: 'ShiftExchangeDetails', params: { boardId } })
}

// 페이지 변경
const changePage = (page) => {
  if (searchKeyword.value) {
    fetchListByContent(page);
  } else {
    fetchList(page);
  }
};

// 교대 요청 글 목록 기본 조회
const fetchList = async (page = 1) => {
  try {
    const { data } = await apiClient.get('/shifts', {
      params: {
        page: page - 1,
        size: 10
      },
    });
    console.log('전체 목록 응답:', data);               
    console.log('totalPages:', data.totalPages);    
    console.log('shiftList:', shiftList.value);

    shiftList.value = data.content;
    totalPages.value = data.page.totalPages;
    currentPage.value = page;
  } catch (err) {
    alert('목록 조회 중 오류가 발생했습니다.');
    console.error(err);
  }
};

// 교대 요청 글 검색 & 조회
const fetchListByContent = async (page = 1) => {
  if (!searchType.value || !searchKeyword.value) {
    alert('검색 기준과 키워드를 모두 입력해주세요.');
    return;
  }
  try {
    const { data } = await apiClient.get('/shifts/search', {
      params: {
        keyword: searchKeyword.value,
        searchOption: searchType.value.toUpperCase(),
        page: page - 1,
        size: 10
      },
    });
    console.log('검색 목록 응답:', data);              
    console.log('totalPages:', data.totalPages);
    console.log('shiftList:', shiftList.value);

    shiftList.value = data.content;
    totalPages.value = data.page.totalPages;   
    currentPage.value = page;
  } catch (err) {
    alert('검색 중 오류가 발생했습니다.');
    console.error(err);
  }
};


// 검색 버튼 클릭 시 1페이지부터 검색
const onSearchClick = () => {
  fetchListByContent(1);
};

onMounted(() => fetchList(1));

// 날짜+시간 포맷: "2025-05-12 14:00"
const formatDateTime = (dtStr) => {
  if (!dtStr) return '-'
  return dayjs(dtStr).format('YYYY-MM-DD HH:mm')
}

</script>


  
  <style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

h2.title {
  border-bottom: none !important;
  box-shadow: none !important;
  color: #000 !important;
}
h2.title::after,
h2.title::before {
  display: none !important;
}



.shift-exchange-page {
  padding: 24px;
  border-radius: 10px;
  font-family: 'Noto Sans KR', sans-serif;
}

.title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 5px;
  color: black;
}

/* .search-icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-right: 4px;
} */

/*.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: flex-end;
}*/

.search-bar {
  display: flex;  
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  justify-content: flex-end
}


::v-deep(.v-table tbody tr.disabled-row:hover) {
  background-color: inherit !important;
}


::v-deep(.v-table tbody tr:hover) {
  background-color: #e5edf9;
}

::v-deep(.small-select .v-field) {
  min-height: 35px !important;
  height: 40px !important;
  font-size: 13px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-radius: 8px;
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

::v-deep(.v-overlay-container .v-list .v-list-item) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  font-size: 13px !important;
}

.search-bar select,
.search-bar input {
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15),
              -2px -2px 5px rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 11px;
  transition: all 0.2s ease-in-out;
  outline: none;
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
  background-color: rgba(0, 0, 0, 0.2);
  color: white !important;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.shift-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 13px;
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

.shift-table th,
.shift-table td {
  padding: 8px;
  text-align: center;
  border: none;
}

.content-cell {
  text-align: center;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
}


/* 상태 뱃지 스타일 */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
  
}

.completed {
  color: #26a69a;
}
.waiting {
  color: #f39c12;
}

.write-post {
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
  float: right;
  margin-bottom: 10px;
}

.write-post:hover {
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

.custom-btn {
  padding: 4px 8px !important;
  font-size: 12px;
  min-height: 32px !important;
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
}
  </style>

  <style>
.v-overlay .v-list-item {
  min-height: 5px !important;
  font-size: 11px !important;
}
</style> 
