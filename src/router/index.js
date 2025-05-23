import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'
import CalendarBaseLayout from '../layout/CalendarBaseLayout.vue'
import ShowOffVue from '../views/showOff.vue'
import OffCalendarVue from '../views/OffCalendar.vue'
import Ex from '@/views/Ex.vue'
import Login from '@/views/Login.vue'
import JoinMember from "@/views/admin/JoinMember.vue"
import MemberList from "@/views/admin/MemberList.vue"
import ManageOff from '@/views/ManageOff.vue'
import ShowShifts from '@/views/Shift/ShowShifts.vue'
import CreateShiftExchange from '@/views/Shift/CreateShiftExchange.vue'
import ShiftExchangeDetails from '@/views/Shift/ShiftExchangeDetails.vue'

import UpdateNurse from '@/views/nurse/UpdateNurse.vue'
import CreateNurse from '@/views/nurse/CreateNurse.vue'
import NurseList from '@/views/nurse/NurseList.vue'

import StatisticTabsView from "@/views/statistic/StatisticTabsView.vue";

import HospitalMap from "@/views/hospital/HospitalMap.vue";
import UpdateEr from "@/views/hospital/UpdateEr.vue";
import SurgeryReservation from '@/views/SurgeryReservation.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: BaseLayout,
    children: [
      {
        path: 'ex',
        name: 'ex',
        component: Ex
      },
      {
        path: 'showOff',
        name: 'showOff',
        component: ShowOffVue
      },
      {
        path: '/shifts',
        name: 'shift-list',
        component: ShowShifts
      },
      {
        path: 'shifts/create',
        name: 'create-shiftchange',
        component: CreateShiftExchange
      },
      {
        path: `shifts/:boardId`,
        name: 'ShiftExchangeDetails',
        component: ShiftExchangeDetails
      },
      {
        path: '/joinMember',
        name: 'joinMember',
        component: JoinMember
      },
      {
        path: '/memberList',
        name: 'memberList',
        component: MemberList
      },
      {
        path: 'offCalendar',
        name: 'OffCalendar',
        component: OffCalendarVue
      },
      {
        path: 'manageOff',
        name: 'manageOff',
        component: ManageOff
      },
      {
        path: '/nurses',
        name: 'CreateNurse',
        component: CreateNurse
      },
      {
        path: `/nurses/:id`,
        name: 'UpdateNurse',
        component: UpdateNurse
      },
      {
        path: '/nurseList',
        name: 'NurseList',
        component: NurseList
      },
      {
        path: '/statistics',
        name: 'Statistics',
        component: StatisticTabsView
      },
      {
        path: '/surgeryReservation',
        name: 'surgeryReservation',
        component: SurgeryReservation
      },

      {
        path: '/updateEr',
        name: 'UpdateEr',
        component: UpdateEr
      }

    ],
  },
  {
    path: '/calendar',
    name: 'Calendarbase',
    component: CalendarBaseLayout,
    children: [
      {
        path: '',
        name: 'playground',
        component: () => import('@/documentation/examples/playground.vue')
      }
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },

  {
    path: '/hospitalMap',
    name: 'hospitalMap',
    component: HospitalMap
  },



]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})
