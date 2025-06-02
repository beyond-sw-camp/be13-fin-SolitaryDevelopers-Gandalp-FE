<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card>
      <v-card-title>근무 수정</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedWorkId"
          :items="works"
          item-title="title"
          item-value="workTempId"
          label="수정할 근무 선택"
          outlined
        />

        <v-select
            v-model="selectedNurseId"
            :items="nurseList"
            item-title="name"
            item-value="id"  
            label="새로운 담당 간호사 선택"
            outlined
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" text @click="$emit('close')">취소</v-btn>
        <v-btn color="primary" text @click="submit">저장</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import apiClient from '@/api/axios.js'

const props = defineProps({
  work: Array
})

const emit = defineEmits(['close', 'save'])

const dialog = ref(true)
const works = ref([])
const nurseList = ref([])

const selectedWorkId = ref(null)
const selectedNurseId = ref(null)

watch(() => props.work, (newVal) => {
  works.value = newVal || []
  if (newVal.length > 0) {
    selectedWorkId.value = newVal[0].workTempId
  }
  console.log('📦 전달된 work props:', newVal)
}, { immediate: true }) // 🔥 처음에 바로 실행됨!

const fetchNurseList = async () => {
  try {
    const { data } = await apiClient.get('/nurses/list')
    nurseList.value = data
  } catch (err) {
    alert('간호사 목록 불러오기 실패: ' + err)
  }
}

onMounted(() => {
  fetchNurseList()
})

const submit = async () => {
  const selected = works.value.find(w => w.workTempId === selectedWorkId.value)
  if (!selected || !selectedNurseId.value) {
    alert('근무와 간호사를 모두 선택해주세요.')
    return
  }

  const nurse = nurseList.value.find(n => n.id === selectedNurseId.value)

  // 백엔드에는 필요한 최소한의 데이터만
  const requestDto = {
    workTempId: selected.workTempId,
    nurseId: selectedNurseId.value
  }

  // 프론트 화면 갱신용 데이터는 전체 포함해서 emit
  const emitPayload = {
    ...requestDto,
    nurseName: nurse?.name,
    content: selected.title,
    startTime: selected.start,
    endTime: selected.end
  }

  try {
    await apiClient.put('/schedules/temp', requestDto)
    alert('근무가 수정되었습니다.')

    emit('save', emitPayload) // 🔥 화면에는 이걸로 반영
    console.log(emitPayload);
    
    dialog.value = false
  } catch (err) {
    alert('수정 실패: ' + (err.response?.data || err.message))
  }
}
</script>
