<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const pw1 = ref('')
const pw2 = ref('')

async function changePassword() {
  if (pw1.value !== pw2.value) {
    alert("비밀번호가 일치하지 않습니다")
    return
  }

  const token = localStorage.getItem('tempAccessToken')

  await api.post(
    '/v1/users/change-password',
    { password: pw1.value },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  localStorage.removeItem('tempAccessToken')
  router.push('/')
}
</script>

<template>
  <div class="change-password">
    <h2>비밀번호 변경</h2>

    <form @submit.prevent="changePassword">
      <input v-model="pw1" type="password" placeholder="새 비밀번호" />
      <input v-model="pw2" type="password" placeholder="새 비밀번호 확인" />
      <button type="submit">변경하기</button>
    </form>
  </div>
</template>

<style scoped>
.change-password {
  padding: 20px;
}
.change-password input {
  display: block;
  margin: 10px 0;
  padding: 10px;
}
button {
  padding: 10px 16px;
  background: #243540;
  color: white;
  border: none;
  border-radius: 6px;
}
</style>
