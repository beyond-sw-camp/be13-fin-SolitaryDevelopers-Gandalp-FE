<template>
  <div class="main-page">
  <v-card style="width: 70.5vw; background-color: white; padding: 2%; border-radius: 25px;">
    <v-row justify="end" class="mb-1">
      <v-col cols="3" class="d-flex justify-end">
        <v-select
          v-model="selectedRoomId"
          :items="roomOptions"
          class="small-select no-shadow"
          density="compact"
          variant="solo"
          item-title="label"
          item-value="id"
          label="수술실 선택"
          style="border-radius: 10px"
          hide-details
          flat
          bg-color="#edf7ff"
          :return-object="false"
        ></v-select>
      </v-col>
    </v-row>

    <vue-cal
      style="height: 450px;"
      ref="vueCalRef"
      class="vuecal--blue-theme rounded-lg elevation-1"
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
    <v-row justify="space-between" class="mt-1">
      <v-col class="text-end">
        <v-btn color="success" variant="tonal" class="custom-btn" size="small" @click="openCreateDialog">예약</v-btn>
      </v-col>
    </v-row>
  </v-card>
  </div>

    <!-- 수술 일정 생성 -->
  <div class="modal-mask" v-if="createDialogVisible" @click.self="closeCreateDialog">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-title">수술 일정 생성</div>

          <label>수술실</label>
          <select v-model="newEvent.roomId" class="modal-select">
            <option v-for="room in roomOptions" :key="room.id" :value="room.id">
              {{ room.id }}
            </option>
          </select>

          <label>간호사 선택</label>
          <v-virtual-scroll
            :items="nurseOptions"
            class="nurse-list"
          >
            <template v-slot:default="{ item }">
              <v-checkbox
                v-model="newEvent.nurseIds"
                :label="item.name"
                :value="item.id"
                density="compact"
              />
            </template>
          </v-virtual-scroll>

          <label>내용</label>
          <textarea
            v-model="newEvent.content"
            class="modal-input"
            placeholder="내용 입력"
            style="width: 300px;"
            rows="4"
          />

          <label>시작 시간</label>
          <Datepicker
            v-model="newEvent.startTime"
            :max-date="newEvent.endTime"
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
            :min-date="newEvent.startTime"
            locale="ko"
            time-picker-inline
            :enable-time-picker="true"
            :is-24="true"
            :format="'yyyy-MM-dd HH:mm'"
            auto-apply
          />

          <label>비밀번호</label>
          <input
            type="password"
            v-model="newEvent.password"
            placeholder="비밀번호 입력"
            class="modal-input"
          />

          <div class="modal-btns">
            <v-btn size="small" variant="tonal" color="primary" @click="createSchedule">저장</v-btn>
            <v-btn size="small" variant="tonal" color="error" @click="closeCreateDialog">취소</v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
<!-- 
  <v-dialog v-model="createDialogVisible" max-width="600px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
          <span>수술 일정 생성</span>
          <v-btn icon variant="text" elevation="0" class="no-bg-icon" @click="closeDetailDialog">
            
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="newEvent.roomId"
                  :items="roomOptions"
                  item-title="id"
                  item-value="id"
                  label="수술실"
                  density="compact"
                  variant="outlined"
                />
              </v-col>

              <v-virtual-scroll
                :items="nurseOptions"
              >
                <template v-slot:default="{ item }">
                  <v-checkbox
                    v-model="newEvent.nurseIds"
                    :label="item.name"
                    :value="item.id"
                    density="compact"
                  />
                </template>
              </v-virtual-scroll>

              <v-col cols="12">
                <v-text-field v-model="newEvent.content" label="내용" density="compact" variant="outlined" />
              </v-col>

              <v-col cols="6">
                <Datepicker
                  v-model="newEvent.startTime"
                  locale="ko"
                  time-picker-inline
                  :enable-time-picker="true"
                  :is-24="true"
                  :format="'yyyy-MM-dd HH:mm'"
                  auto-apply
                />
              </v-col>

              <v-col cols="6">
                <Datepicker
                  v-model="newEvent.endTime"
                  locale="ko"
                  time-picker-inline
                  :enable-time-picker="true"
                  :is-24="true"
                  :format="'yyyy-MM-dd HH:mm'"
                  auto-apply
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="newEvent.password"
                  type="password"
                  label="비밀번호"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeCreateDialog">취소</v-btn>
          <v-btn color="primary" @click="createSchedule">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->

    <!-- 수술 일정 상세 -->
    <v-dialog v-model="detailDialogVisible" max-width="500px">
      <v-card>
        <!-- <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
          <span>수술 일정 상세 보기</span>
        </v-card-title> -->

        <v-card-text>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>내용</v-list-item-title>
              <v-list-item-subtitle>{{ selectedEvent?.title }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>시간</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(selectedEvent?.start) }} ~ {{ formatDate(selectedEvent?.end) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>수술 간호사</v-list-item-title>
              <v-list-item-subtitle>
                <span v-for="id in selectedEvent?.nurseIds || []" :key="id">
                  {{ getNurseNameById(id) }}<span v-if="id !== selectedEvent.nurseIds.at(-1)">, </span>
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <!-- <v-text-field
            v-model="deletePassword"
            label="비밀번호 입력"
            type="password"
            density="compact"
            variant="outlined"
            class="mt-4 password-field"
          /> -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>비밀번호</v-list-item-title>
              <input
                style="padding: 0px;"
                v-model="deletePassword"
                placeholder="비밀번호 입력"
                type="password"
                class="modal-input"
              />
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
        <!-- <label>비밀번호</label>
        <input
          style="padding: 10px;"
          v-model="deletePassword"
          placeholder="비밀번호 입력"
          type="password"
          class="modal-input"
        /> -->

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDetailDialog">닫기</v-btn>
          <v-btn color="error" @click="confirmDelete">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { VueCal } from '@/vue-cal';
  import apiClient from '@/api/axios';
  import Datepicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  const createDialogVisible = ref(false)
  const detailDialogVisible = ref(false)
  
  const selectedRoomId = ref(null);
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

  const toKSTISOString = (date) => {
    if (!date) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset); // KST 기준
    return localDate.toISOString().slice(0, 19); // 초 단위까지, 'Z' 제거
  };
  
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
      roomOptions.value = response.data.map(room => ({ id: room.roomId, label: `수술실 ${room.roomId}` }));
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
    createDialogVisible.value = true
    newEvent.value = {
      roomId: roomOptions.value[0]?.id || null,
      nurseIds: [],
      content: '',
      password: '',
      startTime: '',
      endTime: ''
    };
    // createDialog.value?.showModal();
  };
  
  const closeCreateDialog = () => {
    createDialogVisible.value = false
    // createDialog.value?.close();
  };
  
  const createSchedule = async () => {
    try {
      const payload = {
        roomId: newEvent.value.roomId,
        nurseIds: newEvent.value.nurseIds,
        content: newEvent.value.content,
        password: newEvent.value.password,
        startTime: toKSTISOString(newEvent.value.startTime),
        endTime: toKSTISOString(newEvent.value.endTime)
      };

      await apiClient.post('/ors', payload);
      // await apiClient.post('/ors', newEvent.value);
      
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
    detailDialogVisible.value = true;
  };
  
  const closeDetailDialog = () => {
    detailDialogVisible.value = false;
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

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw; height: 100vh;
}

.modal-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 350px;
  min-height: 450px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 24px 32px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}

