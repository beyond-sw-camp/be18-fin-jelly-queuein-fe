<template>
  <el-table :data="rows" border style="width: 100%">
    <el-table-column type="selection" width="48" />

    <el-table-column prop="name" label="자원명" width="130" align="center"  />
    <el-table-column prop="type" label="자원 유형" width="110" align="center"  />
    <el-table-column prop="category" label="카테고리" width="110" align="center" />

    <el-table-column prop="status" label="자원 상태" width="120" align="center" >
      <template #default="scope">
        <StatusTag v-if="scope && scope.row" :status="scope.row.status" />
      </template>
    </el-table-column>

    <el-table-column prop="approval" label="승인 여부" width="120" align="center" />

    <el-table-column prop="time" label="예약 시작/종료 시간" width="200" align="center" />

    
    <el-table-column prop="time" label="실제 시작/종료 시간" width="200" align="center" />

    <el-table-column prop="usage" label="예약 상태" min-width="150" align="center" >
      <template #default="scope">
        <StatusTag v-if="scope && scope.row" :status="scope.row.usage" />
      </template>
    </el-table-column>
  </el-table>
  <div class="pagination">
    <el-pagination layout="prev, pager, next" :total="100" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusTag from './ReservationStatus.vue'

const rows = ref([
  {
    name: "스튜디오 1",
    type: "공간",
    category: "스튜디오",
    status: "AVAILABLE",
    approval: "-",
    time: "11:00 - 12:00",
    usage: "PENDING"
  },
  {
    name: "스튜디오 2",
    type: "공간",
    category: "스튜디오",
    status: "AVAILABLE",
    approval: "-",
    time: "11:00 - 12:00",
    usage: "APPROVED"
  }
])
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
