// file: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'
import DashboardView from '@/views/app/DashboardView.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', component: LoginView },
        { path: 'change-password', component: ChangePasswordView },
      ],
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
          path: 'reservations/monthly',
          component: () => import('@/views/app/reservation/MonthlyReservations.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/weekly',
          component: () => import('@/views/app/reservation/WeeklyReservations.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/create',
          component: () => import('@/views/app/reservation/CreateReservation.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'reservations/apply',
          component: () => import('@/views/app/reservation/ApplyReservation.vue'),
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
        { path: '', component: AdminDashboard },

        // 카테고리 관리자용 목록 조회
        {
          path: 'categories',
          component: () => import('@/views/admin/category/CategoryManagement.vue'),
          meta: { minRole: 'MANAGER' },
        },

        // 자원 목록 조회
        {
          path: 'assets',
          component: () => import('@/views/admin/asset/AssetManagement.vue'),
          meta: { requiresAuth: true, minRole: 'MANAGER' },
        },

        // 자원 생성
        {
          path: 'assets/create',
          component: () => import('@/views/admin/asset/AssetCreateView.vue'),
          meta: { minRole: 'MANAGER' },
        },

        // 자원 수정
        {
          path: 'assets/:assetId/edit',
          component: () => import('@/views/admin/asset/AssetEditView.vue'),
          meta: { minRole: 'MANAGER' },
        },
      ],
    },
  

    { path: '/403', component: () => import('@/views/error/ForbiddenView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/error/NotFoundView.vue') },
  ],
})

setupGuards(router)
export default router
