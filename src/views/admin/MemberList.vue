<template>
  <div class="member-list-page">
    <h2 class="title">계정 목록</h2>

    <v-card style="width: 75.5vw; background-color: white; padding: 2%; border-radius: 25px;">


    <!--  검색바-->
    <form class="search-bar"
          @submit.prevent="onSearch"
          @keydown.enter.prevent="onSearch"
    >

<!--      <select v-model="selectedType">-->
<!--        <option value="">전체 타입</option>-->
<!--        <option v-for="t in types" :key="t.value" :value="t.value">-->
<!--          {{ t.label }}-->
<!--        </option>-->
<!--      </select>-->

<!--      <select v-model="selectedOption">-->
<!--        <option value="">전체 검색</option>-->
<!--        <option v-for="opt in options" :key="opt.value" :value="opt.value">-->
<!--          {{ opt.label }}-->
<!--        </option>-->
<!--      </select>-->


<!--      <input v-model="keyword"-->
<!--             placeholder="검색어를 입력하세요" />-->

<!--      <button class=search-btn type="submit">검색</button>-->
    <div class="search-container">
      <div>
          <v-select
            v-model="selectedType"
            :items="types"
            item-value="value"
            item-title="text"
            density="compact"
            variant="solo"
            label="검색 타입"
            class="small-select no-shadow"
            style="width: 130px; border-radius: 10px; background-color: #edf7ff;"
            hide-details
            flat
            bg-color="#edf7ff"
          />
        </div>

      <div>
          <v-select
            v-model="selectedOption"
            :items="options"
            item-value="value"
            item-title="text"
            density="compact"
            variant="solo"
            label="검색 기준"
            class="small-select no-shadow"
            style="width: 200px; border-radius: 10px; background-color: #edf7ff;"
            hide-details
            flat
            bg-color="#edf7ff"
          />
        </div>

      <div>
          <v-text-field
            v-model="keyword"
            placeholder="검색어를 입력하세요"
            density="compact"
            variant="Outlined"
            rounded="lg"
            clearable
            append-inner-icon="mdi-magnify"
            @click:append-inner="onSearch"
            hide-details
            class="small-text-field"
            style="width: 400px; border-radius: 10px; background-color: #edf7ff;"
            bg-color="#edf7ff"
          />
        </div>

<!--        <div>-->
<!--          <v-btn class="search-btn" color="primary" @click="onSearch" small>검색</v-btn>-->
<!--        </div>-->

      </div>
    </form>

    <div class="table-container">
      <table class="member-table">
        <thead>
        <tr>
          <th></th>
          <th>병원명</th>
          <th>분류</th>
          <th>진료과</th>
          <th>아이디</th>
          <th></th>
        </tr>
        </thead>
        <tbody v-if="loading">
        <tr>
          <td :colspan="6" class="loading-cell">데이터를 불러오는 중...</td>
        </tr>
        </tbody>
        <tbody v-else>
        <MemberItem
          v-for="(m, idx) in members"
          :key="m.id"
          :member="m"
          :index="offset + idx + 1"
          @deleted="fetchMembers"
          @edit="onMemberEdit"
        />

        <tr v-if="!loading && members.length === 0">
          <td :colspan="6" class="empty-cell">검색 결과가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <div v-if="loading" class="overlay">
        <div class="spinner">로딩 중</div>
      </div>
    </div>


    <MemberUpdateModal
      v-if="editingMember"
      :model-value="editingMember"
      @update:modelValue="editingMember = $event"
      @saved="fetchMembers"
      @closed="editingMember = null"
    />

<!--    <div class="pagination">-->
<!--      <button :disabled="page===1" @click="changePage(page-1)">&lt;</button>-->
<!--      <button-->
<!--        v-for="p in totalPages"-->
<!--        :key="p"-->
<!--        :class="{ active: page===p }"-->
<!--        @click="changePage(p)"-->
<!--      >{{ p }}</button>-->
<!--      <button :disabled="page===totalPages" @click="changePage(page+1)">&gt;</button>-->
<!--    </div>-->

      <div class="pagination-bar">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          color="black"
          size="small"
          @update:modelValue="changePage"
        />
      </div>


    </v-card>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient         from '@/api/axios.js'
