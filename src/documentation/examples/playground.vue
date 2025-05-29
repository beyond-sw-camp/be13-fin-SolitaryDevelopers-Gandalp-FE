<template lang="pug">
  v-card(style="width: 71.5vw; background-color: white; padding: 2%; border-radius: 25px; overflow: visible")
    v-row(justify="end" align="center")
      v-col(cols="auto")
        v-btn(size="small" variant="tonal" color="success" class="custom-btn" @click="addAndSaveEvent") 일정 생성

      v-col(cols="auto")
        v-btn-toggle(v-model="scheduleType" mandatory density="compact")
          v-btn(value="work" style="background-color: #e3f2fd") 근무
          v-btn(value="personal" style="background-color: #e3f2fd") 개인
          v-btn(value="surgery" style="background-color: #e3f2fd") 수술
          
      v-col(cols="auto")
        v-select(
          v-model="selectedClassFilter"
          :items="classFilterOptions"
          item-title="label"
          item-value="value"
          density="compact"
          variant="solo"
          label="간호사 이름"
          class="nurse-filter-select small-select no-shadow"
          style="width: 130px; border-radius: 10px; background-color: #edf7ff;"
          hide-details
          flat
          bg-color="#edf7ff"
        )



    v-row(no-gutters class="mt-4")
      v-col
        vue-cal.vue-cal--main.grow(
          style="height: 540px"
          ref="vueCalRef"
          @cell-drag-start="onCellDragStart"
          @cell-drag-end="onCellDragEnd"
          v-model:view="mainVuecalConfig.view"
          v-model:selected-date="mainVuecalConfig.selectedDate"
          v-model:view-date="mainVuecalConfig.viewDate"
          @update:view-date="pickerConfig.viewDate = $event"
          v-bind="mainVuecalConfig"
          @ready="log('ready', $event)"
          @view-change="log('view-change', $event)"
          @event-create="eventCreation.open"
          @event-mousedown="log('event-mousedown', $event)"
          @event-mouseup="log('event-mouseup', $event)"
          @event-click="log('event-click', $event)"
          @event-delayed-click="eventSelection.onEventDelayedClick"
          @event-hold="log('event-hold', $event)"
          @event-drag-start="log('event-drag-start', $event)"
          @event-drag="log('event-drag', $event)"
          @event-drag-end="log('event-drag-end', $event)"
          @event-drop="log('event-drop', $event)"
          @event-dropped="log('event-dropped', $event)"
          @event-resize="log('event-resize', $event)"
          @event-resize-end="log('event-resize-end', $event)"
          @event-contextmenu="log('event-contextmenu', $event)"
          @cell-click="log('cell-click', $event)"
          @cell-dblclick="log('cell-dblclick', $event)"
          @cell-drag="log('cell-drag', $event)"
          @cell-hold="log('cell-hold', $event)"
          @cell-mousedown="log('cell-mousedown', $event)"
          @cell-mouseup="log('cell-mouseup', $event)"
          @cell-touchstart="log('cell-touchstart', $event)"
          @cell-contextmenu="log('cell-contextmenu', $event)")
  
  w-dialog(
    v-if="eventCreation.event"
    v-model="eventCreation.show"
    width="420"
    @close="eventCreation.cancel"
  )
    .w-flex.column
      label.text-sm.font-semibold.mb2 제목
      input(
        v-model="eventCreation.event.title"
        placeholder="일정 제목을 입력하세요"
        class="input-basic"
      )
  
    .time-input-row
      .time-input-column
        label.text-sm.font-medium.mb1 시작 시간
        Datepicker(
          v-model="formStart"
          locale="ko"
          teleport
          time-picker-inline
          :enable-time-picker="true"
          :is-24="true"
          :format="'yyyy-MM-dd HH:mm'"
          auto-apply
        )
      .time-input-column
        label.text-sm.font-medium.mb-1 종료 시간
        Datepicker(
          v-model="formEnd"
          locale="ko"
          teleport
          time-picker-inline
          :enable-time-picker="true"
          :is-24="true"
          :format="'yyyy-MM-dd HH:mm'"
          auto-apply
        )
  
    label.text-sm.font-semibold.mt1 간호사 이름
    w-select(
      v-model="eventCreation.event.name"
      :items="nurseFilterOptions"
      placeholder="간호사를 선택하세요"
      :disabled="eventCreation.isEdit"
    )
  
    .w-flex.column
      label.text-sm.font-semibold.mt3.mb2 비밀번호
      input(
        v-model="userPassword"
        type="password"
        placeholder="간호사 비밀번호 입력"
        class="input-basic"
      )
  
    .modal-btns.mt4
      v-btn(size="small" variant="tonal" color="primary" @click="eventCreation.save") 저장
      v-btn(size="small" variant="tonal" color="error" @click="eventCreation.cancel") 취소


  //- .modal-mask(v-if="eventCreation.event && eventCreation.show" @click.self="eventCreation.cancel")
  //- .modal-wrapper
  //-   .modal-container
  //-     .modal-content
  //-       .modal-title 일정 생성

  //-       label 제목
  //-       input(v-model="eventCreation.event.title" placeholder="일정 제목을 입력하세요")

  //-       .time-input-row
  //-         .time-input-column
  //-           label 시작 시간
  //-           Datepicker(
  //-             v-model="formStart"
  //-             locale="ko"
  //-             teleport
  //-             time-picker-inline
  //-             :enable-time-picker="true"
  //-             :is-24="true"
  //-             :format="'yyyy-MM-dd HH:mm'"
  //-             auto-apply)
  //-         .time-input-column
  //-           label 종료 시간
  //-           Datepicker(
  //-             v-model="formEnd"
  //-             locale="ko"
  //-             teleport
  //-             time-picker-inline
  //-             :enable-time-picker="true"
  //-             :is-24="true"
  //-             :format="'yyyy-MM-dd HH:mm'"
  //-             auto-apply)

  //-       label 간호사 이름
  //-       w-select(
  //-         v-model="eventCreation.event.name"
  //-         :items="nurseFilterOptions"
  //-         placeholder="간호사를 선택하세요")

  //-       label 비밀번호
  //-       input(type="password" v-model="userPassword" placeholder="간호사 비밀번호 입력")

  //-       .modal-btns
  //-         v-btn(size="small" variant="tonal" color="error" @click="eventCreation.cancel") 취소
  //-         v-btn(size="small" variant="tonal" color="primary" @click="eventCreation.save") 저장
  //- w-dialog(
  //-   v-if="eventCreation.event"
  //-   v-model="eventCreation.show"
  //-   width="400"
  //-   @close="eventCreation.cancel")
  //-   label.text-sm.font-semibold.mb1 제목
  //-   w-input(
  //-     v-model="eventCreation.event.title"
  //-     placeholder="일정 제목을 입력하세요")

  //-   .w-flex.gap3
  //-     .w-flex.column.flex-1
  //-       label.text-sm.font-medium.text-gray-600.mb-1 시작 시간
  //-       Datepicker(
  //-         v-model="formStart"
  //-         locale="ko"
  //-         teleport  
  //-         time-picker-inline
  //-         :enable-time-picker="true"
  //-         :is-24="true"
  //-         :format="'yyyy-MM-dd HH:mm'"
  //-         auto-apply)
  //-     .w-flex.column.flex-1
  //-       label.text-sm.font-medium.text-gray-600.mb-1 종료 시간
  //-       Datepicker(
  //-         v-model="formEnd"
  //-         locale="ko"
  //-         teleport
  //-         time-picker-inline
  //-         :enable-time-picker="true"
  //-         :is-24="true"
  //-         :format="'yyyy-MM-dd HH:mm'"
  //-         auto-apply)

  //-   label.text-sm.font-semibold.mb1 간호사 이름
  //-   w-select(
  //-     v-model="eventCreation.event.name"
  //-     :items="nurseFilterOptions"
  //-     placeholder="간호사를 선택하세요"
  //-   )

  //-   label.text-sm.font-semibold.mt3 비밀번호
  //-   w-input(
  //-     v-model="userPassword"
  //-     type="password"
  //-     placeholder="간호사 비밀번호 입력"
  //-   )

  //-   .w-flex.justify-end.mt4.gap2
  //-     w-button(@click="eventCreation.cancel") 취소
  //-     w-button.primary(@click="eventCreation.save") 저장
  
  w-dialog(
    v-if="eventSelection.event"
    v-model="eventSelection.showDialog"
    width="420"
  )
    //- .w-flex.column
    label.text-sm.font-semibold.mb1 제목: 
    span.input-basic {{ eventSelection.event.title }}
    
    .w-flex.row
      label.text-sm.font-semibold.mb1 이름: 
      span.input-basic {{ getClassLabel(eventSelection.event.name) }}
    
    .time-input-row
      .time-input-column
        //- label.text-sm.font-medium.mb1 시작 시간
        span.input-basic {{ eventSelection.event.start.format('YYYY-MM-DD HH:mm') }} - {{ eventSelection.event.end.format('YYYY-MM-DD HH:mm') }}
      //- .time-input-column
        //- label.text-sm.font-medium.mb1 종료 시간
        //- span.input-basic {{ eventSelection.event.end.format('YYYY-MM-DD HH:mm') }}


    .modal-btns.mt4
      v-btn(
        v-if="!eventSelection.event.originalId"
        size="small"
        variant="tonal"
        color="primary"
        @click="updateSelectedEvent"
      ) 수정
      v-btn(
        v-if="!eventSelection.event.originalId"
        size="small"
        variant="tonal"
        color="error"
        @click="openDeleteDialog"
      ) 삭제
      v-btn(size="small" variant="tonal" @click="eventSelection.showDialog = false") 닫기

  
  w-dialog(
    v-model="deleteConfirm.show"
    title="비밀번호 입력"
    width="300"
  )
    w-input(
      v-model="userPassword"
      type="password"
      label="비밀번호"
      placeholder="비밀번호를 입력하세요"
    )
    .w-flex.justify-end.mt2.gap2
      w-button(@click="deleteConfirm.show = false") 취소
      w-button.danger(@click="confirmDeleteEvent") 삭제
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
  import { VueCal, addDatePrototypes } from '@/vue-cal'
  import { useAppStore } from '@/store'
  import axios from 'axios'
  import apiClient from '../../api/axios'
  import Datepicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  
  addDatePrototypes()

  const scheduleType = ref('personal'); // 'work', 'personal', 'surgery'

  const allCalendarEvents = ref([]);

  const userPassword = ref('');

  const deleteConfirm = reactive({
    show: ref(false)
  });

  const openDeleteDialog = () => {
    userPassword.value = '';
    deleteConfirm.show = true;
  };

  
  const addAndSaveEvent = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    cellDragStartTime.value = start;
    cellDragEndTime.value = end;

    selectedClassFilter.value = -1;

    const dummyEvent = {
      title: '',
      start,
      end,
      name: '',
      background: false
    };
  
    eventCreation.open({
      event: dummyEvent,
      resolve: (createdEvent) => {
        // if (createdEvent) {
        //   eventSelection.event = createdEvent;
        //   eventSelection.showDialog = true;
        // }
      }
    });
  };

  const nurseOptions = ref([]);

  const nurseFilterOptions = computed(() => nurseOptions.value);
  
  const store = useAppStore()
  const vueCalRef = ref(null)
  
  const formStart = ref('')
  const formEnd = ref('')
  
  const cellDragStartTime = ref(null)
  const cellDragEndTime = ref(null)
  
  const selectedClassFilter = ref(-1);
  
  const classFilterOptions = ref([
    { label: '전체', value: -1 },
  //   ...nurseRes.data.map(nurse => ({
  //   label: nurse.name,
  //   value: nurse.id
  // }))
    // { label: '근무', value: 'work' },
    // { label: '수술', value: 'surgery' },
    // { label: '운동', value: 'sport' }
  ])
  
  const getClassLabel = (classValue) => {
    const found = nurseOptions.value.find(opt => Number(opt.value) === Number(classValue));
    return found ? found.label : (classValue || '기타');
  }
  
  const rawEvents = ref([]) // 실제 일정 원본은 여기에 저장
  const calendarEvents = ref([])
  
  const filteredEvents = computed(() => {
    const filter = selectedClassFilter.value;
    if (filter === -1 || filter === null) return rawEvents.value;
    return rawEvents.value.filter(event => Number(event.name) === Number(filter));
  });

  
  watch(filteredEvents, (newEvents) => {
    calendarEvents.value = newEvents
  })
  
  
  
  const onCellDragStart = ({ startDate }) => {
    cellDragStartTime.value = startDate
  }
  const onCellDragEnd = ({ cell }) => {
    if (cell?.start && cell?.end) {
      formStart.value = formatLocalDateTime(cell.start)
      formEnd.value = formatLocalDateTime(cell.end)
      eventCreation.event.start = cell.start
      eventCreation.event.end = cell.end
    }
  }
  
  function formatLocalDateTime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}` // 초, 밀리초, 'Z' 없이
  }
  
  function parseLocalDate(utcString) {
    if (!utcString) return new Date();
    return new Date(utcString);
  }
  
  
  const locales = [
    { value: 'ko', label: 'ko' },
    { value: 'en-gb', label: 'en-gb' },
    { value: 'en-us', label: 'en-us' },
    { value: 'ja', label: 'ja' },
    { value: 'zh-cn', label: 'zh-cn' },
    { value: 'ar', label: 'ar' },
    { value: 'fr', label: 'fr' },
    { value: 'ca', label: 'ca' }
  ]
  
  const views = {
    day: { label: '일' },
    // days: { label: 'Days', cols: 365, rows: 1 },
    week: { label: '주' },
    month: { label: '월' },
    year: { label: '연도' },
    years: { label: 'Years' }
  }
  const viewsArray = Object.entries(views).map(([viewId, obj]) => ({ ...obj, value: viewId }))
  
  const size = ref(null)
  const sizes = [
    { value: null, label: 'Normal' },
    { value: 'sm', label: 'small' },
    { value: 'xs', label: 'Extra small' }
  ]
  
  const weekdays = [{ label: '월' }, { label: 'tue' }, { label: 'wed' }, { label: 'thu' }, { label: 'fri' }, { label: 'sat' }, { label: 'sun' }]
  const hideWeekdays = ref([])
  
  // const eventClasses = [
  //   { value: 'work', label: 'Work' },
  //   { value: 'surgery', label: 'Surgery' },
  //   { value: 'sport', label: 'Sport' }
  // ]
  
  const pickerConfig = reactive({
    datePicker: true,
    // dark: computed(() => store.darkMode),
    selectedDate: computed(() => mainVuecalConfig.selectedDate),
    locale: computed(() => mainVuecalConfig.locale),
    startWeekOnSunday: computed(() => mainVuecalConfig.startWeekOnSunday),
    todayButton: computed(() => mainVuecalConfig.todayButton),
    hideWeekends: computed(() => mainVuecalConfig.hideWeekends),
    hideWeekdays: computed(() => mainVuecalConfig.hideWeekdays),
    viewDayOffset: computed(() => mainVuecalConfig.viewDayOffset)
  })
  
  const mainVuecalConfig = reactive({
    views,
    view: ref('week'),
    // dark: computed(() => store.darkMode),
    selectedDate: ref(null),
    viewDate: ref(new Date()),
    locale: ref('ko'),
    startWeekOnSunday: ref(false),
    todayButton: ref(true),
    xs: computed(() => size.value === 'xs'),
    sm: computed(() => size.value === 'sm'),
    // timeFrom: 7 * 60,
    // timeTo: 20 * 60,
    timeStep: 30,
    twelveHour: ref(false),
    hideWeekends: ref(false),
    hideWeekdays,
    viewDayOffset: ref(0),
    clickToNavigate: computed(() => mainVuecalConfig.view === 'year' || mainVuecalConfig.view === 'years'),
    watchRealTime: ref(true),
    // events: filteredEvents,
    events: calendarEvents,
    showSchedules: ref(false),
    schedules: computed(() => {
      return mainVuecalConfig.showSchedules ? [
        { label: 'Dr 1', class: 'dr-1', style: 'background-color: rgba(255, 0, 0, 0.1)' },
        { label: 'Dr 2', class: 'dr-2' }
      ] : undefined
    }),
    eventsOnMonthView: true,
    // showSpecialHours: ref(false),
    // specialHours: computed(() => {
    //   return mainVuecalConfig.showSpecialHours ? {
    //     mon: { from: 0 * 60, to: 23 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Full day shift</em>' },
    //     tue: { from: 4 * 60, to: 5 * 60, class: 'doctor-2', label: '<strong>Doctor 2</strong><em>Full day shift</em>' },
    //     wed: [
    //       { from: 8 * 60, to: 12 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Morning shift</em>' },
    //       { from: 14 * 60, to: 19 * 60, class: 'doctor-3', label: '<strong>Doctor 3</strong><em>Afternoon shift</em>' }
    //     ],
    //     thu: { from: 8 * 60, to: 17 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Full day shift</em>' },
    //     fri: { from: 9 * 60, to: 18 * 60, class: 'doctor-3', label: '<strong>Doctor 3</strong><em>Full day shift</em>' },
    //     sat: { from: 9 * 60, to: 18 * 60, class: 'doctor-2', label: '<strong>Doctor 2</strong><em>Full day shift</em>' },
    //     sun: { from: 7 * 60, to: 20 * 60, class: 'closed', label: '<strong>Closed</strong>' }
    //   } : undefined
    // }),
    editableEvents: computed(() => true)
  })
  
  let eventCounter = 2 // Starts with 2 events in the array.
  const addEventFromOutside = () => {
    mainVuecalConfig.events.push({
      title: 'Event ' + ++eventCounter,
      start: (new Date()).subtractHours(2),
      end: (new Date()).subtractHours(1),
      schedule: ((eventCounter - 1) % 2) + 1
    })
  }
  
  const addEventFromVueCal = () => {
    vueCalRef.value.view.createEvent({
      title: 'Event ' + ++eventCounter,
      start: new Date(),
      end: (new Date()).addHours(1),
      schedule: ((eventCounter - 1) % 2) + 1
    })
  }
  
  const log = (...args) => console.log(...args)
  
  const eventSelection = reactive({
    onEventDelayedClick: e => {
      log('event-delayed-click', e)
  
      eventSelection.event = e.event
      eventSelection.showDialog = true
    },
    showDialog: ref(false),
    event: ref(null)
  })
  
  const updateSelectedEvent = () => {
    const selected = eventSelection.event;
    if (!selected) return;
  
    userPassword.value = '';

    eventSelection.showDialog = false;
    eventCreation.open({
      event: {
        ...selected,
        id: selected.id,
        start: selected.start,
        end: selected.end,
        title: selected.title,
        name: selected.name,
        background: selected.background ?? false
      },
      resolve: (updatedEvent) => {
        if (updatedEvent) {
          const index = rawEvents.value.findIndex(e => e.id === updatedEvent.id);
          if (index !== -1) {
            Object.assign(rawEvents.value[index], {
              ...updatedEvent,
              // start: parseLocalDate(updatedEvent.startDate),
              // end: parseLocalDate(updatedEvent.endDate),
              start: new Date(updatedEvent.start), 
              end: new Date(updatedEvent.end),
              editable: false
            });
          }
          calendarEvents.value = [...filteredEvents.value];
  
          eventSelection.event = null;
          eventSelection.showDialog = false;
        }
      }
    });
  
    formStart.value = formatLocalDateTime(selected.start);
    formEnd.value = formatLocalDateTime(selected.end);
  }
  
  const confirmDeleteEvent = async () => {
    const id = eventSelection.event?.id;
    if (!id) {
      alert('삭제할 수 없습니다.');
      return;
    }
  
    try {
      await apiClient.delete('/calendars', {
        data: {
          scheduleId: id,
          password: userPassword.value
        }
      });
    
      rawEvents.value = rawEvents.value.filter(e => e.id !== id);
      calendarEvents.value = [...filteredEvents.value];
    
      eventSelection.showDialog = false;
      await loadAllEvents();
      eventSelection.event = null;
      deleteConfirm.show = false;
      userPassword.value = ''; // 초기화

    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  
  const eventCreation = reactive({
    show: ref(false),
    resolve: null,
    isEdit: false,
    event: {
      title: '',
      background: false,
      name: ''
    },
    open: ({ event, resolve }) => {
      eventCreation.show = true
      eventCreation.event = { ...event }
      eventCreation.isEdit = !!event.id
      if (cellDragStartTime.value && cellDragEndTime.value) {
        formStart.value = formatLocalDateTime(cellDragStartTime.value)
        formEnd.value = formatLocalDateTime(cellDragEndTime.value)
        event.start = cellDragStartTime.value
        event.end = cellDragEndTime.value
      } else {
        formStart.value = event.start ? formatLocalDateTime(event.start) : ''
        formEnd.value = event.end ? formatLocalDateTime(event.end) : ''
      }
      eventCreation.resolve = resolve
      log('event-create', { event, resolve })
    },
    cancel: () => {
      eventCreation.resolve(false)
      eventCreation.show = false
    },
    // save: () => {
    //   eventCreation.resolve(eventCreation.event)
    //   eventCreation.show = false
    // }
    
    save: async () => {
  
      function toUTCISOStringFromLocalInput(datetimeStr) {
        if (!datetimeStr) return NaN;
            
        // datetimeStr이 Date 객체일 경우 문자열로 변환
        if (datetimeStr instanceof Date) {
          return new Date(datetimeStr.getTime() - datetimeStr.getTimezoneOffset() * 60000).toISOString();
        }
      
        if (typeof datetimeStr !== 'string' || !datetimeStr.includes('T')) return NaN;
      
        const [datePart, timePart] = datetimeStr.split('T');
        if (!datePart || !timePart) return NaN;
      
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        if ([year, month, day, hour, minute].some(isNaN)) return NaN;
      
        const localDate = new Date(year, month - 1, day, hour, minute);
        return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
      }


      const startDate = toUTCISOStringFromLocalInput(formStart.value);
      const endDate = toUTCISOStringFromLocalInput(formEnd.value);


      if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
        alert('유효하지 않은 날짜입니다.');
        return;
      }
    
      const payload = {
        // title: eventCreation.event.title,
        // name: eventCreation.event.name,
        // // background: eventCreation.event.background,
        // startDate,  // ← UTC ISO 문자열
        // endDate
        nurseId: eventCreation.event.name, 
        password: userPassword.value,     // ← 사용자가 입력한 비밀번호
        content: eventCreation.event.title,
        startTime: startDate, // ISO
        endTime: endDate      // ISO
      };

      try {
        let response;
        if (eventCreation.event.id) {
          // response = await apiClient.put('/calendars/', payload);
          response = await apiClient.put('/calendars', {
            // nurseId: eventCreation.event.name,
            scheduleId: eventCreation.event.id,
            password: userPassword.value,
            content: eventCreation.event.title,
            startTime: startDate,
            endTime: endDate
          });
        } else {
          // response = await apiClient.post('/calendars', payload);
          response = await apiClient.post('/calendars', {
            nurseId: eventCreation.event.name,
            password: userPassword.value,
            content: eventCreation.event.title,
            startTime: startDate,
            endTime: endDate
          });
        }
  
        const newEvent = {
          ...response.data,
          start: parseLocalDate(response.data.startTime),
          end: parseLocalDate(response.data.endTime),
          editable: false,
          class: response.data.originalId ? 'surgery' : 'work'
        };
  
        if (eventCreation.event.id) {
          // 기존 이벤트 교체
          const index = rawEvents.value.findIndex(e => e.id === eventCreation.event.id);
          if (index !== -1) {
            Object.assign(rawEvents.value[index], newEvent);
          }
        } else {
          rawEvents.value.push(newEvent);
          // calendarEvents.value = [...filteredEvents.value];
          // vueCalRef.value.view.createEvent(newEvent); // ← 신규일 때만 추가

          const nurseFilter = selectedClassFilter.value;
          if (
            nurseFilter === -1 ||
            Number(newEvent.name) === Number(nurseFilter)
          ) {
            calendarEvents.value = [...filteredEvents.value];
          }
        }
        
        eventCreation.resolve?.(newEvent);
        eventCreation.show = false;
        userPassword.value = '';
        await nextTick();
        await loadAllEvents();
        calendarEvents.value = [...filteredEvents.value];
        mainVuecalConfig.events = calendarEvents.value
        cellDragStartTime.value = null
        cellDragEndTime.value = null
        
      } catch (error) {
        console.error('일정 저장 실패:', error)
        console.log(error)
        alert('일정 저장에 실패했습니다.')
      }
    }
    
  })

const loadWorkSchedules = async () => {
  try {
    const response = await apiClient.get('/schedules');
    return response.data.map(event => ({
      id: event.workScheduleId,
      title: event.content || event.codeLabel || '근무 일정',
      start: parseLocalDate(event.startTime),
      end: parseLocalDate(event.endTime),
      name: Number(event.nurseId),
      editable: false,
      class: 'work'
    }));
  } catch (error) {
    console.error('근무 일정 로딩 실패:', error);
    return [];
  }
};


  // 일정 불러오기 함수
const loadSchedules = async () => {
  try {
    let response;
    if (selectedClassFilter.value === -1 || selectedClassFilter.value === null) {
      response = await apiClient.get('/calendars'); // 전체 간호사 일정
    } else {
      response = await apiClient.get(`/calendars/${selectedClassFilter.value}`); // 특정 간호사 일정
    }

    const fetchedEvents = response.data.map(event => ({
      id: event.scheduleId,
      title: event.content,
      start: parseLocalDate(event.startTime),
      end: parseLocalDate(event.endTime),
      name: Number(event.nurseId),
      editable: false,
      class: 'work'
    }));

    // rawEvents.value = fetchedEvents;
    calendarEvents.value = fetchedEvents;
    return fetchedEvents;
  } catch (error) {
    console.error('일정 불러오기 실패:', error);
    return [];
  }
};

const loadOrsSchedules = async () => {
  try {
    const response = await apiClient.get('/ors');
    const allEvents = response.data;

    const orsEvents = allEvents.flatMap(event =>
      event.nurseIds.map(nurseId => ({
        id: `${event.surgeryScheduleId}-${nurseId}`,
        title: event.content,
        start: parseLocalDate(event.startTime),
        end: parseLocalDate(event.endTime),
        name: nurseId,
        originalId: event.surgeryScheduleId,
        editable: false,
        class: 'surgery'
      }))
    );

    // rawEvents.value = orsEvents;
    calendarEvents.value = [...filteredEvents.value];
    return orsEvents;
  } catch (error) {
    console.error('수술 일정 로딩 실패:', error);
    return [];
  }
};

// const loadAllEvents = async () => {
//   const [scheduleEvents, orsEvents] = await Promise.all([
//     loadSchedules(),
//     loadOrsSchedules()
//   ]);
//   // allCalendarEvents.value = [...scheduleEvents, ...orsEvents];
//   rawEvents.value = [...scheduleEvents, ...orsEvents];
//   calendarEvents.value = [...filteredEvents.value];
// };
const loadAllEvents = async () => {
  let events = [];
  if (scheduleType.value === 'personal') {
    const personalEvents = await loadSchedules();
    events = personalEvents;
  } else if (scheduleType.value === 'surgery') {
    events = await loadOrsSchedules();
  } else if (scheduleType.value === 'work') {
    events = await loadWorkSchedules();
  }

  rawEvents.value = events;
  calendarEvents.value = [...filteredEvents.value];
};


// watch(selectedClassFilter, async () => {
//   await loadAllEvents();
// });
watch([selectedClassFilter, scheduleType], async () => {
  await loadAllEvents();
});

  
onMounted(async () => {
  // await loadSchedules();
  // await loadOrsSchedules(); 
  await loadAllEvents();

  try {
    const nurseRes = await apiClient.get('/nurses/list');
    const nurses = nurseRes.data;

    console.log(nurseRes);

    nurseOptions.value = nurses.map(nurse => ({
      label: nurse.name,
      value: nurse.id
    }));

    classFilterOptions.value = [
      { label: '전체', value: -1 },
      ...nurseOptions.value
    ];
  } catch (error) {
    console.error('간호사 목록 불러오기 실패:', error);
  }
});


  </script>
  
  <style lang="scss">

  .modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  width: 100vw;
  height: 100vh;
}

.modal-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 350px;
  min-height: 400px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 24px 32px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15);
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

.modal-content input {
  width: 220px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 7px;
  font-size: 13px;
}

.time-input-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.time-input-column {
  display: flex;
  flex-direction: column;
}

.modal-btns {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  justify-content: center;
  width: 100%;
}
  
  .custom-btn {
    padding: 4px 8px !important;
    font-size: 12px;
    min-height: 32px !important;
  }

  .page--playground {
    /* padding: 40px 0 8px; */
    padding: 0 0 8px;
    border-left: none;
    overflow: auto;
    max-width: none;
    height: 100dvh;
  
    // Global.
    ~ footer, aside, h1 {display: none;}
    .main--examples {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
    }
  
    main {
      display: flex;
      flex-direction: column;
      border: none;
      padding: 0;
      flex-grow: 1;
    }
  
    main aside {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      width: 215px;
      padding: 0;
    }
  
    /* .config-panel {
      padding: 12px;
      background-color: color-mix(in srgb, var(--w-contrast-bg-color) 5%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--w-contrast-bg-color) 8%, transparent);
    } */
  
    .vue-cal--main {--vuecal-height: 100%;}
  
    // Min cell width example.
    // --------------------------------------------------------
    // .vuecal__headings-bar {margin: auto;} // So it will fill up the whole available space.
    // .vuecal__weekday,
    // .vuecal--week-view .vuecal__cell,
    // .vuecal--days-view .vuecal__cell {min-width: 300px;}
    // .vuecal--week-view .vuecal__cell,
    // .vuecal--days-view .vuecal__cell {min-height: 3000px;}
    // --------------------------------------------------------
  
    .vuecal__special-hours {
      text-align: center;
  
      // .business-hours {background-color: rgba(117, 176, 255, 0.2);color: hsl(217, 80%, 67%);}
      &.doctor-1 {background-color: hsl(127deg 43% 60% / 15%);color: hsl(127, 50%, 67%);}
      &.doctor-2 {background-color: hsl(217deg 43% 60% / 15%);color: hsl(217, 80%, 67%);}
      &.doctor-3 {background-color: hsl(287deg 43% 60% / 15%);color: hsl(287, 80%, 67%);}
      &.closed {
        background: repeating-linear-gradient(-45deg, rgba(#fff, 0) 0 6px, rgba(#ffa257, 0.15) 6px 20px);
        color: hsl(27, 90%, 63%);
      }
  
      em {
        font-size: 0.9em;
        color: #999;
        line-height: 1.15;
      }
    }
  
    .vuecal__schedule {
      &.dr-1 {background-color: rgba(134, 192, 253, 0.1);}
      &.dr-2 {background-color: rgba(187, 148, 255, 0.15);}
      // .vuecal--dark &.dr-1 {background-color: rgba(143, 158, 196, 0.1);}
      // .vuecal--dark &.dr-2 {background-color: rgba(131, 184, 255, 0.1);}
    }
  
    // .vuecal__event.leisure {background-color: #fd9c42d9;border-color: #e9882e;}
    // .vuecal__event.health {background-color: #57cea9cc;border-color: #90d2be;}
    // .vuecal__event.sport {background-color: #ff6666d9;border-color: #eb5252;}
    .vuecal__event.work {background-color: #9b76d8d9;border-color: #9b76d8d9;}
    .vuecal__event.surgery {background-color: #57cea9cc;border-color: #90d2be;}
    .vuecal__event.sport {background-color: #ff6666d9;border-color: #eb5252;}
  }
  
  // Media queries.
  // --------------------------------------------------------
  @media screen and (max-width: $sm) {
    .main--playground aside {
      position: absolute;
      bottom: 5px;
      left: 5px;
      z-index: 10;
      background: var(--w-base-bg-color);
    }
    .vue-cal--main {margin-left: 80px;}
  }
  
  @media screen and (max-width: $xs) {
    .main--playground aside {
      bottom: -8px;
      left: -8px;
      transform: scale(0.9);
    }
    .vue-cal--main {margin-left: 0;}
  }

  </style>
