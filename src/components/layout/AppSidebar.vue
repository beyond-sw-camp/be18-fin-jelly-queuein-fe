<script setup>
import { computed } from 'vue'

const role = localStorage.getItem('role')
const isAdmin = computed(() => role === 'MASTER' || role === 'ADMIN')
</script>

<template>
  <aside class="sidebar">
    <ul>
      <li><router-link to="/app">대시보드</router-link></li>

      <!-- 관리자 전용 메뉴 -->
      <li v-if="isAdmin">
        <router-link to="/admin">관리자 페이지</router-link>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #f4f4f4;
  padding: 20px;
}
</style>
