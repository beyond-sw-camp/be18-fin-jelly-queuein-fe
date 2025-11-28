// file: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

import PublicLayout from '@/layouts/PublicLayout.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

import LoginView from '@/views/auth/LoginView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'
import DashboardView from '@/views/app/DashboardView.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    // Public
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', component: LoginView },
        { path: 'change-password', component: ChangePasswordView }
      ]
    },

    // 일반 사용자 영역
    {
      path: '/app',
      component: HomeLayout,
      // meta: { requiresAuth: true },
      children: [
        { path: '', component: DashboardView },
        
        {
          path: 'reservations/me',
          component: () => import('@/views/app/reservation/UserReservations.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/available-assets',
          component: () => import('@/views/app/reservation/ReservableAssets.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/applied',
          component: () => import('@/views/app/reservation/AppliedReservations.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/schedule',
          component: () => import('@/views/app/reservation/MonthlyReservations.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/create',
          component: () => import('@/views/app/reservation/CreateReservation.vue'),
          // meta: { requiresAuth: true }
        }
      ]
    },

    // 관리자 영역
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        { path: '', component: AdminDashboard }
      ]
    },
  

    { path: '/403', component: () => import('@/views/error/ForbiddenView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/error/NotFoundView.vue') }
  ]
})

setupGuards(router)
export default router
