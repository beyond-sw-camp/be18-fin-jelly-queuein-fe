<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string
}

const props = defineProps({
  show: { type: Boolean, default: false },
  width: { type: String, default: '360px' }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', users: User[]): void
}>()

// 🔹 예시 데이터
const users = ref<User[]>([
  { id: 1, name: '박채연', email: 'jassicarobert@gmail.com', avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 2, name: '홍길동', email: 'hong@gmail.com', avatarUrl: '' }
])

// 선택한 사용자 ID 리스트
const selectedIds = ref<number[]>([])

// 토글 선택
const toggleSelect = (user: User) => {
  const idx = selectedIds.value.indexOf(user.id)
  if (idx === -1) selectedIds.value.push(user.id)
  else selectedIds.value.splice(idx, 1)
}

// 예약 신청 버튼
const submitSelection = () => {
  const selectedUsers = users.value.filter(u => selectedIds.value.includes(u.id))
  emit('select', selectedUsers)
  emit('close')
}
</script>

<template>
  <div v-if="show" class="overlay" @click.self="emit('close')">
    <div class="modal" :style="{ width }">
      <h3 class="title">참여자 선택</h3>

      <div class="list">
        <div 
          class="item" 
          v-for="user in users" 
          :key="user.id" 
          @click="toggleSelect(user)"
          :class="{ selected: selectedIds.includes(user.id) }"
        >
          <img v-if="user.avatarUrl" :src="user.avatarUrl" class="avatar" />
          <div v-else class="avatar placeholder">{{ user.name.slice(0, 1) }}</div>
          <div class="info">
            <div class="name">{{ user.name }}</div>
            <div class="email">{{ user.email }}</div>
          </div>
        </div>
      </div>

      <button class="submit-btn" @click="submitSelection" :disabled="!selectedIds.length">
        선택 완료
      </button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.35); z-index: 9999; }
.modal { background: #fff; padding: 24px; border-radius: 12px; width: 360px; }
.list { max-height: 300px; overflow-y: auto; margin-bottom: 12px; }
.item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; }
.item.selected { background: #B6CEB4; color: #000; }

.avatar { width: 38px; height: 38px; border-radius: 50%; }
.placeholder { background: #d9e7ff; color: #394f3b; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.info { margin-left: 10px; flex: 1; }
.submit-btn { width: 100%; padding: 10px; border-radius: 8px; background: #abdfb0; color: #fff; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }
</style>
