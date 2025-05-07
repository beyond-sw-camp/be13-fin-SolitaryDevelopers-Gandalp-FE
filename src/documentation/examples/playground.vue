<template lang="pug">
.config-panel.w-flex.gap6.no-grow
  .w-flex.column.gap1.no-grow
    //- w-switch.no-grow(v-model="mainVuecalConfig.twelveHour") 12h Format
    //- w-switch.lh0.no-grow(v-model="mainVuecalConfig.startWeekOnSunday") Start Week On Sunday
    //- w-switch.no-grow(v-model="mainVuecalConfig.hideWeekends") Hide Weekends
    w-switch.no-grow(v-model="mainVuecalConfig.clickToNavigate") Click to Navigate
    //- w-switch.no-grow(v-model="mainVuecalConfig.showSchedules") Day Schedules
    w-switch.no-grow(v-model="mainVuecalConfig.showSpecialHours") Business Hours
    w-switch.no-grow(v-model="mainVuecalConfig.editableEvents") Editable Events

  .w-flex.column.grow
    .mta.w-flex.justify-space-between.no-grow.gap2
      .w-flex.wrap.gap2
        //- w-button(
        //-   @click="addEventFromOutside"
        //-   tooltip="Add event to the<br>events array prop") Add Event Externally
        w-button(
          @click="addAndSaveEvent") 일정 생성
        //- w-button(
        //-   @click="addEventFromVueCal"
        //-   tooltip="Add event via<br><code>$refs.vuecal.view.createEvent()</code>") Add Event Internally
        w-select(
          v-model="selectedClassFilter"
          :items="classFilterOptions"
          label="분류별 보기"
          return-values
          clearable)
      //- w-radios.justify-end(
      //-   v-model="mainVuecalConfig.view"
      //-   :items="viewsArray"
      //-   inline)

.w-flex.gap2.mt2.mx2.ovh
  aside.no-shrink.no-grow
    vue-cal.no-shrink.no-grow(
      v-model:selected-date="mainVuecalConfig.selectedDate"
      @update:selected-date="mainVuecalConfig.viewDate = $event"
      v-bind="pickerConfig")

    .w-flex.align-center.gap1.body.wrap.no-grow
      span View Date:
      template(v-if="mainVuecalConfig.viewDate")
        span.code {{ mainVuecalConfig.viewDate.format('DD/MM/YYYY') }}
        w-icon.grey.mx-1(xs) mdi mdi-clock-outline
        span.code {{ mainVuecalConfig.viewDate.formatTime() }}
      .grey(v-else) N/A
    .w-flex.align-center.gap1.wrap.size--sm.no-grow
      span Selected Date:
      template(v-if="mainVuecalConfig.selectedDate")
        span.code {{ mainVuecalConfig.selectedDate.format('DD/MM/YYYY') }}
        w-icon.grey.mx-1(xs) mdi mdi-clock-outline
        span.code {{ mainVuecalConfig.selectedDate.formatTime() }}
      .grey(v-else) N/A

  vue-cal.vue-cal--main.grow(
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
  width="300"
  @close="eventCreation.cancel")
  w-input(v-model="eventCreation.event.title") 제목
  w-input(
  type="datetime-local"
  v-model="formStart"
  label="Start Time")
  w-input(
  type="datetime-local"
  v-model="formEnd"
  label="End Time")
  w-select(v-model="eventCreation.event.name" :items="eventClasses") 간호사 이름
  //- w-switch.my2(v-model="eventCreation.event.background") Background
  .w-flex.justify-end.mt2.gap2
    w-button(@click="eventCreation.cancel") 취소
    w-button(@click="eventCreation.save") 저장

