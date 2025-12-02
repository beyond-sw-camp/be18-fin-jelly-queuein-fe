<!-- file: src/layouts/AdminLayout.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

/* ★ 정확한 탭 메뉴 컴포넌트 경로 적용 */
import AccountingTabMenu from '@/components/accounting/AccountingTabMenu.vue'

import { RouterView } from 'vue-router'

const route = useRoute()

/* ---- 사이드바 상태 ---- */
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

/* ---- 현재 경로가 정산 메뉴인지 판별 ---- */
const isAccountingPage = computed(() =>
  route.path.startsWith('/admin/accounting')
)
</script>

<template>
  <div class="layout">

    <!-- 상단 헤더 -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <!-- 사이드바 오버레이 -->
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

    <!-- 메인 컨텐츠 -->
    <main class="content">

      <!-- 정산 메뉴일 때만 탭 표시 -->
      <AccountingTabMenu v-if="isAccountingPage" />

      <!-- 실제 페이지 렌더링 -->
      <RouterView />
    </main>

    <!-- 하단 푸터 -->
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  overflow-y: auto;
  background: white;
  padding: 30px 40px 60px;
}

/* 오버레이 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 20;
}
</style>
