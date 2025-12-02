<template>
  <div class="tab-container">

    <div class="tab-menu">
      <router-link
        to="/admin/accounting/usage-history"
        class="tab"
        :class="{ active: isActive('/admin/accounting/usage-history') }"
      >
        자원 사용 기록
      </router-link>

      <router-link
        to="/admin/accounting/usage-trend"
        class="tab"
        :class="{ active: isActive('/admin/accounting/usage-trend') }"
      >
        사용 추이
      </router-link>

      <router-link
        to="/admin/accounting/performance"
        class="tab"
        :class="{ active: isActive('/admin/accounting/performance') }"
      >
        운영 성과 분석
      </router-link>

      <router-link
        to="/admin/accounting/quarter"
        class="tab"
        :class="{ active: isActive('/admin/accounting/quarter') }"
      >
        분기 정산
      </router-link>
    </div>

    <div class="bottom-line"></div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router"
const route = useRoute()

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.tab-container {
  display: flex;
  flex-direction: column;
  padding-left: 5px;
  margin-bottom: 25px;
}

.tab-menu {
  display: flex;
  gap: 48px;
  padding: 10px 0 0 0;
}

.tab {
  font-size: 17px;
  font-weight: 600;
  color: #6b7280;
  padding-bottom: 8px;
  text-decoration: none;
}

.tab.active {
  color: #00A950;
  border-bottom: 3px solid #00A950;
}

.bottom-line {
  border-bottom: 1.5px solid #e5e7eb;
  margin-top: 0;
}
</style>