w-dialog(
  v-if="eventSelection.event"
  v-model="eventSelection.showDialog"
  :title="eventSelection.event.title"
  width="380")
  .w-flex.justify-end.mt2.gap2
    w-button(@click="updateSelectedEvent") 수정
    w-button.danger(@click="deleteSelectedEvent") 삭제
    w-button(@click="eventSelection.showDialog = false") 닫기
  .w-flex.align-center.justify-end.gap2
    w-icon.grey mdi mdi-calendar
    small {{ eventSelection.event.start.format() }}
    w-icon.grey.ml2 mdi mdi-clock-outline
    small {{ eventSelection.event.start.formatTime() }} - {{ eventSelection.event.end.formatTime() }}
    .w-flex.align-center.justify-start.mt2
      w-icon.grey mdi mdi-tag-outline
      small {{ getClassLabel(eventSelection.event.name) }}
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { VueCal, addDatePrototypes } from '@/vue-cal'
import { useAppStore } from '@/store'
import axios from 'axios'
import apiClient from '../../api/axios'

addDatePrototypes()

const addAndSaveEvent = () => {
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1시간

  const dummyEvent = {
    title: 'New Event',
    start,
    end,
    class: '',
    background: false
  };

  // const resolve = (savedEvent) => {
  //   if (savedEvent) {
  //     rawEvents.value.push({
  //       ...savedEvent,
  //       start: parseLocalDate(savedEvent.startDate),
  //       end: parseLocalDate(savedEvent.endDate),
  //       class: dummyEvent.class,
  //       editable: false
  //     });
  //   }
  // };

  eventCreation.open({
    event: dummyEvent,
    resolve: (createdEvent) => {
      if (createdEvent) {
        eventSelection.event = createdEvent;
        eventSelection.showDialog = true;
      }
    }
  });
};

const store = useAppStore()
const vueCalRef = ref(null)

const formStart = ref('')
const formEnd = ref('')

const cellDragStartTime = ref(null)
const cellDragEndTime = ref(null)

const selectedClassFilter = ref('ALL')

const classFilterOptions = [
  { label: '전체', value: 'ALL' },
  { label: '근무', value: 'work' },
  { label: '수술', value: 'surgery' },
  { label: '운동', value: 'sport' }
]

const getClassLabel = (classValue) => {
  const found = classFilterOptions.find(opt => opt.value === classValue);
  return found ? found.label : (classValue || '기타');
}

const rawEvents = ref([]) // 실제 일정 원본은 여기에 저장
const calendarEvents = ref([])

// const filteredEvents = computed(() => {
//   if (selectedClassFilter.value === 'ALL') return rawEvents.value
//   return rawEvents.value.filter(e => e.class === selectedClassFilter.value)
// })
const filteredEvents = computed(() => {
  return selectedClassFilter.value === 'ALL'
    ? rawEvents.value
    : rawEvents.value.filter(e => e.name === selectedClassFilter.value)
})

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

// function parseLocalDate(dateStr) {
//   const [datePart, timePart] = dateStr.split('T');
//   const [year, month, day] = datePart.split('-').map(Number);
//   const [hour, minute] = timePart.split(':').map(Number); // 초는 생략
//   return new Date(year, month - 1, day, hour, minute);
// }
function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('Invalid date string for parsing:', dateStr)
    return new Date(); // 또는 return null;
  }

  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
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

