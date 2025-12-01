<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['toggle-sidebar'])

// 경로 한글 변환
const breadcrumbMap = {
  assets: '자원',

  // 세부 경로
  list: '자원 목록 조회',   // ← 여기를 이렇게 바꾸면 됨!
  create: '자원 등록',
  edit: '자원 수정',

  // 기타
  categories: '카테고리 관리',
  settlement: '정산 관리',
  usage: '정산 관리',
  users: '유저 관리',
  schedule: '일정 관리',
  reservation: '예약 관리',
}

function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('role')
  router.push('/')
}


// 현재 경로를 Breadcrumb 형태로 변환
function getBreadcrumbHtml() {
  let segments = route.path.split('/').filter(Boolean)

  // 기술 경로 제거
  if (segments[0] === 'admin' || segments[0] === 'app') {
    segments = segments.slice(1)
  }

  if (segments.length === 0) return ''

  const mapped = segments.map(seg => breadcrumbMap[seg] || seg)

  // ✔ 첫 번째 항목도 일반 항목으로 처리
  const result = mapped
    .map(seg => `<span class="breadcrumb-item">${seg}</span>`)
    .join(`<span class="breadcrumb-divider"> / </span>`)

  return result
}

</script>

<template>
  <header class="header" >
    <!-- 좌측: 햄버거 + 로고 -->
    <div class="left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <i class="ri-menu-line"></i>
      </button>

      <div class="logo">Queue In</div>

      <div class="breadcrumb" v-html="getBreadcrumbHtml()"></div>
    </div>

    <!-- 우측: 검색 + 알림 + 유저 + 헬프 + 로그아웃 -->
    <div class="right">

      <div class="search-box">
        <i class="ri-search-line"></i>
        <input type="text" placeholder="검색" />
      </div>

      <i class="ri-notification-3-line icon"></i>

      <div class="profile">
        <div class="avatar">C</div>
        <span>관리자</span>
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

.left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: #222;
}

.menu-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
}

/* Breadcrumb 컨테이너 */
.breadcrumb {
  font-size: 15px;
  color: #777; /* 나머지는 은은하게 */
  margin-left: 50px;
}

/* 첫 번째 항목(루트 메뉴)을 선명한 검정으로 */
::v-deep .breadcrumb span:first-child {
  color: #000 ;
  font-weight: 600;
}

/* ⭐ v-html 내부 요소에 스타일 적용 (scoped 문제 해결) */
::v-deep .breadcrumb-main {
  font-weight: 700;
  color: #000000;
}

::v-deep .breadcrumb-item {
  color: #888;
}

::v-deep .breadcrumb-divider {
  color: #aaa;
  margin: 0 15px;   /* ← 간격 넓히기 */
}

/* Right 영역 */
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
