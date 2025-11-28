<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface User {
  id: number | string
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
  (e: 'select', user: User): void
}>()

const keyword = ref('')
const users = ref<User[]>([])

const fetchUsers = async () => {
  try {
    const { data } = await axios.get('/api/users', {
      params: { keyword: keyword.value },
    })
    users.value = data
  } catch (e) {
    console.error('사용자 조회 오류:', e)
  }
}

// 최초 한번 기본 목록
onMounted(fetchUsers)

const handleInput = () => {
  fetchUsers()
}

const select = (user: User) => {
  emit('select', user)
  emit('close')
}
</script>

<template>
  <!-- 배경 클릭하면 닫힘 -->
  <div v-if="show" class="overlay" @click.self="emit('close')">
    <div class="modal" :style="{ width }">
      <!-- 제목 -->
      <h3 class="title">참여자 선택</h3>

      <!-- 검색 -->
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="검색어를 입력해주세요"
          class="search-input"
          @input="handleInput"
        />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            stroke-width="2"
            d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
          />
        </svg>
      </div>

      <!-- 리스트 -->
      <div class="list" v-if="users.length">
        <div
          v-for="user in users"
          :key="user.id"
          class="item"
          @click="select(user)"
        >
          <!-- 아바타 -->
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            class="avatar"
          />
          <div v-else class="avatar placeholder">
            {{ user.name.slice(0, 1) }}
          </div>

          <div class="info">
            <div class="name">{{ user.name }}</div>
            <div class="email">{{ user.email }}</div>
          </div>

          <svg class="arrow" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-width="2" d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      <!-- 결과 없음 -->
      <div v-else class="empty">
        검색 결과가 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🔹 너가 준 오버레이/모달 스타일 */
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

.modal {
  background: #ffffff;
  padding: 24px 24px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* 🔹 내부 내용 스타일 */
.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  border: 1px solid #ddd;
  padding: 10px 38px 10px 12px;
  border-radius: 10px;
  font-size: 14px;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #aaa;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.list {
  margin-top: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #efefef;
  cursor: pointer;
  transition: background 0.15s;
}

.item:last-child {
  border-bottom: none;
}

.item:hover {
  background: #f7f7f7;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.placeholder {
  background: #d9e7ff;
  color: #3d6aff;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info {
  margin-left: 10px;
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: 600;
}

.email {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.arrow {
  width: 18px;
  height: 18px;
  color: #bbb;
}

.empty {
  padding: 20px 0 6px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
  