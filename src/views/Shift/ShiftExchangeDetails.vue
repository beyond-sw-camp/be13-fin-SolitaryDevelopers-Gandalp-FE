<template>
  <div class="details-container">
    <table class="details-table">
      <tr>
        <th>게시글 번호</th>
        <td>{{ detail.boardId }}</td>
      </tr>
      <tr>
        <th>바꿀 교대 타임</th>
        <td>{{ detail.content }}</td>
      </tr>
      <tr>
        <th>상태</th>
        <td>
          <span :class="['status-badge', detail.codeLabel === '요청 수리됨' ? 'completed' : 'waiting']">
            {{ detail.codeLabel }}
          </span>
        </td>
      </tr>
    </table>

    <div class="button-group">
      <!-- <button class="edit-btn" @click="goToEdit">수정</button> -->
      <button class="delete-btn" @click="openDeleteModal">삭제</button>

    </div>

    <hr />

    <div class="comments-section">
      <!-- <div class="comments-title">댓글</div> -->
      <span class="comments-title">댓글</span>
      <button class="write-btn" @click="openWriteForm" v-if="!showWriteForm">작성</button>
      
      
      <div
  v-for="comment in detail.comments"
  :key="comment.commentId"
  class="comment-row"
  :class="{ 'comment-hover': hoveredCommentId === comment.commentId, 'comment-selected': comment.selected }"
  @mouseenter="hoveredCommentId = comment.commentId"
  @mouseleave="hoveredCommentId = null"
  @click="trySelectComment(comment)"
  style="cursor: pointer;"
>
  <span style="font-size:13px;">
    {{ formatDateTime(comment.createdAt) }} {{ comment.content }}
    <span v-if="comment.selected" style="color: #26a69a; font-weight: bold;">(채택됨)</span>
  </span>
  <button class="commentedit-btn" @click.stop="openEditForm(comment)">수정</button>
  <button class="commentdelete-btn" @click.stop="openCommentDeleteModal(comment)">삭제</button>
</div>                      

    </div>
  </div>

  <!-- 댓글 작성 폼 -->
  <div v-if="showWriteForm" class="comment-form-wrapper">
  <div class="comment-form-title">작성</div>

  <div class="comment-form">
    <div v-if="showWriteForm" class="comment-form">
      <select v-model="writeMonth">
        <option disabled value="">월</option>
        <option v-for="month in months" :key="month" :value="month">{{ month }}월</option>
      </select>
      <select v-model="writeDay">
        <option disabled value="">일</option>
        <option v-for="day in daysInWriteMonth" :key="day" :value="day">{{ day }}일</option>
      </select>
      <select v-model="writeTime">
        <option disabled value="">타임</option>
        <option v-for="time in times" :key="time" :value="time">{{ time }}</option>
      </select>
    <button class="submitComment-btn" @click="submitComment">확인</button>
    <button class="commentCancelWrite-btn" @click="commentCancelWrite">취소</button>
  </div>
</div>
</div>


    <!-- 댓글 수정 폼 -->
    <div v-if="editingComment" class="comment-form-wrapper">
  <div class="comment-form-title">수정</div>
  <div class="comment-form">
    <select v-model="editMonth">
        <option disabled value="">월</option>
        <option v-for="month in months" :key="month" :value="month">{{ month }}월</option>
      </select>
      <select v-model="editDay">
        <option disabled value="">일</option>
        <option v-for="day in daysInEditMonth" :key="day" :value="day">{{ day }}일</option>
      </select>
      <select v-model="editTime">
        <option disabled value="">타임</option>
        <option v-for="time in times" :key="time" :value="time">{{ time }}</option>
      </select>
    <button class="submitEdit-btn" @click="submitEdit">확인</button>
    <button class="cancelEdit-btn" @click="cancelEdit">취소</button>
  </div>
</div>

    <!-- 사용자 확인 모달 -->
  <UserCheckModalV2
    v-if="showModal"
    @close="showModal = false"
    @submit="handleSubmit"
  />
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
  showModal.value = true
}

// async function submitEdit() {
//   if (!editMonth.value || !editDay.value || !editTime.value) {
//     alert('월, 일, 타임을 모두 선택해 주세요.')
//     return
//   }
//   // 인증 모달 띄우기
//   showModal.value = true
// }


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


