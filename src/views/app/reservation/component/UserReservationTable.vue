<template>
  <el-table :data="rows" border style="width: 100%" @row-click="openModal" highlight-current-row>
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
  <ReservationDetailModal
    v-if="modalOpen"
    :asset="selectedRow"
    @close="modalOpen = false"
    @start="startReservation"
    @end="endReservation"
  />
</template>
<script setup>
import { ref } from 'vue'
import StatusTag from './ReservationStatus.vue'
import ReservationDetailModal from './ReservationDetailModal.vue'

const rows = ref([
  {
    id: 1,
    name: "스튜디오 1",
    type: "공간",
    category: "스튜디오",
    status: "AVAILABLE",
    approval: "-",
    time: "11:00 - 12:00",
    usage: "PENDING"
  },
  {
    id: 2,
    name: "스튜디오 2",
    type: "공간",
    category: "스튜디오",
    status: "AVAILABLE",
    approval: "-",
    time: "11:00 - 12:00",
    usage: "APPROVED"
  }
])

const modalOpen = ref(false)
const selectedRow = ref(null)

const openModal = (row, column) => {
  if (column.type === "selection") return
  selectedRow.value = row
  modalOpen.value = true
}

const startReservation = (id) => {
  console.log("사용 시작:", id)
}

const endReservation = (id) => {
  console.log("사용 종료:", id)
}
</script>


<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
