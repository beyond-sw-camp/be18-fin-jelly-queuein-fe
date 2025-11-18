<script setup>
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

async function logout() {
  try {
    await api.post('/auth/logout')

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('role')

    router.push('/')
  } catch (e) {
    console.error(e)
    alert('로그아웃 실패')
  }
}
</script>

<template>
  <header class="header">
    <div class="title">QueueIn</div>

    <div class="right">
      <span class="role">Role: {{ localStorage.getItem('role') }}</span>

      <button class="logout-btn" @click="logout">
        로그아웃
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background: #c8e0c3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: #243540;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
