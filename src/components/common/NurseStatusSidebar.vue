<template>
  <div class="status-border">
  <div class="status-header">
    <div class="status-title-box" @click="toggleOpen">
      <span class="arrow">{{ isOpen ? '▾' : '▸' }}</span>
      <span class="status-title"> 근무 현황</span>
    </div>
    <button class="edit-btn" @click="showModal = true"> 
      <span class="icon">⚙️</span> 
    </button>
  </div>


  <ul class="status-list" v-if="isOpen">
  <li v-for="nurse in nurses" :key="nurse.id">
    <span class="nurse-name">{{ nurse.name }}</span>
    <span class="status-indicator">
      <span class="dot" :class="getColor(nurse.codeLabel)"></span>
      <span class="status-label">{{ nurse.codeLabel }}</span>
    </span>
  </li>
</ul>


    <!-- 모달 팝업 -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h4>근무 상태 수정</h4>

      <!-- 간호사 이름 검색 -->
      <input
        type="text"
        v-model="nurseSearch"
        placeholder="간호사 이름 검색"
        class="search-input"
      />

      <!-- 간호사 선택 드롭다운 -->
      <select v-model="selectedNurseId">
        <option disabled :value="null">간호사를 선택하세요</option>
        <option
          v-for="nurse in filteredNurses"
          :key="nurse.id"
          :value="nurse.id"
        >
          {{ nurse.name }}
        </option>
      </select>


        <!-- 비밀번호 입력 -->
        <input type="password" v-model="form.password" placeholder="비밀번호" />

        <!-- 상태 선택 -->
        <select v-model="form.codeLabel">
          <option value="ON">근무 중</option>
          <option value="OFF">오프</option>
          <option value="IN_SURGERY">수술 중</option>
        </select>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button @click="submitStatus">확인</button>
          <button @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
</template>


<script setup>

import { ref, onMounted, reactive, onBeforeUnmount, computed } from 'vue'
import apiClient from '@/api/axios'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'

const nurseSearch = ref('')
const nurses = ref([])
const showModal = ref(false)
const errorMessage = ref('')
const toastMessage = ref('')
const selectedNurseId = ref(null)
const isOpen = ref(true)
const toggleOpen = () => (isOpen.value = !isOpen.value)
let stompClient = null;

// websocket 연결 및 구독
const connectWebSocket = () => {
  const socket = new SockJS('https://api.gandalp-service.com/connect')
  // const socket = new SockJS('http://localhost:8080/connect')
  stompClient = Stomp.over(socket)

  stompClient.connect({
    Authorization: 'Bearer ' + localStorage.getItem('accessToken')
  }, () => {
    console.log('STOMP 연결됨')

    stompClient.subscribe('/topic/nurse-status', (message) => {
      const data = JSON.parse(message.body)
      console.log('📡 상태 갱신 수신:', data)
      nurses.value = data
    })

  })
}



const filteredNurses = computed(() => {
  if (!nurseSearch.value.trim()) {
    return nurses.value // 🔁 검색어 없으면 전체 반환
  }
  return nurses.value.filter((nurse) =>
    nurse.name.toLowerCase().includes(nurseSearch.value.toLowerCase())
  )
})



const form = reactive({
  password: '',
  codeLabel: 'ON',
})

const fetchStatus = async () => {
  const res = await apiClient.get('/nurses/status')
  nurses.value = res.data
}

const getColor = (status) => {
  if (status === '수술 중') return 'pink'
  if (status === '근무 중') return 'blue'
  return 'gray'
}


const closeModal = () => {
  showModal.value = false
  selectedNurseId.value = null
  form.password = ''
  form.codeLabel = 'ON'
  errorMessage.value = ''
}

const showToast = (message) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

const submitStatus = async () => {
  try {


    const payload = {
      nurseId: selectedNurseId.value,
      password: form.password,
      workingStatus: form.codeLabel
    }

    console.log(payload)
    const res = await apiClient.post('/nurses/status', payload)

    if (res.status === 200) {
      await fetchStatus()
      closeModal()
      showToast('근무 상태가 수정되었습니다! ')
    }
  } catch (err) {
    if(err.response && err.response.status === 401 ){
      errorMessage.value = '비밀번호가 틀렸습니다.'
    } else{
      errorMessage.value = '오류가 발생했습니다.'
    }
    
  }
}

onMounted(() => {
  fetchStatus()
  connectWebSocket()
})

onBeforeUnmount(() => {
  if(stompClient) {
    stompClient.disconnect(() => {
      console.log('🔌 STOMP 연결 해제')
    })
  }
})



</script>

<style>
.status-border {
  border: #ddd solid 1px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

}
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.arrow {
  margin-left: 13px;
  font-size: 18px;
}
.status-title-box {
  padding-top: 10px;
}
.status-title {
  font-size: 16px;
  font-weight: bold;
  padding-left: 16px;
}


.status-label {
  width: 60px;
  
}


.status-list li {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  font-size: 12px;
  align-items: center;
  gap: 20px;
  padding-left: 10%;
}
.nurse-name {
  font-weight: normal;
  font-size: 11px;
}
.status-indicator {
  padding-left: 15%;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.pink {
  background-color: #f06292;
}
.blue {
  background-color: #64b5f6;
}
.gray {
  background-color: #b0bec5;
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
.edit-btn .icon {
  font-size: 20px; /* 원하는 크기로 조절 (예: 24px, 28px 등) */
  display: flex;
  align-items: center;
  justify-content: center;
}

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

/* ✅ 토스트 메시지 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>