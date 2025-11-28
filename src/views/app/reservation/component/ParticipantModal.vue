<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

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
  { id: 2, name: '홍길동', email: 'hong@gmail.com', avatarUrl: '' },
  { id: 3, name: '강민수', email: 'kim@example.com', avatarUrl: '' },
])

const keyword = ref('')
const selectedIds = ref<number[]>([])

// 검색된 사용자 목록
const filteredUsers = computed(() => {
  if (!keyword.value) return users.value
  return users.value.filter(u => u.name.includes(keyword.value))
})

// 토글 선택
const toggleSelect = (user: User) => {
  const idx = selectedIds.value.indexOf(user.id)
  if (idx === -1) selectedIds.value.push(user.id)
  else selectedIds.value.splice(idx, 1)
}

// 선택 완료 버튼
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

      <!-- 검색창 + 아이콘 -->
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="검색어를 입력해주세요"
          class="search-input"
        />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/>
        </svg>
      </div>

      <!-- 사용자 목록 -->
      <div class="list" v-if="filteredUsers.length">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id" 
          class="item"
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

      <div v-else class="empty">검색 결과가 없습니다.</div>

      <!-- 선택 완료 버튼 -->
      <button class="submit-btn" @click="submitSelection" :disabled="!selectedIds.length">
        선택 완료
      </button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset:0; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.35); z-index:9999; }
.modal { background:#fff; padding:24px; border-radius:12px; width:360px; }
.search-box { position: relative; margin-bottom:12px; }
.search-input { width:100%; padding:8px 36px 8px 12px; border-radius:6px; border:1px solid #ccc; font-size:14px; }
.search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #aaa; }
.list { max-height:300px; overflow-y:auto; margin-bottom:12px; }
.item { display:flex; align-items:center; padding:10px; border-bottom:1px solid #eee; cursor:pointer; transition: background 0.15s; }
.item:hover { background:#f7f7f7; }
.item.selected { background:#B6CEB4; color:#000; }
.avatar { width:38px; height:38px; border-radius:50%; }
.placeholder { background:#d9e7ff; color:#394f3b; display:flex; align-items:center; justify-content:center; font-weight:bold; }
.info { margin-left:10px; flex:1; }
.name { font-weight:600; font-size:14px; }
.email { font-size:12px; color:#666; }
.submit-btn { width:100%; padding:10px; border-radius:8px; background:#abdfb0; color:#fff; font-weight:600; cursor:pointer; }
.submit-btn:disabled { background:#ccc; cursor:not-allowed; }
.empty { text-align:center; color:#999; padding:20px 0; }
</style>
