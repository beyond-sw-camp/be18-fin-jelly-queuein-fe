import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

import LoginView from '@/views/auth/LoginView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import DashboardView from '@/views/app/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginView },
    { path: '/change-password', component: ChangePasswordView },

    {
      path: '/app',
      component: HomeLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: DashboardView }
      ]
    },

    {
      path: '/admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'ADMIN' }
    },

    { path: '/403', component: () => import('@/views/error/ForbiddenView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/error/NotFoundView.vue') }
  ]
})

setupGuards(router)

export default router
