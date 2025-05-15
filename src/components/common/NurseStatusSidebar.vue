<template>
  <div class="status-header">
    <div class="status-title-box" @click="toggleOpen">
      <span class="arrow">{{ isOpen ? '▾' : '▸' }}</span>
      <span class="status-title">근무 현황</span>
    </div>
    <button class="edit-btn" @click="showModal = true"> 
      <span class="icon">⚙️</span> 
    </button>
  </div>


  <ul v-if="isOpen" class="status-list">
    <li v-for="nurse in nurses" :key="nurse.name">
      <span class="nurse-name">{{ nurse.name }}</span>
      <span class="status-indicator">
        <span class="dot" :class="getColor(nurse.workingStatus)"></span>
        <span class="status-label">{{ getLabel(nurse.workingStatus) }}</span>
      </span>
    </li>
  </ul>

    <!-- 모달 팝업 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h4>근무 상태 수정</h4>
        <div class="modal-content">
          <input type="text" v-model="form.email" placeholder="간호사 이메일" />
          <input type="password" v-model="form.password" placeholder="비밀번호" />
          <select v-model="form.workingStatus">
            <option value="ON">근무 중</option>
            <option value="OFF">오프</option>
            <option value="IN_SURGERY">수술 중</option>
          </select>
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button @click="submitStatus">확인</button>
          <button @click="closeModal">취소</button>
        </div>
      </div>
    </div>

</template>
<script setup>

import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'

const nurses = ref([])
const isOpen = ref(true)
const showModal = ref(false)
const errorMessage = ref('')
const form = ref({
  email: '',
  password: '',
  workingStatus: 'ON',
})

const toggleOpen = () => (isOpen.value = !isOpen.value)

const fetchStatus = async () => {
  const res = await apiClient.get('/nurses/status')
  nurses.value = res.data
}

const getColor = (status) => {
  if (status === 'IN_SURGERY') return 'pink'
  if (status === 'ON') return 'blue'
  return 'gray'
}
const getLabel = (status) => {
  if (status === 'IN_SURGERY') return '수술 중'
  if (status === 'ON') return '근무 중'
  return '오프'
}

const closeModal = () => {
  showModal.value = false
  form.value = { email: '', password: '', workingStatus: 'ON' }
  errorMessage.value = ''
}

const submitStatus = async () => {
  try {
    const res = await apiClient.post('/nurses/status', form.value)
    if (res.status === 200) {
      await fetchStatus()
      closeModal()
    }
  } catch (err) {
    errorMessage.value = '⚠️ 비밀번호가 틀렸거나 오류가 발생했습니다.'
  }
}

onMounted(fetchStatus)
</script>


<style>
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.arrow {
  font-size: 14px;
}
.status-title {
  font-size: 16px;
  font-weight: bold;
}
.status-list li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.nurse-name {
  font-weight: bold;
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.pink { background-color: #f06292; }
.blue { background-color: #64b5f6; }
.gray { background-color: #b0bec5; }


.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.edit-btn {
  padding: 6px 12px;
  color: white;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.edit-btn:hover {
  background: transparent;
}
.edit-btn .icon {
  font-size: 20px; /* 원하는 크기로 조절 (예: 24px, 28px 등) */
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

.modal h4 {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.modal input,
.modal select {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.modal-actions button:first-child {
  background-color: #64b5f6;
  color: white;
}

.modal-actions button:last-child {
  background-color: #eee;
  color: #333;
}

.error-msg {
  color: red;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

</style>