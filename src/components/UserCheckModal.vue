<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2 style="margin-top: 5px;">사용자 확인</h2>
          <label style="margin-right: 200px; font-size: 13px;">이메일</label><br>
          <input class="object-size" v-model="email" /><br><br>
          <label style="margin-right: 180px; font-size: 13px; margin-top: 50px;">비밀번호</label><br>
          <input class="object-size" v-model="password" type="password" /><br><br>
          <button class="submit-btn" @click="submit">확인</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['close', 'submit'])
const email = ref('')
const password = ref('')

const close = () => emit('close')
const submit = () => emit('submit', { email: email.value, password: password.value })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-title {
  margin-bottom: 1.5rem;
  font-size: 18px;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.confirm-button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #dcdcdc;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.confirm-button:disabled {
  background-color: #eaeaea;
  color: #999;
  cursor: not-allowed;
}

.object-size {
  width: 230px;
  height: 25px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 8px;
  transition: all 0.2s ease-in-out;
}
.submit-btn {
  width: 230px;
  height: 25px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 8px;
  transition: all 0.2s ease-in-out;
}
.submit-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
}
</style>
