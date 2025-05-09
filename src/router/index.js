import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'
import CalendarBaseLayout from '../layout/CalendarBaseLayout.vue'
import Ex from '@/views/Ex.vue'


const routes = [
  {
    path: '/',
    name: 'base',
    component: BaseLayout,
    children: [
      {
        path: 'ex',
        name: 'ex',
        component: Ex
      },
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
