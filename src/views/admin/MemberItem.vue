<template>
  <tr>
    <td>{{ index }}</td>
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
        v-if="member.codeLabel !== '관리자'"
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
import {computed, defineEmits, defineProps} from 'vue'
import apiClient from '@/api/axios.js'
import { useAuthStore } from '@/stores/auth'
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const isAdmin = computed(() => auth.userInfo.codeLabel === '관리자')

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
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.action-btn {
  min-width: 64px;
  font-weight: 600;
  text-transform: none;
}

.v-btn[variant="tonal"] {
  border-radius: 8px;
}

</style>
