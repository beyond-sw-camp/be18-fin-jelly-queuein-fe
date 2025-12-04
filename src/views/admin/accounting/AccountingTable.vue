<template>
  <div class="tabs">
    <router-link
      to="/admin/settlement/usage-history"
      class="tab"
      :class="{ active: isActive('/admin/settlement/usage-history') }"
    >
      자원 사용 기록
    </router-link>

    <router-link
      to="/admin/settlement/usage-trend"
      class="tab"
      :class="{ active: isActive('/admin/settlement/usage-trend') }"
    >
      사용 추이
    </router-link>

    <router-link
      to="/admin/settlement/performance"
      class="tab"
      :class="{ active: isActive('/admin/settlement/performance') }"
    >
      운영 성과 분석
    </router-link>

    <router-link
      to="/admin/settlement/quarter"
      class="tab"
      :class="{ active: isActive('/admin/settlement/quarter') }"
    >
      분기 정산
    </router-link>
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
.tabs {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  border-bottom: 2px solid #eee;
}

.tab {
  padding: 10px 0;
  font-weight: 600;
  color: #555;
}

.tab.active {
  color: #00A950;
  border-bottom: 3px solid #00A950;
}
</style>
