<template>
  <el-tabs v-model="active" class="reservation-tabs">
    <el-tab-pane label="예약 현황" name="status" />
    <el-tab-pane label="예약 가능 자원 목록" name="available" />
    <el-tab-pane label="예약하기" name="create" />
    <el-tab-pane label="예약 관리" name="manage" />
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue'
const active = ref("status")
</script>

<style scoped>
.reservation-tabs {
  margin-bottom: 20px;
}
</style>
