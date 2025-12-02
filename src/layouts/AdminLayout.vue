<template>
  <div class="layout">
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <div
      v-if="isSidebarOpen"
      class="overlay"
      @click="isFixedOpen = false"
    />

    <AppSidebar
      :open="isSidebarOpen"
      @hover-open="openHover"
      @hover-close="closeHover"
      @close-sidebar="isFixedOpen = false"
    />

    <!-- ★ 탭 메뉴를 메인 영역 밖으로 이동 -->
    <AccountingTabMenu v-if="isAccountingPage" />

    <main class="content">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AccountingTabMenu from '@/components/accounting/AccountingTabMenu.vue'

const route = useRoute()

const isAccountingPage = computed(() =>
  route.path.startsWith('/admin/accounting')
)

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
.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  padding: 20px 40px 60px; /* top padding 정상 유지 가능 */
  flex: 1;
  overflow-y: auto;
  background: white;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 20;
}
</style>
