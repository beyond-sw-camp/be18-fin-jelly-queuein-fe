export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('role')

    // 보호된 페이지
    if (to.meta.requiresAuth && !token) {
      return next('/')
    }

    // 로그인 페이지인데 이미 로그인 되어 있음
    if (to.path === '/' && token) {
      if (role === 'MASTER' || role === 'ADMIN') {
        return next('/admin')
      }
      return next('/app')
    }

    // 관리자 페이지 접근 제한
    if (to.meta.role === 'ADMIN') {
      if (role !== 'MASTER' && role !== 'ADMIN') {
        return next('/403')
      }
    }

    next()
  })
}
