<template>
    <div class="nurse-list-page">
        <h2 class="title">간호사 목록</h2>

        <div class="search-bar">
            <select v-model="searchOption">
                <option value="NAME">이름</option>
                <option value="EMAIL">이메일</option>
            </select>

            <input
            v-model="keyword"
            @keyup.enter="fetchNurses"
            type="text"
            placeholder="검색어 입력"
            />
            <button @click="fetchNurses">검색</button>
        </div>

        <table class="nurse-table">
            <thead>
                <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th style="text-align: center">관리</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="nurse in nurses" :key="nurse.email">
                    <td>{{ nurse.name }}</td>
                    <td>{{ nurse.email }}</td>
                    <td class="actions">
                        <button @click="editNurse(nurse)">수정</button>
                        <button class="delete" @click="deleteNurse(nurse)">삭제</button>
                    </td>
                </tr>
            </tbody>
        </table>

    <div class="pagination">
        <button :disabled="page === 0" @click="page--">이전</button>
        <span>{{ page + 1 }} / {{ totalPages }}</span>
        <button :disabled="page + 1 >= totalPages" @click="page++">다음</button>
    </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import apiClient from '@/api/axios'
import router from '@/router'

const nurses = ref([])
const page = ref(0)
const totalPages = ref(1)

const keyword = ref('')
const searchOption = ref('NAME') 

const fetchNurses = async () => {
try {
    const res = await apiClient.get('/nurses', {
    params: {
        keyword: keyword.value,
        searchOption: searchOption.value,
        page: page.value,
        size: 10,
    },
    })
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
    if (!confirm(`${nurse.name} 간호사를 정말 삭제할까요?`)) return
    try {
        await apiClient.delete(`/nurses/${nurse.id}`)
        alert('삭제되었습니다.')
        fetchNurses()
    } catch (e) {
        alert('삭제 실패')
        console.error(e)
    }
}

watch(page, fetchNurses, { immediate: true })
</script>

<style scoped>
.nurse-list-page {
padding: 40px 20px;
max-width: 1000px;
margin: 0 auto;
background-color: #fff;
min-height: 100vh;
}

.title {
font-size: 28px;
font-weight: bold;
margin-bottom: 30px;
color: #333;
border-bottom: 2px solid #e0e0e0;
padding-bottom: 10px;
}

.search-bar {
display: flex;
gap: 12px;
margin-bottom: 24px;
}

.search-bar input,
.search-bar select {
padding: 10px 16px;
border: 1px solid #ccc;
border-radius: 24px;
font-size: 15px;
background-color: white;
}

.search-bar button {
background-color: #d6e9f8;
border: none;
padding: 10px 20px;
border-radius: 20px;
font-weight: 600;
cursor: pointer;
transition: background 0.2s;
}

.search-bar button:hover {
background-color: #c3ddf4;
}

.nurse-table {
width: 100%;
border-collapse: collapse;
margin-bottom: 20px;
}

.nurse-table th,
.nurse-table td {
padding: 14px 16px;
border-bottom: 1px solid #eee;
text-align: left;
font-size: 15px;
}

.actions {
display: flex;
gap: 8px;
justify-content: center;
}

.actions button {
padding: 6px 12px;
border: none;
border-radius: 6px;
font-weight: 500;
cursor: pointer;
background-color: #f0f8ff;
transition: background 0.2s;
}

.actions button:hover {
background-color: #e1efff;
}

.actions .delete {
background-color: #ffe0e0;
}

.actions .delete:hover {
background-color: #ffc9c9;
}

.pagination {
display: flex;
justify-content: center;
align-items: center;
gap: 16px;
margin-top: 30px;
}

.pagination button {
padding: 8px 16px;
border: none;
background-color: #d6e9f8;
border-radius: 20px;
cursor: pointer;
font-weight: 600;
}

.pagination button:disabled {
background-color: #eee;
cursor: not-allowed;
}
</style>