const eventClasses = [
  { value: 'work', label: 'Work' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'sport', label: 'Sport' }
]

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
  timeStep: 60,
  twelveHour: ref(false),
  hideWeekends: ref(false),
  hideWeekdays,
  viewDayOffset: ref(0),
  clickToNavigate: ref(false),
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
  showSpecialHours: ref(false),
  specialHours: computed(() => {
    return mainVuecalConfig.showSpecialHours ? {
      mon: { from: 0 * 60, to: 23 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Full day shift</em>' },
      tue: { from: 4 * 60, to: 5 * 60, class: 'doctor-2', label: '<strong>Doctor 2</strong><em>Full day shift</em>' },
      wed: [
        { from: 8 * 60, to: 12 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Morning shift</em>' },
        { from: 14 * 60, to: 19 * 60, class: 'doctor-3', label: '<strong>Doctor 3</strong><em>Afternoon shift</em>' }
      ],
      thu: { from: 8 * 60, to: 17 * 60, class: 'doctor-1', label: '<strong>Doctor 1</strong><em>Full day shift</em>' },
      fri: { from: 9 * 60, to: 18 * 60, class: 'doctor-3', label: '<strong>Doctor 3</strong><em>Full day shift</em>' },
      sat: { from: 9 * 60, to: 18 * 60, class: 'doctor-2', label: '<strong>Doctor 2</strong><em>Full day shift</em>' },
      sun: { from: 7 * 60, to: 20 * 60, class: 'closed', label: '<strong>Closed</strong>' }
    } : undefined
  }),
  editableEvents: ref(false)
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

// const updateSelectedEvent = () => {
//   const selected = eventSelection.event
//   if (!selected) return

//   const editableCopy = {
//     ...selected,
//     start: selected.start,
//     end: selected.end,
//     title: selected.title,
//     class: selected.class,
//     background: selected.background || false
//   }

//   formStart.value = formatLocalDateTime(editableCopy.start)
//   formEnd.value = formatLocalDateTime(editableCopy.end)

//   eventCreation.open({
//     event: editableCopy,
//     resolve: async (updatedEvent) => {
//       if (!updatedEvent) return

//       // 백엔드에 수정 요청
//       try {
//         const payload = {
//           title: updatedEvent.title,
//           startDate: updatedEvent.start,
//           endDate: updatedEvent.end,
//           name: updatedEvent.class // 백엔드 이름 변경 고려
//         }
//         await apiClient.put(`/duration/${updatedEvent.id}`, payload)

//         // 프론트에서 반영
//         const index = rawEvents.value.findIndex(e => e.id === updatedEvent.id)
//         if (index !== -1) {
//           rawEvents.value[index] = {
//             ...updatedEvent,
//             start: new Date(updatedEvent.start),
//             end: new Date(updatedEvent.end),
//             editable: false
//           }
//         }
//         eventSelection.showDialog = false
//       } catch (err) {
//         alert('수정 실패')
//         console.error(err)
//       }
//     }
//   })

//   eventCreation.show = true
// }

// const updateSelectedEvent = async () => {
//   const id = eventSelection.event?.id;
//   if (!id) return alert('수정할 이벤트 ID가 없습니다.');

//   if (!formStart.value || !formEnd.value) {
//     return alert('수정할 시작/종료 시간이 없습니다.');
//   }

//   const startDate = parseLocalDate(formStart.value);
//   const endDate = parseLocalDate(formEnd.value);

//   const payload = {
//     title: eventSelection.event.title,
//     startDate,
//     endDate,
//     name: eventSelection.event.name
//   };

//   try {
//     const response = await apiClient.put(`/duration/${id}`, payload);

//     const updated = {
//       ...response.data,
//       start: parseLocalDate(response.data.startDate),
//       end: parseLocalDate(response.data.endDate),
//       editable: false
//     };

//     // 배열에서 기존 객체를 찾아 직접 수정
//     const target = rawEvents.value.find(e => e.id === id);
//     if (target) {
//       target.title = updated.title;
//       target.start = updated.start;
//       target.end = updated.end;
//       target.name = updated.name; // ← class 대신 name으로 바뀐 경우
//     }

//     eventSelection.showDialog = false;
//     eventSelection.event = null;
//   } catch (err) {
//     console.error('수정 실패:', err);
//     alert('일정 수정에 실패했습니다.');
//   }
// };

// const updateSelectedEvent = () => {
//   const selected = eventSelection.event;
//   if (!selected) return;

//   eventCreation.open({
//     event: {
//       ...selected,
//       start: selected.start,
//       end: selected.end
//     },
//     resolve: async (updatedEvent) => {
//       if (!updatedEvent) return;

//       const payload = {
//         title: updatedEvent.title,
//         startDate: updatedEvent.start,
//         endDate: updatedEvent.end,
//         name: updatedEvent.name
//       }

//       try {
//         const response = await apiClient.put(`/duration/${updatedEvent.id}`, payload);

//         const updated = {
//           ...response.data,
//           start: parseLocalDate(response.data.startDate),
//           end: parseLocalDate(response.data.endDate),
//           editable: false
//         }

//         const target = rawEvents.value.find(e => e.id === updated.id);
//         if (target) {
//           target.title = updated.title;
//           target.start = updated.start;
//           target.end = updated.end;
//           target.name = updated.name;
//         }

//         eventSelection.showDialog = false;
//         eventSelection.event = null;
//       } catch (err) {
//         alert('일정 수정 실패');
//         console.error(err);
//       }
//     }
//   });

//   formStart.value = formatLocalDateTime(selected.start);
//   formEnd.value = formatLocalDateTime(selected.end);
// }

const updateSelectedEvent = () => {
  const selected = eventSelection.event;
  if (!selected) return;

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
            start: parseLocalDate(updatedEvent.startDate),
            end: parseLocalDate(updatedEvent.endDate),
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

const deleteSelectedEvent = async () => {
  const id = eventSelection.event?.id
  if (!id) {
    alert('삭제할 수 없습니다. 이벤트 ID가 없습니다.')
    return
  }

  try {
    await apiClient.delete(`/duration/${id}`)

    // 프론트에서 캘린더에서도 제거
    rawEvents.value = rawEvents.value.filter(e => e.id !== id)

    eventSelection.showDialog = false
    eventSelection.event = null
  } catch (error) {
    console.error('이벤트 삭제 실패:', error)
    console.log(error)
    alert('삭제에 실패했습니다.')
  }
}

const eventCreation = reactive({
  show: ref(false),
  resolve: null,
  event: {
    title: '',
    background: false,
    name: ''
  },
  open: ({ event, resolve }) => {
    eventCreation.show = true
    eventCreation.event = { ...event }
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

    const startDate = parseLocalDate(formStart.value);
    const endDate = parseLocalDate(formEnd.value);

    if (isNaN(startDate) || isNaN(endDate)) {
      alert('유효하지 않은 날짜입니다.')
      return
    }

    const payload = {
      title: eventCreation.event.title,
      name: eventCreation.event.name,
      // background: eventCreation.event.background,
      startDate,
      endDate
    }
    try {
      let response;
      if (eventCreation.event.id) {
        // 기존 일정 수정
        response = await apiClient.put(`/duration/${eventCreation.event.id}`, payload);
      } else {
        // 신규 일정 등록
        response = await apiClient.post('/duration', payload);
      }

      const newEvent = {
        ...response.data,
        start: parseLocalDate(response.data.startDate),
        end: parseLocalDate(response.data.endDate),
        editable: false
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
      }

      // mainVuecalConfig.events.push(response.data)
      // eventCreation.resolve(response.data)
      // eventCreation.resolve({
      //   ...response.data,
      //   start: parseLocalDate(response.data.startDate),
      //   end: parseLocalDate(response.data.endDate)
      // })
      // rawEvents.value.push({
      //   ...response.data,
      //   start: parseLocalDate(response.data.startDate),
      //   end: parseLocalDate(response.data.endDate),
      //   class: eventCreation.event.class,
      //   editable: false
      // })
      // calendarEvents.value = [...filteredEvents.value]
      eventCreation.show = false;
      eventCreation.resolve?.(newEvent);
      await nextTick();
      // cellDragStartTime.value = null
      // cellDragEndTime.value = null
      
    } catch (error) {
      console.error('일정 저장 실패:', error)
      alert('일정 저장에 실패했습니다.')
    }
  }
  
})

onMounted(async () => {
  try {
    const response = await apiClient.get('/duration')
    const fetchedEvents = response.data.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      name: event.name || 'etc',
      editable: false
    }))
    rawEvents.value = fetchedEvents
  } catch (error) {
    console.error('일정 불러오기 실패:', error)
  }
})
</script>

<style lang="scss">
.page--playground {
  padding: 40px 0 8px;
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

  .config-panel {
    padding: 12px;
    background-color: color-mix(in srgb, var(--w-contrast-bg-color) 5%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--w-contrast-bg-color) 8%, transparent);
  }

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
  .vuecal__event.work {background-color: #fd9c42d9;border-color: #e9882e;}
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