.modal-content label {
  align-self: flex-start;
  margin-bottom: 4px;
  font-size: 13px;
  margin-top: 8px;
}

.modal-input, .modal-select {
  width: 300px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 7px;
  font-size: 13px;
}

/* ::v-deep(.nurse-list .v-label) {
  font-size: 12px;
} */

::v-deep(.nurse-list .v-selection-control) {
  margin: 2px 0 !important;         
  padding: 0 !important;
  min-height: 24px !important;      
}

::v-deep(.nurse-list .v-label) {
  font-size: 12px !important;       
  line-height: 1 !important;
}


.nurse-list {
  width: 300px;
  margin-bottom: 8px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 7px;
  padding: 6px 10px;
  background: #f9f9f9;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 4px;
}

.modal-btns {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  justify-content: center;
  width: 100%;
}

.main-page {
  padding: 24px;
  border-radius: 10px;
  font-family: 'Noto Sans KR', sans-serif;
}

::v-deep(.password-field .v-input) {
  max-width: 200px !important;
  width: 200px !important;
}

/* ::v-deep(.password-field .v-field) {
  min-height: 36px !important;
  height: 36px !important;
  font-size: 13px !important;
  padding: 0 !important;
}

::v-deep(.small-select .v-field) {
  min-height: 35px !important;
  height: 40px !important;
  font-size: 13px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-radius: 8px;
} */

::v-deep(.small-select .v-field) {
  min-height: 35px !important;
  height: 40px !important;
  font-size: 13px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-radius: 8px;
}

::v-deep(.small-select) {
  max-width: 200px;
  font-size: 13px;
}

.v-col {
  height: 70px;
}

.main-wrapper {
  margin: 0 auto;
  padding: 0px 100px !important;
}

.custom-btn {
  padding: 4px 8px !important;
  font-size: 12px !important;
  min-height: 10px !important;
}

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
  background: #d1d5db;
}

.filters {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
}

  .vuecal__event.surgery {background-color: #57cea9cc;border-color: #90d2be;}

  ::v-deep(.vuecal__event.surgery) {
    background-color: #57cea9cc;
    border-color: #90d2be;
    color: #ffffff;
    font-weight: bold;
    border-radius: 6px;
    font-size: 12px;
    padding: 4px 6px;
    border: none;
    margin: 5px;
    display: inline-block;
    width: auto;
    max-width: 80%;         
    white-space: normal;      
    word-break: break-word;   
    overflow-wrap: break-word;
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
  gap: 12px; 
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

  .dialog-form {
    /* // border: 1px solid #ccc; */
    /* padding: 24px; */
    /* // background: white; */
    width: 100%;
    /* max-width: 400px; */
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 8px;
  }
  
  .dialog-header {
    background-color: #52586a;
    color: white;
    padding: 16px 24px;
    font-size: 18px;
    /* // font-weight: bold; */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dialog-header .close-btn {
    background: none;
    border: none;
    /* // color: white; */
    font-size: 20px;
    cursor: pointer;
  }
  
  .dialog-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    /* // gap: 2px; */
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
    /* // display: flex; */
    /* // align-items: center; */
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
  margin-bottom: 20px;

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
    background: #577dcf;
    color: white;
  }
  
  .btn.danger {
    background: linear-gradient(90deg, #F2A39F 26%, #F5B8B4 100%);
    color: rgb(0, 0, 0);
  }
  </style>
  