import { defineStore } from 'pinia'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken'),
    role: localStorage.getItem('role'),
  }),

  actions: {
    async login(email, password, rememberMe) {
      console.log('[authStore.login] rememberMe:', rememberMe)
      console.log(
        '[authStore.login] BEFORE save, rememberEmail:',
        localStorage.getItem('rememberEmail'),
      )

      const res = await authApi.login({ email, password })
      const data = res.data

      if (rememberMe === true) {
        console.log('[authStore.login] SAVING rememberEmail', email)
        localStorage.setItem('rememberEmail', email)
      } else {
        console.log('[authStore.login] REMOVING rememberEmail')
        //localStorage.removeItem('rememberEmail')
      }

      console.log(
        '[authStore.login] AFTER save, rememberEmail:',
        localStorage.getItem('rememberEmail'),
      )

      if (data.mustChangePassword) {
        localStorage.setItem('tempAccessToken', data.accessToken)
        return 'CHANGE_PASSWORD'
      }

      this.accessToken = data.accessToken
      this.role = data.role

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('role', data.role)
      localStorage.setItem('userName', data.userName)

      return data.role
    },

    async logout() {
      // SSE 연결 먼저 종료 (ERR_SOCKET_NOT_CONNECTED 방지)
      try {
        const { sseService } = await import('@/services/sseService')
        if (sseService && sseService.isConnected) {
          sseService.disconnect()
        }
      } catch (err) {
        console.warn('SSE disconnect failed:', err)
      }

      // 로그아웃 API 호출
      try {
        await authApi.logout()
      } catch (err) {
        // 로그아웃 실패해도 로컬 정리는 진행
        console.warn('Logout API failed:', err)
      }

      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('role')
      localStorage.removeItem('userName')

      this.accessToken = null
      this.role = null

      window.location.replace('/')
    },
  },
})
