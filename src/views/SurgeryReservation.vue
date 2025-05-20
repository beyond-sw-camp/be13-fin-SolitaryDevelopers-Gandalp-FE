<template>
    <div class="schedule-calendar">
      <div class="filters">
        <div class="room-select-group">
          <label>수술실</label>
          <select v-model="selectedRoomId">
            <option :value="-1">전체</option>
            <option v-for="room in roomOptions" :key="room.id" :value="room.id">
              수술실 {{ room.id }}
            </option>
          </select>
        </div>
        <button class="btn reservation" @click="openCreateDialog">수술 예약</button>
      </div>
  
      <vue-cal
        ref="vueCalRef"
        class="vuecal--blue-theme"
        style="height: 600px"
        locale="ko"
        :views="{
          day: { label: '일간' },
          week: { label: '주간' },
          month: { label: '월간' }
        }"
        :events="calendarEvents"
        :editable-events="false"
        :events-on-month-view="true"
        default-view="week"
        @event-click="onEventClick"
      />
  
      <dialog ref="createDialog" class="dialog">
        <form method="dialog" class="dialog-form">
          <div class="dialog-header"> 📝 수술 일정 생성
            <!-- <h3>📝 수술 일정 생성</h3> -->
            <button type="button" class="close-btn" @click="closeCreateDialog">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="form-section">
              <label>수술실</label>
              <select v-model="newEvent.roomId">
                <option v-for="room in roomOptions" :key="room.id" :value="room.id">
                  수술실 {{ room.id }}
                </option>
              </select>
            </div>
  
            <div class="form-section">
              <label>수술 간호사</label>
              <div class="nurse-checkboxes">
                <label v-for="nurse in nurseOptions" :key="nurse.id" class="checkbox-item">
                  <input type="checkbox" :value="nurse.id" v-model="newEvent.nurseIds" />
                  {{ nurse.name }}
                </label>
              </div>
            </div>
  
            <div class="form-section">
              <label>내용</label>
              <input v-model="newEvent.content" placeholder="수술 내용을 입력하세요" />
            </div>
  
            <div class="form-section">
              <label>시작 시간</label>
              <Datepicker
                v-model="newEvent.startTime"
                locale="ko"
                time-picker-inline
                :enable-time-picker="true"
                :is-24="true"
                :format="'yyyy-MM-dd HH:mm'"
                auto-apply
              />
            </div>
  
            <div class="form-section">
              <label>종료 시간</label>
              <Datepicker
                v-model="newEvent.endTime"
                locale="ko"
                time-picker-inline
                :enable-time-picker="true"
                :is-24="true"
                :format="'yyyy-MM-dd HH:mm'"
                auto-apply
              />
            </div>
  
            <div class="form-section">
              <label>비밀번호</label>
              <input v-model="newEvent.password" type="password" placeholder="비밀번호 입력" />
            </div>
          </div>
  
          <div class="dialog-footer">
            <button class="btn cancel" @click.prevent="closeCreateDialog">취소</button>
            <button class="btn primary" @click.prevent="createSchedule">저장</button>
          </div>
        </form>
      </dialog>
  
      <!-- 수술 일정 상세보기 창 -->
      <dialog ref="detailDialog" class="dialog">
        <form method="dialog" class="dialog-form">
          <div class="dialog-header"> 📋 수술 일정 상세 보기
            <!-- <h3>📋 수술 일정 상세보기</h3> -->
            <button type="button" class="close-btn" @click="closeDetailDialog">&times;</button>
          </div>
          <div class="dialog-body">
            <p><strong>내용:</strong> {{ selectedEvent?.title }}</p>
            <p><strong>시간:</strong> {{ formatDate(selectedEvent?.start) }} ~ {{ formatDate(selectedEvent?.end) }}</p>
            <p><strong>수술 간호사:</strong>
              <span v-for="id in selectedEvent?.nurseIds || []" :key="id">
                {{ getNurseNameById(id) }}<span v-if="id !== selectedEvent.nurseIds.at(-1)">, </span>
              </span>
            </p>
            <div class="password-row">
              <label>비밀번호 입력:</label>
              <input v-model="deletePassword" type="password" placeholder="비밀번호 입력" />
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn cancel" @click.prevent="closeDetailDialog">닫기</button>
            <button class="btn danger" @click.prevent="confirmDelete">삭제</button>
          </div>
        </form>
      </dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { VueCal } from '@/vue-cal';
  import apiClient from '@/api/axios';
  import Datepicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  
  const selectedRoomId = ref(-1);
  const roomOptions = ref([]);
  const nurseOptions = ref([]);
  const rawEvents = ref([]);
  const calendarEvents = ref([]);
  const vueCalRef = ref(null);
  const selectedEvent = ref(null);
  const deletePassword = ref('');
  
  const newEvent = ref({
    roomId: null,
    nurseIds: [],
    content: '',
    password: '',
    startTime: '',
    endTime: ''
  });
  
  const createDialog = ref(null);
  const detailDialog = ref(null);
  
  const parseLocalDate = (isoString) => new Date(isoString);
  const formatDate = (date) => date?.toLocaleString('ko-KR') || '';
  
  const getNurseNameById = (id) => {
    const found = nurseOptions.value.find(n => n.id === id);
    return found ? found.name : '알 수 없음';
  };
  
  const loadSchedules = async () => {
    try {
      const response = await apiClient.get('/ors');
      const allEvents = response.data;
  
      const events = allEvents
        .filter(event => selectedRoomId.value === -1 || event.roomId === selectedRoomId.value)
        .map(event => ({
          id: event.surgeryScheduleId,
          title: event.content,
          start: parseLocalDate(event.startTime),
          end: parseLocalDate(event.endTime),
          nurseIds: event.nurseIds,
          name: event.roomId,
          class: 'surgery'
        }));
  
      rawEvents.value = events;
      calendarEvents.value = events;
    } catch (error) {
      console.error('일정 불러오기 실패:', error);
    }
  };
  
  const loadRooms = async () => {
    try {
      const response = await apiClient.get('/rooms');
      roomOptions.value = response.data.map(room => ({ id: room.roomId, status: room.status }));
    } catch (error) {
      console.error('수술실 목록 불러오기 실패:', error);
    }
  };
  
  const loadNurses = async () => {
    try {
      const response = await apiClient.get('/nurses');
      nurseOptions.value = response.data.content.map(nurse => ({ id: nurse.id, name: nurse.name }));
    } catch (error) {
      console.error('간호사 목록 불러오기 실패:', error);
    }
  };
  
  watch(selectedRoomId, loadSchedules);
  
  onMounted(async () => {
    await loadRooms();
    await loadNurses();
    await loadSchedules();
  });
  
  const openCreateDialog = () => {
    newEvent.value = {
      roomId: roomOptions.value[0]?.id || null,
      nurseIds: [],
      content: '',
      password: '',
      startTime: '',
      endTime: ''
    };
    createDialog.value?.showModal();
  };
  
  const closeCreateDialog = () => {
    createDialog.value?.close();
  };
  
  const createSchedule = async () => {
    try {
      await apiClient.post('/ors', newEvent.value);
      closeCreateDialog();
      await loadSchedules();
      alert('일정이 생성되었습니다.');
    } catch (error) {
      console.error('일정 생성 실패:', error);
      alert('일정 생성에 실패했습니다.');
    }
  };
  
  const onEventClick = ({ event }) => {
    selectedEvent.value = event;
    deletePassword.value = '';
    detailDialog.value?.showModal();
  };
  
  const closeDetailDialog = () => {
    detailDialog.value?.close();
    deletePassword.value = '';
    selectedEvent.value = null;
  };
  
  const confirmDelete = async () => {
    try {
      await apiClient.delete('/ors', {
        data: {
          surgeryScheduleId: selectedEvent.value.id,
          password: deletePassword.value
        }
      });
      closeDetailDialog();
      await loadSchedules();
      alert('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다. 비밀번호를 확인하세요.');
    }
  };
  </script>
  
