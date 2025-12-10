import { hasRole } from '@/utils/role'

export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    // 이전 경로를 sessionStorage에 저장 (컴포넌트 재생성 시 사용)
    if (from.path) {
      sessionStorage.setItem('previousRoutePath', from.path)
    }

    const token = localStorage.getItem('accessToken')

    // 로그인 필요
    if (to.meta.requiresAuth && !token) {
      return next('/')
    }

    // 로그인 후 "/" 접근 → 자동 redirect
    if (to.path === '/' && token) {
      if (hasRole('ADMIN')) return next('/admin')
      return next('/app')
    }

    // 권한 체크
    if (to.meta.minRole) {
      if (!hasRole(to.meta.minRole)) {
        return next('/403')
      }
    }

    next()
  })
}
