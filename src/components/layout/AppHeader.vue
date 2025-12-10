<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { authApi } from '@/api/authApi'
import { hasRole } from '@/utils/role'

// Vue 3 + Vite 표준: 로고 이미지 import
import logoUrl from '@/assets/icons/logo.svg'

const route = useRoute()
const router = useRouter()

//const emit = defineEmits(['toggle-sidebar'])

// ===============================
// 🧩 로그인 사용자 정보 가져오기
// ===============================
const role = localStorage.getItem('role') || ''
const name = (localStorage.getItem('userName') || '').trim()

// ===============================
// 🧑 이름 우선 표시 + 역할 보조 처리
// ===============================
const roleText = computed(() => {
  if (name) return name // DB 이름이 있으면 가장 우선!
  return (
    {
      MASTER: '마스터',
      ADMIN: '관리자',
      MANAGER: '매니저',
    }[role] || '사용자'
  )
})

// ===============================
// 👤 아바타 글자 (이름 첫글자 · 김민준 → 김)
// ===============================
const avatarText = computed(() => {
  return name ? name.trim().charAt(0) : roleText.value.charAt(0)
})

// 마이페이지로 이동
function goMyPage() {
  router.push({ name: 'MyPage' })
}

// 로고 클릭 시 역할에 맞는 대시보드로 이동
function goToDashboard() {
  if (hasRole('ADMIN')) {
    router.push('/admin')
  } else {
    router.push('/app')
  }
}

// ===============================
// 🔐 로그아웃
// ===============================
async function logout() {
  await authApi.logout()
  localStorage.removeItem('accessToken')
  localStorage.removeItem('role')
  localStorage.removeItem('userName')
  router.push('/')
}

// ===================================
// 🧭 Breadcrumb 매핑 테이블
// ===================================
const breadcrumbMap = {
  assets: '자원',
  list: '자원 목록 조회',
  create: '자원 등록',
  edit: '자원 수정',
  'usage-history': '자원 사용 기록 조회',
  'usage-trend': '사용 추이',
  performance: '운영 성과 분석',
  quarter: '분기 정산',
  reservations: '예약',
  'available-assets': '가능 자원',
  me: '사용자 예약',
  applied: '신청 예약',
  monthly: '스케쥴 확인',
  apply: '신청하기',
  'create-reservation': '예약하기',

  // 기타
  categories: '카테고리 관리',
  accounting: '정산 관리',
  usage: '정산 관리',
  users: '유저 관리',
  roles: '역할 관리',
  permissions: '권한 관리',
  list: '권한 관리',
  schedule: '일정 관리',
  reservation: '예약 관리',
  guide: '설명서',
}

// ===============================
// 📌 Breadcrumb 생성
// ===============================
function getBreadcrumbHtml() {
  let segments = route.path.split('/').filter(Boolean)

  // 기술 경로 제거 (admin/app)
  if (segments[0] === 'admin' || segments[0] === 'app') {
    segments = segments.slice(1)
  }

  if (segments.length === 0) return ''

  // 중복 제거: permissions와 list가 연속으로 오면 permissions만 표시
  const filtered = []
  for (let i = 0; i < segments.length; i++) {
    const current = segments[i]
    const next = segments[i + 1]
    
    // permissions 다음에 list가 오면 list는 건너뛰기
    if (current === 'permissions' && next === 'list') {
      filtered.push(current)
      i++ // list도 건너뛰기
    } else {
      filtered.push(current)
    }
  }

  const mapped = filtered.map((seg) => breadcrumbMap[seg] || seg)

  return mapped
    .map((seg) => `<span class="breadcrumb-item">${seg}</span>`)
    .join(`<span class="breadcrumb-divider"> / </span>`)
}
</script>

<template>
  <header class="header">
    <div class="left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <i class="ri-menu-line"></i>
      </button>

      <div class="logo" @click="goToDashboard" style="cursor: pointer">
        <img :src="logoUrl" alt="QueueIn Logo" class="logo-img" />
      </div>

      <div class="breadcrumb" v-html="getBreadcrumbHtml()"></div>
    </div>

    <div class="right">
      <div class="search-box">
        <i class="ri-search-line"></i>
        <input type="text" placeholder="검색" />
      </div>

      <i class="ri-notification-3-line icon"></i>

      <div class="profile" @click="goMyPage" style="cursor: pointer">
        <div class="avatar">{{ avatarText }}</div>
        <span>{{ roleText }}</span>
      </div>

      <i class="ri-question-line icon"></i>

      <button class="logout" @click="logout">
        <i class="ri-logout-box-line"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 70px;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  position: sticky;
  top: 0;
  z-index: 50;
}

/* LEFT */
.left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.menu-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
}

/* Breadcrumb */
.breadcrumb {
  font-size: 15px;
  color: #777;
  margin-left: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
}

::v-deep .breadcrumb-item {
  color: #4b5563;
  background: #f3f4f6;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
  transition: all 0.2s ease;
}

::v-deep .breadcrumb-item:first-child {
  color: #1f2937;
  background: #e5e7eb;
  font-weight: 600;
}

::v-deep .breadcrumb-item:hover {
  background: #e5e7eb;
}

::v-deep .breadcrumb-divider {
  color: #9ca3af;
  margin: 0 4px;
  font-size: 12px;
}

/* RIGHT */
.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 6px 10px;
  border-radius: 8px;
  width: 220px;
  gap: 8px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
}

.icon {
  font-size: 20px;
  cursor: pointer;
  color: #444;
}

.profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #b8a57a;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 20px;
}
</style>
