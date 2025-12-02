<template>
  <div class="layout">
    <!-- 상단 헤더 -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <!-- 사이드바 오버레이(모바일/좁은 화면일 때) -->
    <div
      v-if="isSidebarOpen"
      class="overlay"
      @click="isFixedOpen = false"
    />

    <!-- 사이드바 -->
    <AppSidebar
      :open="isSidebarOpen"
      @hover-open="openHover"
      @hover-close="closeHover"
      @close-sidebar="isFixedOpen = false"
    />

    <!-- 회계 메뉴 탭 (항상 헤더 밑에 위치) -->
    <AccountingTabMenu v-if="isAccountingPage" />

    <!-- 메인 컨텐츠 -->
    <main class="content">
      <RouterView />
    </main>

    <!-- 푸터 -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
// import AppFooter from '@/components/layout/AppFooter.vue'
import AccountingTabMenu from '@/components/accounting/AccountingTabMenu.vue'

const route = useRoute()

/* ✔ 경로가 /admin/accounting/** 일 때만 탭 메뉴 표시 */
const isAccountingPage = computed(() =>
  route.path.startsWith('/admin/accounting')
)

/* ✔ 사이드바 동작 상태 */
const isFixedOpen = ref(false)
const isHoverOpen = ref(false)
const isSidebarOpen = computed(() => isFixedOpen.value || isHoverOpen.value)

function toggleSidebar() {
  isFixedOpen.value = !isFixedOpen.value
}

function openHover() {
  if (!isFixedOpen.value) isHoverOpen.value = true
}

function closeHover() {
  if (!isFixedOpen.value) isHoverOpen.value = false
}
</script>

<style scoped>
/* ===== 레이아웃 전체 ===== */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 화면 전체 고정 */
  overflow: hidden; /* 전체 페이지 스크롤 방지 */
}

/* ===== 메인 컨텐츠 ===== */
.content {
  flex: 1;
  background: white;

  /* 화면이 넘치지 않도록 내부만 스크롤 */
  overflow-y: auto;

  /* 필요한 만큼만 여백 */
  padding: 5px 20px;

  box-sizing: border-box;
}

/* ===== 사이드바 오버레이 ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 20;
}
</style>