<style lang="scss">

dialog.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 1000;

  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  background-color: white;
}

.room-select-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.room-select-group label {
  font-weight: bold;
  margin-bottom: 2px;
}

.btn.reservation {
  background: #e5e7eb;
  color: #00000086;          
  font-weight: bold;
  font-size: 12px;
  padding: 7px 15px;
  border-radius: 10px;
  border: none;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn.reservation:hover {
  background: #d1d5db; /* hover 시 좀 더 진한 회색 */
}

.filters {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  // gap: 12px;
  margin-bottom: 12px;
}

  .vuecal__event.surgery {background-color: #57cea9cc;border-color: #90d2be;}

  .vuecal__event.surgery {
    background-color: #57cea9cc;
    border-color: #90d2be;
    color: #ffffff; /* 글씨 색상 */
  }

  .schedule-calendar {
    padding: 16px;
  }
  
  .filters {
    margin-bottom: 12px;
  }

.password-row {
  display: flex;
  align-items: center;
  gap: 12px; // 라벨과 input 간 간격
  margin-top: 16px;
}

.password-row label {
  white-space: nowrap;
  font-weight: 600;
}

.password-row input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

  
  select, input {
    margin: 4px 0;
    padding: 4px 8px;
    display: block;
    width: 100%;
    max-width: 300px;
  }
  
  .dialog {
    border: none;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    max-width: 500px;
    width: 90%;
    overflow: hidden;
  }

  /* dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  } */
  
  .dialog-form {
    // border: 1px solid #ccc;
    /* padding: 24px; */
    // background: white;
    width: 100%;
    /* max-width: 400px; */
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 8px;
  }
  
  .dialog-header {
    background-color: #1e3a8a;
    color: white;
    padding: 16px 24px;
    font-size: 18px;
    // font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dialog-header .close-btn {
    background: none;
    border: none;
    // color: white;
    font-size: 20px;
    cursor: pointer;
  }
  
  .dialog-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    // gap: 2px;
  }
  
  .dialog-body label {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .dialog-body input,
  .dialog-body select {
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
  
  .nurse-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nurse-checkboxes .checkbox-item {
    // display: flex;
    // align-items: center;
    gap: 6px;
    background-color: #f1f5f9;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #6f7ca0;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }

.form-section {
  margin-bottom: 20px; // 항목 간 간격

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
  }

  input,
  select {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
}

  
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    cursor: pointer;
  }
  
  .btn.cancel {
    background: #e5e7eb;
  }
  
  .btn.primary {
    background: #2563eb;
    color: white;
  }
  
  .btn.danger {
    background: #dc2626;
    color: white;
  }
  </style>
  