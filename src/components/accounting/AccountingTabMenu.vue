<!-- file: src/components/accounting/AccountingTabMenu.vue -->
<template>
  <div class="tab-wrapper">
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
.tab-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

/* 탭 4개를 동일 비율로 꽉 채우기 */
.tab-menu {
  display: flex;
  width: 100%;
  justify-content: space-between;
  text-align: center;
}

.tab {
  flex: 1;
  padding: 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center; /* 세로 가운데 정렬 */
  border-bottom: 3px solid transparent;
}

/* 활성 탭 */
.tab.active {
  color: #00A950;
  border-bottom: 3px solid #00A950;
}

/* 아래 라인 */
.bottom-line {
  width: 100%;
  border-bottom: 1.5px solid #e5e7eb;
  margin-top: -3px;
}
</style>
