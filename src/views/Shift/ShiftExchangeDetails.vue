<template>
  <v-container class="py-6 px-4" max-width="800">
    <!-- 게시글 상세 카드 -->
    <span class="text-h6 font-weight-bold mb-4">게시글 상세</span>
    <br><br>
    <v-card elevation="2" class="pa-6 mb-6" style="border-radius: 10px;">
      
      <v-row no-gutters>
        <v-col cols="4" class="detail-label py-3 px-4">바꿀 교대 타임</v-col>
        <v-col cols="8" class="py-3 px-4">{{ detail.content }}</v-col>
      </v-row>
      <v-divider></v-divider>

      <v-row no-gutters class="highlight-row">
        <v-col cols="4" class="detail-label py-3 px-4">작성자</v-col>
        <v-col cols="8" class="py-3 px-4">{{ detail.nurseName  }}</v-col>
      </v-row>
      <v-divider></v-divider>

      <v-row no-gutters>
        <v-col cols="4" class="detail-label py-3 px-4">상태</v-col>
        <v-col cols="8" class="py-3 px-4">
          <v-chip
            :color="detail.codeLabel === '요청 수리됨' ? 'success' : 'warning'"
            class="text-white"
            size="small"
          >
            {{ detail.codeLabel }}
          </v-chip>
        </v-col>
      </v-row>

      <v-row justify="end" class="mt-4">
        <v-btn color="error" variant="tonal" class="ml-2" @click="openDeleteModal">삭제</v-btn>
        
      </v-row>
    </v-card>
    

    <!-- 댓글 카드 -->
    <h2 class="text-h6 font-weight-bold mb-4">교환 요청</h2>
      <v-row justify="end" class="mb-2" >
        <v-btn size="small" variant="tonal" color="success" class="write-btn" @click="openWriteForm" v-if="!showWriteForm">
          작성
        </v-btn>
      </v-row>
    
      
    <!-- 댓글 리스트 -->
      <v-card
        v-for="comment in detail.comments"
        :key="comment.commentId"
        class="mb-3 comment-card"
        elevation="1"

        :class="{ 'comment-hover': hoveredCommentId === comment.commentId, 'comment-selected': comment.selected }"
        @mouseenter="hoveredCommentId = comment.commentId"
        @mouseleave="hoveredCommentId = null"
        @click="trySelectComment(comment)"
        style="cursor: pointer"
        >
  
      <v-row class="pa-4" align="center" justify="space-between">

  <!-- 왼쪽: 댓글 내용 (수직 가운데 정렬) -->
    <v-col class="d-flex align-center">
      <div class="comment-content">{{ comment.content }}</div>
      
    </v-col>

    <!-- 
    <v-col class="d-flex flex-column align-start">
  <div class="comment-content">{{ comment.content }}</div>
  <div class="comment-nurseName">{{ comment.nurseName }}</div>
</v-col> 
-->

    <!-- 오른쪽: 상단 날짜 + 하단 버튼 -->
     <v-col cols="auto" class="d-flex flex-column align-end justify-space-between text-right">
  <div class="comment-date mt-2">{{ formatDateTime(comment.createdAt) }}</div>
  <div class="comment-nurseName mt-2">{{ comment.nurseName }}</div>
  <div class="mt-2">
    <v-btn size="small" variant="tonal" color="primary" class="commentedit-btn" @click.stop="openEditForm(comment)">수정</v-btn>
    <v-btn size="small" variant="tonal" color="error" class="commentdelete-btn" @click.stop="openCommentDeleteModal(comment)">삭제</v-btn>
  </div>
