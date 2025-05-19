<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <h3>회원 정보 수정</h3>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="accountId">아이디</label>
          <input id="accountId" v-model="form.accountId" type="text" required />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input id="password" v-model="form.password" type="password"
                 placeholder="변경할 비밀번호 입력" />
        </div>
        <div class="buttons">
          <button type="button" class="btn-cancel" @click="close">취소</button>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? '저장 중…' : '저장' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import apiClient from '@/api/axios.js'

const props = defineProps({
  modelValue: Object  // { id, accountId, … }
})
const emit = defineEmits(['update:modelValue','saved','closed'])

const form = reactive({ id: null, accountId: '', password: '' })
const loading = ref(false)

// 부모가 넘긴 member를 form으로 복사
watch(() => props.modelValue, m => {
  if (m) {
    form.id        = m.id
    form.accountId = m.accountId
    form.password  = ''
  }
}, { immediate: true })

const close = () => {
  emit('update:modelValue', null)
  emit('closed')
}

const onSubmit = async () => {
  loading.value = true
  try {
    const { data: updated } = await apiClient.post(`/members/${form.id}`, {
      accountId: form.accountId,
      password:   form.password || undefined
    })
    emit('saved', updated)   // 변경된 객체 그대로 전달
    close()
  } catch (e) {
    console.error(e)
    alert('수정 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
}

.modal {
  background:#fff;
  padding:24px;
  border-radius:8px;
  width:320px;
}

.form-group {
  margin-bottom:16px;
}

.form-group label {
  display:block;
  margin-bottom:4px;
}

.form-group input {
  width:100%;
  padding:6px 8px;
  border:1px solid #ccc;
  border-radius:4px;
}

.buttons {
  display:flex;
  justify-content:flex-end;
  gap:8px;
}

.btn-cancel {
  background:#eee;
  border:none;
  padding:6px 12px;
  border-radius:4px;
}

.btn-save   {
  background:#1b9aaa;
  color:#fff;
  border:none;
  padding:6px 12px;
  border-radius:4px;
}

</style>
