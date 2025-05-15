<template>
  <tr>
    <td>{{ index }}</td>
    <td>{{ member.hospital }}</td>
    <td>{{ member.type }}</td>
    <td>{{ member.department }}</td>
    <td>{{ member.name }}</td>
    <td class="actions">
      <button class="edit" @click="onEdit">수정</button>
      <button class="delete" @click="onDelete">삭제</button>
    </td>
  </tr>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
import apiClient                       from '@/api/axios'

const props = defineProps({
  member: Object,
  index:  Number
})
const emit = defineEmits(['deleted','updated'])

const onDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await apiClient.delete(`/api/v1/members/${props.member.id}`)
  emit('deleted')
}

const onEdit = async () => {
  // 예: 모달을 띄우거나, 라우터로 update 페이지로 이동
  // router.push({ name:'member-edit', params:{ id: props.member.id } })
  // 업데이트 성공 시 emit('updated')
}
</script>

<style scoped>
.actions {
  display: flex;
  gap: 4px;
}

.actions .edit,
.actions .delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.actions .edit {
  background: #f0ad4e;
  color: white;
}
.actions .delete {
  background: #d9534f;
  color: white;
}
</style>