</v-col>

    <!-- <v-col cols="auto" class="d-flex flex-column align-end justify-space-between text-right">
      <div class="comment-date mb-2">{{ formatDateTime(comment.createdAt) }}</div>
      <div class="comment-nurseName">{{ comment.nurseName }}</div>
      <div>
        <v-btn size="small" variant="tonal" color="primary" class="commentedit-btn" @click.stop="openEditForm(comment)">수정</v-btn>
        <v-btn size="small" variant="tonal" color="error" 
              class="commentdelete-btn" @click.stop="openCommentDeleteModal(comment)">삭제</v-btn>

              

      </div>
    </v-col> -->
  </v-row>
  </v-card>                    

  

  <!-- 댓글 작성 폼 v2-->
  
  <div v-if="showWriteForm" class="comment-form-wrapper">
  <div class="comment-form-title">작성</div>

  
  <v-card v-if="showWriteForm" class="pa-4 comment-form-card" color="white" elevation="0">
  <v-row dense>
    <v-col cols="4">
      <v-select
        v-model="writeMonth"
        :items="months"
        label="월"
        density="compact"
              variant="outlined"
      />
    </v-col>
    <v-col cols="4">
      <v-select
        v-model="writeDay"
        :items="daysInWriteMonth"
        label="일"
        density="compact"
              variant="outlined"
      />
    </v-col>
    <v-col cols="4">
      <v-select
        v-model="writeTime"
        :items="times"
        label="타임"
        density="compact"
              variant="outlined"
      />
    </v-col>
  </v-row>
  <v-row class="btn-row" justify="end">
    <v-btn size="small" variant="tonal" color="primary" class="btn" @click="submitComment">확인</v-btn>
    <v-btn size="small" variant="tonal" color="error" class="btn" @click="commentCancelWrite">취소</v-btn>

  </v-row>
</v-card>
  </div>



    <!-- 댓글 수정 폼 -->
    <div v-if="editingComment" class="comment-form-wrapper">
      <div class="comment-form-title">수정</div>

    <v-card v-if="editingComment" class="pa-4 comment-form-card" color="white" elevation="0">
    
    <v-row dense>
    <v-col cols="4">
      <v-select
        v-model="editMonth"
        :items="months"
        label="월"
        density="compact"
              variant="outlined"
      />
    </v-col>
    <v-col cols="4">
      <v-select
        v-model="editDay"
        :items="daysInEditMonth"
        label="일"
        density="compact"
              variant="outlined"
      />
    </v-col>
    <v-col cols="4">
      <v-select
        v-model="editTime"
        :items="times"
        label="타임"
        density="compact"
              variant="outlined"
      />
    </v-col>
  </v-row>
    
    <v-row class="btn-row" justify="end">
    <v-btn size="small" variant="tonal" color="primary" class="btn" @click="submitEdit">확인</v-btn>
    <v-btn size="small" variant="tonal" color="error" class="btn" @click="cancelEdit">취소</v-btn>

    
  </v-row>

    </v-card>
  </div>
<!-- </div> -->

    <!-- 사용자 확인 모달 -->
  <UserCheckModalV2
    v-if="showModal"
    @close="showModal = false"
    @submit="handleSubmit"
  />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import UserCheckModal from '@/components/UserCheckModal.vue'
import dayjs from 'dayjs'
import UserCheckModalV2 from '@/components/UserCheckModalV2.vue'

const now = new Date()
const getShiftStartHour = (time) => {
  if (time === '데이') return 6
  if (time === '이브닝') return 14
  if (time === '나이트') return 22
  return 0
}
const isPast = (month, day, time) => {
  const year = now.getFullYear()
  const date = new Date(year, month - 1, day, getShiftStartHour(time), 0, 0)
  return date < now
}


// 위에 새로 추가
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const times = ['데이', '이브닝', '나이트']

// 댓글 작성 폼
const showWriteForm = ref(false)
const writeMonth = ref('')
const writeDay = ref('')
const writeTime = ref('')
const daysInWriteMonth = computed(() => {
  const month = Number(writeMonth.value)
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return Array.from({ length: 31 }, (_, i) => i + 1)
  if ([4, 6, 9, 11].includes(month)) return Array.from({ length: 30 }, (_, i) => i + 1)
  if (month === 2) return Array.from({ length: 29 }, (_, i) => i + 1)
  return []
})

function openWriteForm() {
  showWriteForm.value = true
}
function commentCancelWrite() {
  showWriteForm.value = false
  writeMonth.value = ''
  writeDay.value = ''
  writeTime.value = ''
}


