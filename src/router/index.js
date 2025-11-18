import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'

const routes = [
  { path: '/', name: 'login', component: LoginView },
  { path: '/change-password', name: 'changePassword', component: ChangePasswordView },
  {
    path: '/app',
    name: 'app',
    component: HomeLayout,
    meta: { requiresAuth: true }
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
