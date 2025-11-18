<script setup>
const role = localStorage.getItem('role')
</script>

<template>
  <div class="admin">
    <h1>관리자 페이지</h1>
    <p>현재 역할: {{ role }}</p>
    <p>여기는 MASTER / ADMIN 사용자가 접근 가능한 관리자 대시보드입니다.</p>
  </div>
</template>

<style scoped>
.admin {
  padding: 20px;
}
</style>
