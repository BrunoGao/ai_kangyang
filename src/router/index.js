import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/elderly/:id',
    name: 'ElderlyDetail',
    component: () => import('@/views/ElderlyDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