// async function trySelectComment(comment) {
//   // 게시글이 이미 채택된 상태면 안내 후 리턴
//   if (detail.value.codeLabel === '요청 수리됨') {
//     alert('이 게시물은 이미 채택된 상태입니다.')
//     return
//   }
//   if (!confirm('이 댓글을 채택하시겠습니까?')) return
//   try {
//     await apiClient.post(`/shifts/comments/${comment.commentId}/submit`, null, {
//       params: { boardId }
//     })
//     alert('댓글이 채택되었습니다.')
//     await fetchDetail()
//   } catch (e) {
//     // 백엔드에서 예외 발생 시 메시지 출력
//     alert(e.response?.data || '댓글 채택 실패')
//     console.error(e)
//   }
// }

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
  isWritingComment.value = true
  showModal.value = true
  deleteTargetComment.value = null
  editingComment.value = null
}


// function submitComment() {
//   if (!writeMonth.value || !writeDay.value || !writeTime.value) {
//     alert('월, 일, 타임을 모두 선택해 주세요.')
//     return
//   }
//   isWritingComment.value = true
//   showModal.value = true
//   deleteTargetComment.value = null
//   editingComment.value = null
// }

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


// const handleSubmit = async ({ email, password }) => {
//   try {
//     const res = await apiClient.post('schedules/check', null, {
//       params: { email, password }
//     })
//     nurseInfo.value = res.data
//     showModal.value = false

//     if (isWritingComment.value) {
//       await submitCommentWithNurse()
//       isWritingComment.value = false
//     } else if (editingComment.value) {
//       await submitEditWithNurse()
//     } else if (deleteTargetComment.value) {
//       await deleteCommentConfirmed(deleteTargetComment.value)
//     } else {
//       await deleteBoard(nurseInfo.value.id)
//     }
//   } catch (err) {
//     alert('계정 확인 실패: ' + (typeof err.response?.data === 'object'
//     ? JSON.stringify(err.response.data)
//     : err.response?.data || err.message))
//     // alert('이메일이나 비밀번호가 잘못 입력되었습니다.')
//     showModal.value = false
//     isWritingComment.value = false
//   }
// }

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


// async function submitCommentWithNurse() {
//   const content = `${writeMonth.value}월 ${writeDay.value}일 ${writeTime.value}`
//   try {
//     await apiClient.post(`/shifts/comments/${boardId}`, { 
//       boardId, 
//       content, 
//       nurseId: nurseInfo.value.id })
//     alert('댓글이 작성되었습니다.')
//     await fetchDetail()
//     commentCancelWrite()
//   } catch (e) {
//     alert('댓글 등록 실패')
//     console.error(e)
//   }
// }

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
      data: { nurseId }
    })
    alert('삭제되었습니다.')
    router.push({ name: 'shift-list' })
  } catch (err) {
    alert(err.response?.data || '삭제 중 오류가 발생했습니다.')
  }
}

// const deleteBoard = async () => {
//   if (!confirm('정말 삭제하시겠습니까?')) return
//   try {
//     await apiClient.delete(`/shifts/${detail.value.boardId}`)
//     alert('삭제되었습니다.')
//     router.push({ name: 'shift-list' })
//   } catch (err) {
//     alert('삭제 중 오류가 발생했습니다.')
//   }
// }

// 날짜+시간 포맷: "2025-05-12 14:00"
const formatDateTime = (dtStr) => {
  if (!dtStr) return '-'
  return dayjs(dtStr).format('YYYY-MM-DD HH:mm')
}

onMounted(fetchDetail)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

.comment-form-title {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
}

.write-btn {
  height: 17px;
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
  border: none;
  color: #000;
  font-size: 0.65rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 08px;
  transition: all 0.2s ease-in-out;
  
  margin-bottom: 10px;
}

.write-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.commentedit-btn {
  height: 18px;
  background: linear-gradient(to right, #e4e7eb 0%, #e4e7eb 100%);
  border: none;
  color: #000;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 10px;
  transition: all 0.2s ease-in-out;
  
  margin-bottom: 10px;
}

.commentdelete-btn {
  height: 18px;
  background: linear-gradient(to right, #f1dfdf 0%, #f1dfdf 100%);
  border: none;
  color: #000;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  line-height: 1;
  padding: 0 10px;
  transition: all 0.2s ease-in-out;
  margin-bottom: 10px;
}

.commentedit-btn:hover, .commentdelete-btn:hover {
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
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
.comment-hover {
  background: #d6d6d6;
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


