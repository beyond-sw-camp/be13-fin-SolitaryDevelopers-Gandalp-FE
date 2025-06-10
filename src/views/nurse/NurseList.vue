<template>
<div class="nurse-list-page">
    <h2 class="title">간호사 목록</h2>

    <v-card style="width: 75.5vw; background-color: white; padding: 2%; border-radius: 25px; ">
      <div class="search-bar">
        <v-select
            v-model="searchOption"
            :items="searchOptions"
            item-title="label"                       
            item-value="value"  
            label="검색 기준 선택"
            class="small-select no-shadow"
            variant="solo"
            density="compact"
            hide-details
            style="border-radius: 10px; background-color: #edf7ff;"
            flat
            bg-color="#edf7ff"
            />

            <v-text-field
            v-model="keyword"
            placeholder="검색어를 입력하세요"
            @keydown.enter="fetchNurses"
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

    <table class="nurse-table">
        <thead>
        <tr>
            <th>타입</th>
            <th>이름</th>
            <th>이메일</th>
            <th style="text-align: center">관리</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="nurse in nurses" :key="nurse.email">
            <td> {{ nurse.codeLabel }}</td>
            <td>{{ nurse.name }}</td>
            <td>{{ nurse.email }}</td>
            <td class="actions">
              <div class="modal-btns">
                <v-btn size="small" variant="tonal" color="primary" @click="editNurse(nurse)">수정</v-btn>
                <v-btn size="small" variant="tonal" color="error" class="ml-2" @click="deleteNurse(nurse)">삭제</v-btn>
              </div>
            </td>
        </tr>
        </tbody>
    </table>
    <div class="pagination-bar">
          <div class="pagination">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              color="black"
              size="small"
              @update:modelValue="fetchNurses" 
            />
          </div>
          </div>
    </v-card>
</div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import apiClient from '@/api/axios'
import router from '@/router'

const nurses = ref([])
const page = ref(1)
const totalPages = ref(1)

const keyword = ref('')
const searchOption = ref('NAME') 

const searchOptions = [
    { label: '이름', value: 'NAME' },
    { label: '이메일', value: 'EMAIL' },
    { label: '타입', value: 'TYPE' },
]

const fetchNurses = async () => {
try {
    const res = await apiClient.get('/nurses', {
    params: {
        keyword: keyword.value,
        searchOption: searchOption.value,
        page: page.value - 1,
        size: 10,
    },
    })
    console.log('nurses = ', res.data.content);
  console.log('totalElements = ', res.data.total);

    nurses.value = res.data.content
    totalPages.value = res.data.totalPages
} catch (e) {
    alert('간호사 목록 불러오기 실패')
    console.error(e)
}
}

const editNurse = (nurse) => {
  router.push({ name: 'UpdateNurse', params: { id: nurse.id } })
} 

const deleteNurse = async (nurse) => {
    if (!confirm(`${nurse.name} 간호사를 정말로 삭제하시겠습니까?`)) return
    try {
        await apiClient.delete(`/nurses/${nurse.id}`)
        alert('삭제되었습니다.')
        fetchNurses()
    } catch (e) {
        alert('삭제 실패')
        console.error(e)
    }
}

const changePage = (p) => {
  page.value = p
}
onMounted(() => {
  fetchNurses();
});
</script>

<style scoped>
.nurse-list-page {
  padding: 24px;
  padding-left: 26px;
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
  justify-content: flex-end;
}

/* small-text-field 전체 커스텀 */
::v-deep(.small-text-field) {
  max-width: 300px;
  font-size: 13px;
}

::v-deep(.small-text-field .v-field) {
  min-height: 40px !important;
  height: 40px !important;
  font-size: 13px !important;
  padding: 0 12px !important;
  border-radius: 8px;
  background-color: #edf7ff !important;
  box-shadow: none !important;
}

::v-deep(.small-text-field .v-input__control) {
  min-height: 40px !important;
  height: 40px !important;
}

::v-deep(.small-text-field .v-field__input) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
}

::v-deep(.small-text-field input) {
  margin: 0 !important;
  padding: 0 !important;
  height: 36px !important;
  line-height: 36px !important;
  font-size: 13px !important;
  background-color: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* small-select 공통 스타일 */
::v-deep(.small-select) {
  font-size: 13px;
  max-width: 200px;
}

::v-deep(.small-select .v-field) {
  min-height: 40px !important;
  height: 40px !important;
  font-size: 13px !important;
  padding: 0 12px !important;
  border-radius: 8px;
  background-color: #edf7ff !important;
}

/* 테이블 및 버튼 */
.nurse-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  table-layout: fixed;
}

.nurse-table th,
.nurse-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 15px;
}

.modal-btns {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  justify-content: center;
  width: 100%;
}

.modal-btns button {
  min-width: 70px;
  height: 32px;
  border: none;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s;
}

.modal-btns button:hover {
  background: #bfc7cc;
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
</style>