import MemberItem        from './MemberItem.vue'
import MemberUpdateModal from './MemberUpdateModal.vue'
const members    = ref([])
const editingMember = ref(null)
const keyword    = ref('')
const page       = ref(1)
const size       = ref(10)
const totalPages = ref(1)
const selectedType  = ref('')
const selectedOption= ref('')

const types = [
  { value: '',           text: '전체' },
  { value: 'ADMIN',      text: '관리자' },
  { value: 'PARAMEDIC',  text: '응급요원' },
  { value: 'HEAD_NURSE', text: '수간호사' },
  { value: 'NURSE',      text: '간호사' },
]

const options = [
  { value: '',           text: '전체 검색' },
  { value: 'HOSPITAL',   text: '병원명' },
  { value: 'DEPARTMENT', text: '진료과' },
  { value: 'ACCOUNT_ID', text: '아이디' },
]

const offset = computed(() => (page.value - 1) * size.value)
const loading = ref(false)

const onMemberEdit = (member) => {
  // 기존 데이터 들어있음
  editingMember.value = { ...member }
}

const onSearch = () => {
  page.value = 1
  fetchMembers()
}

const fetchMembers = async () => {
  if (!members.value.length) loading.value = true
  try {
    const response = await apiClient.get('/members', {
      params: {
        page: page.value - 1,
        size: size.value,
        keyword: keyword.value || undefined,
        type:      selectedType.value || undefined,
        option:    selectedOption.value || undefined,
      }
    })
    console.log('[fetchMembers] response:', response)
    console.log('[fetchMembers] data:', response.data)
    const { content, page: pg } = response.data
    members.value = content // 리스트
    totalPages.value = pg.totalPages // 총 페이지 수
    page.value = pg.number + 1 // 기본 0이라 1로
  } catch (err) {
    members.value = []
    console.error('[fetchMembers] error:', err)
    if (err.response) {
      console.error(
        `[fetchMembers] status ${err.response.status}`,
        err.response.data
      )
    }
  } finally{
    loading.value = false
  }
}

const changePage = (p) => {
  if(p < 1 || p > totalPages.value) return
  page.value = p
  fetchMembers()
}

onMounted(fetchMembers)
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

.title {
  width: 75.5vw;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 5px;
  color: black;
}


.member-list-page {
  padding: 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 30px;
  justify-content: flex-end;
}

.search-container{
  display: flex;
  margin-left: 5px;

}
.search-bar .small-select {
  margin-right: 10px;
}
.search-bar select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 8px;
  background: white;
  font-size: 14px;
}

.search-bar {
  height: 40px;
  max-width: 600px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 30px;
  margin-left: auto;
}
.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  writing-mode: horizontal-tb;
  width:70px;
  padding: 8px 16px;
  background: #1b9aaa;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.loading-cell,
.empty-cell {
  text-align: center;
  padding: 24px;
  color: #666;
}
.table-container { position: relative; } /* [UPDATED] */
.overlay { /* [UPDATED] */
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.member-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 16px;
}
.member-table thead th {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd; /* 헤더 아래 가로선 */
  border-left: none;
  border-right: none;
}
::v-deep .member-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd; /* 본문 각 행 사이 가로선 */

}
.member-table tbody tr:last-child td {
  border-bottom: none;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.page-btn, .pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
.pagination button.active {
  background: #1b9aaa;
  color: white;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.pagination-bar ::v-deep .v-pagination {
  display: flex;
  justify-content: center;
}

.pagination-bar ::v-deep .v-pagination .v-pagination__item {
  min-width: 25px;
  min-height: 25px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  color: #444;
  padding: 0;

}

.pagination-bar::v-deep .v-pagination .v-pagination__item:hover:not(.v-pagination__item--active) {
  border-color: #a9adb4;
  color: #a9adb4;
}

.pagination-bar::v-deep .v-pagination .v-pagination__item--active {
  border: 2px solid #a9adb4;
  color: #a9adb4;
  font-weight: bold;
}

.pagination-bar::v-deep .v-pagination .v-pagination__item:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}

</style>
