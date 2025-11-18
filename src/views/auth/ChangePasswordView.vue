<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const pw1 = ref('')
const pw2 = ref('')

async function changePassword() {
  if (pw1.value !== pw2.value) {
    alert("비밀번호가 일치하지 않습니다")
    return
  }

  const token = localStorage.getItem('tempAccessToken')

  const res = await axios.post('/api/v1/users/change-password',
    { password: pw1.value },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  // 비밀번호 변경 후 temp token 삭제
  localStorage.removeItem('tempAccessToken')

  // 로그인 화면으로 이동
  router.push('/')
}
</script>