// 댓글 수정 폼
const editingComment = ref(null)
const editMonth = ref('')
const editDay = ref('')
const editTime = ref('')
const daysInEditMonth = computed(() => {
  const month = Number(editMonth.value)
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return Array.from({ length: 31 }, (_, i) => i + 1)
  if ([4, 6, 9, 11].includes(month)) return Array.from({ length: 30 }, (_, i) => i + 1)
  if (month === 2) return Array.from({ length: 29 }, (_, i) => i + 1)
  return []
})

function openEditForm(comment) {
  editingComment.value = comment
  // "4월 28일 데이" → [4, 28, 데이]
  const matched = comment.content.match(/(\d+)월 (\d+)일 (.+)/)
  if (matched) {
    editMonth.value = matched[1]
    editDay.value = matched[2]
    editTime.value = matched[3]
  }
}
function cancelEdit() {
  editingComment.value = null
  editMonth.value = ''
  editDay.value = ''
  editTime.value = ''
}

// 댓글 수정

async function submitEdit() {
  if (!editMonth.value || !editDay.value || !editTime.value) {
    alert('월, 일, 타임을 모두 선택해 주세요.')
    return
  }
  if (isPast(editMonth.value, editDay.value, editTime.value)) {
    alert('과거 일정은 선택할 수 없습니다.')
    return
  }
  // *** 교대 종류 검증 ***
  if (!isValidCommentShift(detail.value.content, editTime.value)) {
    alert('게시글에는 데이/이브닝, 나이트 각각에 해당하는 근무 종류의 댓글만 작성할 수 있습니다.')
    return
  }
  showModal.value = true
}


// 인증 모달에서 nurseId 받으면 호출
async function submitEditWithNurse() {
  const year = new Date().getFullYear()
  const startHour = getShiftStartHour(editTime.value)
  const startTime = `${year}-${String(editMonth.value).padStart(2, '0')}-${String(editDay.value).padStart(2, '0')}T${String(startHour).padStart(2, '0')}:00:00`
  const nurseId = nurseInfo.value.id

  // 1. 일정 존재 여부 확인
  const exists = await apiClient.get('/schedules/exists', { params: { nurseId, startTime } })
  if (!exists.data) {
    alert('해당 시간에 근무 일정이 없습니다.')
    return
  }

  try {
    await apiClient.put(`/shifts/comments/${editingComment.value.commentId}`, {
      commentId: editingComment.value.commentId,
      boardId,
      content: `${editMonth.value}월 ${editDay.value}일 ${editTime.value}`,
      nurseId: nurseInfo.value.id
    })
    alert('댓글이 수정되었습니다.')
    await fetchDetail()
    cancelEdit()
  } catch (e) {
    alert(typeof e.response?.data === 
    'object' ? JSON.stringify(e.response.data) : e.response?.data || '댓글 수정 실패')
    console.error(e)
  }
}


const deleteTargetComment = ref(null)

function openCommentDeleteModal(comment) {
  showModal.value = true
  deleteTargetComment.value = comment // 댓글 삭제
}

const hoveredCommentId = ref(null)

async function trySelectComment(comment) {
  // 게시글이 이미 채택된 상태면 안내 후 리턴
  if (detail.value.codeLabel === '요청 수리됨') {
    alert('이 게시물은 이미 채택된 상태입니다.')
    return
  }
  if (!confirm('이 댓글을 채택하시겠습니까?')) return
  // 인증 모달 띄우기 (채택 시도)
  selectedCommentForSubmit.value = comment
  showModal.value = true
}
const selectedCommentForSubmit = ref(null)

function getShiftTypeFromContent(content) {
  if (content.includes('데이')) return '데이'
  if (content.includes('이브닝')) return '이브닝'
  if (content.includes('나이트')) return '나이트'
  return ''
}

function isValidCommentShift(boardContent, commentTime) {
  const boardShift = getShiftTypeFromContent(boardContent)
  if (boardShift === '데이' || boardShift === '이브닝') {
    return commentTime === '데이' || commentTime === '이브닝'
  }
  if (boardShift === '나이트') {
    return commentTime === '나이트'
  }
  return false
}

