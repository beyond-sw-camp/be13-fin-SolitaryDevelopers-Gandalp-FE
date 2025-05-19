<template>
  <tr>
    <td>{{ index }}</td>
    <td>{{ member.hospitalName }}</td>
    <td>{{ member.type }}</td>
    <td>{{ member.departmentName }}</td>
    <td>{{ member.accountId }}</td>
    <td class="actions">
      <button class="edit"   @click="emit('edit',   member)">수정</button>
      <button class="delete" @click="onDelete">삭제</button>
    </td>
  </tr>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
import apiClient from '@/api/axios.js'

const props = defineProps({
  member: Object,
  index:  Number
})
const emit = defineEmits(['deleted','edit'])

const onDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await apiClient.delete(`/members/${props.member.id}`)
  emit('deleted')
}
</script>

<style scoped>
.actions { display: flex; gap: 4px; flex-direction: column; }
.edit  { background: #f0ad4e; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; }
.delete{ background: #d9534f; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; }
</style>
