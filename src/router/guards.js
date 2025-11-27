console.log("[Guard] BEFORE", {
  rememberEmail: localStorage.getItem("rememberEmail"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  role: localStorage.getItem("role")
})



const ROLE_LEVEL = {
  GENERAL: 1,
  MANAGER: 2,
  ADMIN: 3,
  MASTER: 4,
}

export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    console.log("[Guard] route:", to.path)
    console.log("[Guard] rememberEmail:", localStorage.getItem("rememberEmail"))

    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('role')

    // 1) 로그인 화면(“/”)일 때만 인증값 정리
    if (to.path === '/') {
      if (!token) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('role')
      }
    }

    // 2) 인증이 필요한 페이지에 토큰 없이 접근 → 로그인으로 돌림
    if (to.meta.requiresAuth && !token) {
      return next('/')
    }

    // 3) 로그인 후 "/"로 다시 가면 권한에 맞게 redirect
    if (to.path === '/' && token) {
      if (ROLE_LEVEL[role] >= ROLE_LEVEL['ADMIN']) {
        return next('/admin')
      }
      return next('/app')
    }

    // 4) 권한 검증
    if (to.meta.minRole) {
      const required = to.meta.minRole
      if (ROLE_LEVEL[role] < ROLE_LEVEL[required]) {
        return next('/403')
      }
    }

    next()
  })

}
