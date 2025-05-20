<!-- <template>
    <div class="schedule-calendar">
      <div class="filters">
        <label>수술실 선택:</label>
        <select v-model="selectedRoomId">
          <option :value="-1">전체</option>
          <option v-for="room in roomOptions" :key="room.id" :value="room.id">
            수술실 {{ room.id }}
          </option>
        </select>
        <button @click="openCreateDialog">수술 일정 생성</button>
      </div>
  
      <vue-cal
        ref="vueCalRef"
        class="vuecal--blue-theme"
        style="height: 600px"
        locale="ko"
        :events="calendarEvents"
        :editable-events="false"
        default-view="week"
        @event-click="onEventClick"
      />
  
      <dialog ref="createDialog">
        <form method="dialog" class="dialog-form">
          <h3>수술 일정 생성</h3>
          <label>수술실:</label>
          <select v-model="newEvent.roomId">
            <option v-for="room in roomOptions" :key="room.id" :value="room.id">
              수술실 {{ room.id }}
            </option>
          </select>
  
          <label>수술 간호사 선택:</label>
          <div class="nurse-checkboxes">
            <div v-for="nurse in nurseOptions" :key="nurse.id">
              <label>
                <input type="checkbox" :value="nurse.id" v-model="newEvent.nurseIds" />
                {{ nurse.name }}
              </label>
            </div>
          </div>
  
          <label>내용:</label>
          <input v-model="newEvent.content" />
          <label>시작 시간:</label>
          <input v-model="newEvent.startTime" type="datetime-local" />
          <label>종료 시간:</label>
          <input v-model="newEvent.endTime" type="datetime-local" />
          <label>비밀번호:</label>
          <input v-model="newEvent.password" type="password" />
  
          <div class="dialog-buttons">
            <button @click.prevent="createSchedule">저장</button>
            <button @click.prevent="closeCreateDialog">닫기</button>
          </div>
        </form>
      </dialog>
  
      <dialog ref="detailDialog">
        <form method="dialog" class="dialog-form">
          <h3>일정 상세보기</h3>
          <p><strong>내용:</strong> {{ selectedEvent?.title }}</p>
          <p><strong>시간:</strong> {{ formatDate(selectedEvent?.start) }} ~ {{ formatDate(selectedEvent?.end) }}</p>
          <p><strong>수술 간호사:</strong>
            <span v-for="id in selectedEvent?.nurseIds || []" :key="id">
              {{ getNurseNameById(id) }}<span v-if="id !== selectedEvent.nurseIds.at(-1)">, </span>
            </span>
          </p>
  
          <label>비밀번호:</label>
          <input v-model="deletePassword" type="password" placeholder="비밀번호 입력" />
  
          <div class="dialog-buttons">
            <button @click.prevent="confirmDelete">삭제</button>
            <button @click.prevent="closeDetailDialog">닫기</button>
          </div>
        </form>
      </dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { VueCal } from '@/vue-cal';
  import apiClient from '@/api/axios';
  
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
          name: event.roomId
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
      roomOptions.value = response.data.map(room => ({
        id: room.roomId,
        status: room.status
      }));
    } catch (error) {
      console.error('수술실 목록 불러오기 실패:', error);
    }
  };
  
  const loadNurses = async () => {
    try {
      const response = await apiClient.get('/nurses');
      nurseOptions.value = response.data.content.map(nurse => ({
        id: nurse.id,
        name: nurse.name
      }));
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
  
  <style scoped>
  .schedule-calendar {
    padding: 16px;
  }
  
  .filters {
    margin-bottom: 12px;
  }
  
  select, input {
    margin: 4px 0;
    padding: 4px 8px;
    display: block;
    width: 100%;
    max-width: 300px;
  }
  
  .dialog-form {
    border: 1px solid #ccc;
    padding: 16px;
    background: white;
    width: 100%;
    max-width: 400px;
  }
  
  .dialog-buttons {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
  
  .nurse-checkboxes label {
    display: block;
    margin-bottom: 4px;
  }
  </style> -->

  <template>
    <div class="schedule-calendar">
      <div class="filters">
        <label>수술실 선택:</label>
        <select v-model="selectedRoomId">
          <option :value="-1">전체</option>
          <option v-for="room in roomOptions" :key="room.id" :value="room.id">
            수술실 {{ room.id }}
          </option>
        </select>
        <button @click="openCreateDialog">수술 일정 생성</button>
      </div>
  
      <vue-cal
        ref="vueCalRef"
        class="vuecal--blue-theme"
        style="height: 600px"
        locale="ko"
        :events="calendarEvents"
        :editable-events="false"
        default-view="week"
        @event-click="onEventClick"
      />
  
      <!-- 수술 일정 생성 창 -->
      <dialog ref="createDialog" class="dialog">
        <form method="dialog" class="dialog-form">
          <div class="dialog-header">
            <h3>📝 수술 일정 생성</h3>
            <button type="button" class="close-btn" @click="closeCreateDialog">&times;</button>
          </div>
          <div class="dialog-body">
            <label>수술실</label>
            <select v-model="newEvent.roomId">
              <option v-for="room in roomOptions" :key="room.id" :value="room.id">
                수술실 {{ room.id }}
              </option>
            </select>
  
            <label>수술 간호사 선택</label>
            <div class="nurse-checkboxes">
              <label v-for="nurse in nurseOptions" :key="nurse.id" class="checkbox-item">
                <input type="checkbox" :value="nurse.id" v-model="newEvent.nurseIds" />
                {{ nurse.name }}
              </label>
            </div>
  
            <label>내용</label>
            <input v-model="newEvent.content" placeholder="수술 내용을 입력하세요" />
  
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
  
            <label>비밀번호</label>
            <input v-model="newEvent.password" type="password" placeholder="비밀번호 입력" />
          </div>
  
          <div class="dialog-footer">
            <button class="btn cancel" @click.prevent="closeCreateDialog">취소</button>
            <button class="btn primary" @click.prevent="createSchedule">저장</button>
          </div>
        </form>
      </dialog>
  
      <!-- 일정 상세보기 창 -->
      <dialog ref="detailDialog" class="dialog">
        <form method="dialog" class="dialog-form">
          <div class="dialog-header">
            <h3>📋 일정 상세보기</h3>
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
            <label>비밀번호</label>
            <input v-model="deletePassword" type="password" placeholder="비밀번호 입력" />
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
          name: event.roomId
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
  
  <style scoped>
  .schedule-calendar {
    padding: 16px;
  }
  
  .filters {
    margin-bottom: 12px;
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
    border: 1px solid #ccc;
    /* padding: 24px; */
    background: white;
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
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dialog-header .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
  }
  
  .dialog-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #f1f5f9;
    padding: 6px 10px;
    border-radius: 6px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
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
  