// 1. 댓글 작성 버튼 클릭
function submitComment() {
  if (!writeMonth.value || !writeDay.value || !writeTime.value) {
    alert('월, 일, 타임을 모두 선택해 주세요.')
    return
  }
  if (isPast(writeMonth.value, writeDay.value, writeTime.value)) {
    alert('과거 일정은 선택할 수 없습니다.')
    return
  }
  // *** 교대 종류 검증 ***
  if (!isValidCommentShift(detail.value.content, writeTime.value)) {
    alert('게시글에는 데이/이브닝, 나이트 각각에 해당하는 근무 종류의 댓글만 작성할 수 있습니다.')
    return
  }
  isWritingComment.value = true
  showModal.value = true
  deleteTargetComment.value = null
  editingComment.value = null
}



// 2. 모달에서 인증 성공 시 handleSubmit에서 nurseInfo.value에 nurseId 저장됨
const handleSubmit = async ({ email, password }) => {
  try {
    const res = await apiClient.post('schedules/check', null, {
      params: { email, password }
    })
    nurseInfo.value = res.data
    showModal.value = false

    if (isWritingComment.value) {
      await submitCommentWithNurse()
      isWritingComment.value = false
    } else if (editingComment.value) {
      await submitEditWithNurse()
    } else if (deleteTargetComment.value) {
      await deleteCommentConfirmed(deleteTargetComment.value)
    } else if (selectedCommentForSubmit.value) {
      // 댓글 채택 로직
      // 1. nurseId 비교
      if (String(detail.value.nurseId) !== String(nurseInfo.value.id)) {
        alert('게시글 작성자만 댓글을 채택할 수 있습니다.')
        selectedCommentForSubmit.value = null
        return
      }
      // 2. 동일하면 채택 API 호출
      try {
        await apiClient.post(`/shifts/comments/${selectedCommentForSubmit.value.commentId}/submit`, null, {
          params: { boardId }
        })
        alert('댓글이 채택되었습니다.')
        router.push({ name: 'shift-list' })
        await fetchDetail()
      } catch (e) {
        alert(e.response?.data || '댓글 채택 실패')
        console.error(e)
      }
      selectedCommentForSubmit.value = null
    } else {
      await deleteBoard(nurseInfo.value.id)
    }
  } catch (err) {
    alert('계정 확인 실패: ' + (typeof err.response?.data === 'object'
      ? JSON.stringify(err.response.data)
      : err.response?.data || err.message))
    showModal.value = false
    isWritingComment.value = false
    selectedCommentForSubmit.value = null
  }
}


// 3. nurseId 포함해서 댓글 작성
  async function submitCommentWithNurse() {
  // 1. 자기 글에 댓글 작성 방지
  if (String(detail.value.nurseId) === String(nurseInfo.value.id)) {
    alert('자신의 게시글에 댓글을 작성하실 수 없습니다.')
    return
  }

  const year = new Date().getFullYear()
  const startHour = getShiftStartHour(writeTime.value)
  const startTime = `${year}-${String(writeMonth.value).padStart(2, '0')}-${String(writeDay.value).padStart(2, '0')}T${String(startHour).padStart(2, '0')}:00:00`
  const nurseId = nurseInfo.value.id

  // 2. 일정 존재 여부 확인
  const exists = await apiClient.get('/schedules/exists', { params: { nurseId, startTime } })
  if (!exists.data) {
    alert('해당 시간에 근무 일정이 없습니다.')
    return
  }

  // 3. 댓글 등록
  try {
    await apiClient.post(`/shifts/comments/${boardId}`, { 
      boardId, 
      content: `${writeMonth.value}월 ${writeDay.value}일 ${writeTime.value}`, 
      nurseId 
    })
    alert('댓글이 작성되었습니다.')
    await fetchDetail()
    commentCancelWrite()
  } catch (e) {
    alert('댓글 등록 실패')
    console.error(e)
  }
}

const isWritingComment = ref(false)
const showModal = ref(false)
const nurseInfo = ref(null)

function openDeleteModal() {
  showModal.value = true
  deleteTargetComment.value = null // 게시글 삭제
}


