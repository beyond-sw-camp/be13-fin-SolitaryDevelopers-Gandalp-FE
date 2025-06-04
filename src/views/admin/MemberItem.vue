<template>
  <tr>
    <td>{{ index }}</td>
    <td>{{ member.hospitalName }}</td>
    <td>{{ member.codeLabel }}</td>
    <td>{{ member.departmentName }}</td>
    <td>{{ member.accountId }}</td>
    <td class="actions">

      <v-btn
        size = "small"
        variant="tonal"
        color="warning"
        class="action-btn"
        @click="emit('edit', member)">
        수정
      </v-btn>

      <v-btn
        size = "small"
        variant="tonal"
        color="error"
        class="action-btn"
        @click="onDelete">
        삭제
      </v-btn>


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

.actions {
  display: flex;
  gap: 8px;
  /* 세로가 아니라 가로로 정렬 */
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

/* Vuetify 버튼 커스텀 여유 패딩 */
.action-btn {
  min-width: 64px;
  font-weight: 600;
  text-transform: none;
}

/* Tonal variant 라운드 추가 */
.v-btn[variant="tonal"] {
  border-radius: 8px;
}
</style>
