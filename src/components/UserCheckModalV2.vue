<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-content">
  <div class="modal-title">사용자 인증</div>
  <label>간호사 이름</label>
  <div class="input-autocomplete-wrapper">
    <input
      v-model="name"
      @input="onNameInput"
      :disabled="!!email"
      placeholder="간호사 이름 입력"
      autocomplete="off"
    />
    <ul v-if="showSuggestions && filteredNames.length" class="suggest-list">
      <li v-for="n in filteredNames" :key="n.id || n.email" @click="selectName(n)">
        {{ n.name }}
      </li>
    </ul>
  </div>
          <div class="or-divider">또는</div>
          <label>이메일</label>
          <input
            v-model="email"
            :disabled="!!name"
            placeholder="이메일 입력"
            autocomplete="off"
          />
          <label>비밀번호</label>
          <input type="password" v-model="password" placeholder="비밀번호 입력" />
          <div class="modal-btns">
            <v-btn size="small" variant="tonal" color="primary" @click="submit">확인</v-btn>
            <v-btn size="small" variant="tonal" color="error" class="ml-2" @click="$emit('close')">취소</v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import apiClient from '@/api/axios'
import { defineEmits } from 'vue'
const emit = defineEmits(['submit', 'close'])

const name = ref('')
const email = ref('')
const password = ref('')
const nurseList = ref([])
const showSuggestions = ref(false)


const filteredNames = computed(() =>
  nurseList.value.filter(n => n.name.includes(name.value))
)

async function onNameInput() {
  showSuggestions.value = !!name.value
  // nurseList를 미리 받아오거나, 입력 시마다 검색 API 호출
  if (name.value && nurseList.value.length === 0) {
    const { data } = await apiClient.get('/nurses/get')
    nurseList.value = data
  }
}

function selectName(nurse) {
  name.value = nurse.name
  email.value = nurse.email // 자동으로 이메일 채워넣기
  showSuggestions.value = false
}

function submit() {
  const submitEmail = email.value || (nurseList.value.find(n => n.name === name.value)?.email ?? '')
  if (!submitEmail || !password.value) {
    alert('이메일(또는 이름)과 비밀번호를 입력하세요.')
    return
  }
  emit('submit', { email: submitEmail, password: password.value })
}


</script>

<style scoped>

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw; height: 100vh;
}

.modal-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 350px;
  min-height: 350px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 24px 32px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}

.modal-content label {
  align-self: flex-start;
  margin-bottom: 4px;
  font-size: 13px;
  margin-top: 8px;
}

.modal-content input {
  width: 220px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 7px;
  font-size: 13px;
}

.input-autocomplete-wrapper {
  position: relative;
  width: 220px;
  margin-bottom: 8px;
}

.input-autocomplete-wrapper input {
  width: 100%;
}

.suggest-list {
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: 10010; /* 모달보다 높게 */
  max-height: 120px;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0,0,0,0.09);
}

.suggest-list li {
  padding: 7px 12px;
  cursor: pointer;
}
.suggest-list li:hover {
  background: #e0e0e0;
}


.or-divider {
  text-align: center;
  margin: 10px 0 6px 0;
  font-size: 12px;
  color: #888;
}

/* .modal-btns {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  justify-content: center;
  width: 100%;
}

.modal-btns button {
  min-width: 70px;
  height: 32px;
  background: #e4e7eb;
  border: none;
  color: #000;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-btns button:hover {
  background: #bfc7cc;
} */

</style>