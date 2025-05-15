<template>
  <div class="member-list-page">
    <h2 class="title">계정 목록</h2>

    <div class="search-bar">
      <input v-model="keyword" placeholder="검색어를 입력하세요" />
      <button @click="fetchMembers">검색</button>
    </div>

    <table class="member-table">
      <thead>
      <tr>
        <th>병원명</th>
        <th>분류</th>
        <th>진료과</th>
        <th>아이디</th>
      </tr>
      </thead>
      <tbody>
      <MemberItem
        v-for="(m, idx) in members"
        :key="m.id"
        :member="m"
        :index="offset + idx + 1"
        @deleted="fetchMembers"
        @updated="fetchMembers"
      />
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="page===1" @click="changePage(page-1)">&lt;</button>
      <button
        v-for="p in totalPages"
        :key="p"
        :class="{ active: page===p }"
        @click="changePage(p)"
      >{{ p }}</button>
      <button :disabled="page===totalPages" @click="changePage(page+1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient         from '@/api/axios.js'
import MemberItem        from './MemberItem.vue'

const members    = ref([])
const keyword    = ref('')
const page       = ref(1)
const size       = ref(10)
const totalPages = ref(1)

const offset = computed(() => (page.value - 1) * size.value)

const fetchMembers = async () => {
  const { data } = await apiClient.get('/api/v1/members', {
    params: { page: page.value, size: size.value, keyword: keyword.value }
  })
  members.value    = data.items
  totalPages.value = data.totalPages
}

const changePage = (p) => {
  page.value = p
  fetchMembers()
}

onMounted(fetchMembers)
</script>

<style scoped>
.member-list-page {
  padding: 24px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  border-bottom: none;
}

.search-bar {
  max-width: 500px;
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

.search-bar button {
  padding: 8px 16px;
  background: #1b9aaa;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.member-table th,
.member-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
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
</style>
