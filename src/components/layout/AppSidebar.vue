<!-- file: src/components/layout/AppSidebar.vue -->
<script setup>
import { computed } from 'vue'

const role = localStorage.getItem('role')
const isAdmin = computed(() => role === 'MASTER' || role === 'ADMIN')
</script>

<template>
  <aside class="sidebar">
    <nav class="menu">

      <router-link to="/app" class="item">
        <img src="@/assets/icons/reserve.svg" class="icon" />
        <span>예약 관리</span>
      </router-link>

      <router-link to="/app/schedule" class="item">
        <img src="@/assets/icons/schedule.svg" class="icon" />
        <span>일정 관리</span>
      </router-link>

      <router-link to="/app/resource" class="item">
        <img src="@/assets/icons/resource.svg" class="icon" />
        <span>자원 관리</span>
      </router-link>

      <router-link to="/app/stats" class="item">
        <img src="@/assets/icons/stats.svg" class="icon" />
        <span>정산 관리</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/admin"
        class="item active-admin"
      >
        <img src="@/assets/icons/user.svg" class="icon" />
        <span>유저 관리</span>
      </router-link>

    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 100px;
  background: #f9f9f9;
  border-radius: 0 20px 20px 0;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #777;
  text-decoration: none;
  font-size: 12px;
}

.item:hover {
  color: #000;
}

.icon {
  width: 26px;
  height: 26px;
  margin-bottom: 6px;
}

.active-admin {
  background: #cfe3ca;
  padding: 12px 0;
  border-radius: 6px;
}
</style>
