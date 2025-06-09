<template>
    <div class="notice-border">
      <div class="notice-header">
        <div class="notice-title-box"  @click="toggleOpen">
          <span class="arrow">{{ isOpen ? '▾' : '▸' }}</span>
          <span class="notice-title"> 공지사항 </span>
        </div>
        <button class="edit-btn" @click="showModal = true"> 
          <span class="icon" v-if="isHeadNurse">⚙️</span> 
        </button>
      </div>



    <!-- 🔽 토글된 경우에만 공지들 보여줌 -->
    <div v-if="isOpen" class="notice-content">
      <h4 class="notice-subtitle">긴급 공지사항</h4>
      <ul class="urgent-notice-list">
        <li v-for="notice in urgentList" :key="notice.noticeId" class="notice-item">
          {{ notice.content }}
          <button class="delete-btn" v-if="isHeadNurse" @click="deleteNotice(notice.noticeId)">🗑️</button>
        </li>
      </ul>


      <h4 class="notice-subtitle">일반 공지사항</h4>
      <ul class="general-notice-list">
        <li v-for="notice in generalList" :key="notice.id" class="notice-item">
          {{ notice.content }}
        </li>
      </ul>
    </div>

    <!-- 📢 공지사항 등록 모달 -->
    <div class="modal" v-if="showModal" @click.self="cancelNotice">
      <div class="modal-content">
        <h4 class="modal-title">📢 공지사항 등록</h4>
        <textarea
          v-model="newNotice"
          placeholder="공지 내용을 입력하세요"
          rows="5"
          class="modal-textarea"/>

        <div class="modal-btns">
              <v-btn size="small" variant="tonal" color="primary" @click="createNotice">등록</v-btn>
              <v-btn size="small" variant="tonal" color="error" @click="cancelNotice">취소</v-btn>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import apiClient from '@/api/axios'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isAdmin = computed(() => auth.userInfo.type === 'ADMIN')
const isHeadNurse = computed(() => auth.userInfo.type === 'HEAD_NURSE')

const isOpen = ref(true)
const toggleOpen = () => (isOpen.value = !isOpen.value)

const urgentList = ref([])
const generalList = ref([])

const showModal = ref(false)
const newNotice = ref('')

const fetchNotices = async () => {
  urgentList.value = (await apiClient.get('/notices/urgent')).data
  generalList.value = (await apiClient.get('/notices/general')).data
  console.log(urgentList.value)

}

const createNotice = async () => {
  if (!newNotice.value.trim()) return alert('내용을 입력하세요')

  try {
    await apiClient.post('/notices', {
      content: newNotice.value,
      codeLabel: '긴급 공지사항',
    })
    alert('등록 완료!')
    newNotice.value = ''
    showModal.value = false
    await fetchNotices()
  } catch (e) {
    alert('등록 실패: ' + e.response?.data || e.message)
  }
}
const cancelNotice = () => {
  newNotice.value = ''
  showModal.value = false
}

const deleteNotice = async (id) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await apiClient.delete(`/notices`, { params: { noticeId: id } });
    alert('삭제 완료!');
    await fetchNotices();
  } catch (e) {
    alert('삭제 실패: ' + (e.response?.data || e.message));
  }
}

onMounted(fetchNotices)
</script>

<style scoped>


.notice-border {
  border: #ddd solid 1px;
  background-color: white;
  border-radius: 10px; 
  box-shadow: 3px 7px 5px rgba(0, 0, 0, 0.1);

}
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.arrow {
  margin-left: 13px;
  font-size: 18px;
}
.notice-title-box {
  padding-top: 10px;
}
.notice-title {
  font-size: 16px;
  font-weight: bold;
  padding-left: 16px;
}


.notice-label {
  width: 60px;
  
}


.notice-content {
  padding: 0 10px 10px;
}

.notice-subtitle {
  margin: 12px 0 6px;
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.urgent-notice-list {
  list-style: none;
  padding-left: 12px;
  margin: 0 0 16px;
  border-left: 2px solid red;
}
.general-notice-list {
  list-style: none;
  padding-left: 12px;
  margin: 0 0 16px;
  border-left: 2px solid blue;
}

.notice-list li {
  margin-bottom: 6px;
  font-size: 13.5px;
  position: relative;
  padding-left: 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}


.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.modal-content textarea {
  width: 100%;
  border-radius: 6px;
  padding: 8px;
  resize: none;
  font-size: 13.5px;
}
.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-btn:hover {
  color: red;
}

</style>
