import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'
import CalendarBaseLayout from '../layout/CalendarBaseLayout.vue'
import ShowOffVue from '../views/showOff.vue'
import Ex from '@/views/Ex.vue'
import Login from '@/views/Login.vue'


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
        path: 'showOff',
        component: ShowOffVue
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
  {
    path: '/login',
    name: 'login',
    component: Login
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