// 댓글 삭제
async function deleteCommentConfirmed(comment) {
  try {
    // await apiClient.delete(`/shifts/comments/${comment.commentId}`, {
    //   data: { nurseId: nurseInfo.value.id }
    // })
    await apiClient.delete(`/shifts/comments/${comment.commentId}`, {
    params: { nurseId: nurseInfo.value.id }
    })

    await fetchDetail()
    alert('댓글이 삭제되었습니다.')
  } catch (e) {
    alert(
    typeof e.response?.data === 'object'
    ? JSON.stringify(e.response.data)
    : e.response?.data || '댓글 삭제를 실패했습니다.'
    )

    console.error(e)
  }
}


const route = useRoute()
const router = useRouter()
const boardId = route.params['boardId']   // boardId를 변수로 저장

const detail = ref({
  boardId: '',
  content: '',
  codeLabel: '',
  nurseId: '',
  comments: []
})



// 상세 정보 불러오기 (boardId를 동적으로 사용)
const fetchDetail = async () => {
  try {
    const { data } = await apiClient.get(`/shifts/${boardId}`)
    detail.value = data
  } catch (err) {
    alert('상세 조회 중 오류가 발생했습니다.')
  }
}


const deleteBoard = async (nurseId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await apiClient.delete(`/shifts/${detail.value.boardId}`, {
    params: { nurseId } // 쿼리스트링으로 nurseId 전송
    })

    alert('삭제되었습니다.')
    router.push({ name: 'shift-list' })
  } catch (err) {
    alert(err.response?.data || '삭제 중 오류가 발생했습니다.')
  }
}


// 날짜+시간 포맷: "2025-05-12 14:00"
const formatDateTime = (dtStr) => {
  if (!dtStr) return '-'
  return dayjs(dtStr).format('YYYY-MM-DD HH:mm')
}

onMounted(fetchDetail)
</script>

<style scoped>
.comment-form-card {
  border: 1.5px solid #e0e0e0;
  box-shadow: 0 3px 5px rgba(0,0,0,0.05) !important;
  border-radius: 10px; /* 필요시 */
}


.comment-card {
  border: 1px solid #e0e0e0;
  /* border-radius: 10px; */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-row {
  gap: 4px;
}

/* 위에 새로 추가 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

.comment-form-title {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
}


.comment-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.comment-form select {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12px;
}
.comment-form button {
  background: #fff;
  border: 1px solid #a0adb4;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.85rem;
  cursor: pointer;
}

.submitComment-btn, .commentCancelWrite-btn, 
.submitEdit-btn, .cancelEdit-btn {
  height: 20px;
  min-width: 50px;
  background: white;
  border: 1.3px solid #a0adb4;
  font-size: 0.55rem;
  font-weight: normal;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 09px;
  transition: all 0.2s ease-in-out;
  margin-top: 2px;
}
.submitComment-btn:hover, .commentCancelWrite-btn:hover, 
.submitEdit-btn:hover, .cancelEdit-btn:hover {
  background-color: rgba(0, 0, 0, 0.2);
  color: white !important;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.comment-row {
  transition: background 0.2s;
}
/* .comment-hover {
  background: #ebebeb;
} */

h2.text-h6 {
  border-bottom: none !important;
  box-shadow: none !important;
  color: #000 !important;
}
h2.text-h6::after,
h2.text-h6::before {
  display: none !important;
}


/* 위에는 직접 추가 */

.details-container {
  margin: 30px 0;
  padding: 0 10px;
}
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.details-table th, .details-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 14px;
}
.details-table th {
  width: 160px;
  color: #333;
  background: #fcfcfc;
}
.completed {
  color: #26a69a;
}
.waiting {
  color: #f39c12;
}
.button-group {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.edit-btn {
  height: 27px;
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
  border: none;
  color: #000;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 16px;
  transition: all 0.2s ease-in-out;
  float: right;
  margin-bottom: 10px;
}
.delete-btn {
  height: 27px;
  background: linear-gradient(to right, #f1dfdf 0%, #f1dfdf 100%);
  border: none;
  color: #000;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 16px;
  transition: all 0.2s ease-in-out;
  float: right;
  margin-bottom: 10px;
}
.edit-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
.delete-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
.comments-section {
  margin-top: 24px;
}
.comments-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}
.comments-table {
  width: 100%;
  border-collapse: collapse;
}
.comments-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
}
</style>


