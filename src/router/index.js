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
    // ---------------------------------------------------------
    // Public
    // ---------------------------------------------------------
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', component: LoginView },
        { path: 'change-password', component: ChangePasswordView },
      ],
    },

    // ---------------------------------------------------------
    // 일반 사용자
    // ---------------------------------------------------------
    {
      path: '/app',
      component: HomeLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: DashboardView },
      ],
    },

    // ---------------------------------------------------------
    // 관리자
    // ---------------------------------------------------------
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        { path: '', component: AdminDashboard },

        // 자원 관리
        {
          path: 'assets',
          meta: { minRole: 'MANAGER' },
          children: [
            { path: '', redirect: '/admin/assets/list' },
            {
              path: 'list',
              component: () => import('@/views/admin/asset/AssetManagement.vue'),
              meta: { title: '자원 목록 조회', minRole: 'MANAGER' }
            },
            {
              path: 'create',
              component: () => import('@/views/admin/asset/AssetCreateView.vue'),
              meta: { title: '자원 등록', minRole: 'MANAGER' }
            },
            {
              path: ':assetId/edit',
              component: () => import('@/views/admin/asset/AssetEditView.vue'),
              meta: { title: '자원 수정', minRole: 'MANAGER' }
            }
          ]
        },

        // 카테고리 관리
        {
          path: 'categories',
          component: () => import('@/views/admin/category/CategoryManagement.vue'),
          meta: { minRole: 'MANAGER', title: '카테고리 관리' },
        },

        // ---------------------------------------------------------
        // ⭐ 정산 메뉴 (Layout 제거됨)
        // ---------------------------------------------------------
        {
          path: 'accounting',
          meta: { minRole: 'MANAGER' },
          children: [
            {
              path: 'usage-history',
              component: () =>
                import('@/views/admin/accounting/usage_history/UsageHistory.vue'),
              meta: { title: '자원 사용 기록' }
            },
            {
              path: 'usage-trend',
              component: () =>
                import('@/views/admin/accounting/usage_trend/UsageTrend.vue'),
              meta: { title: '사용 추이' }
            },
            {
              path: 'performance',
              component: () =>
                import('@/views/admin/accounting/performance/PerformanceView.vue'),
              meta: { title: '운영 성과 분석' }
            },
            {
              path: 'quarter',
              component: () =>
                import('@/views/admin/accounting/quarter/QuarterSettlement.vue'),
              meta: { title: '분기 정산' }
            }
          ]
        }
      ],
    },

    // ---------------------------------------------------------
    // Error 페이지
    // ---------------------------------------------------------
    { path: '/403', component: () => import('@/views/error/ForbiddenView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/error/NotFoundView.vue') },
  ],
})

setupGuards(router)
export default router
