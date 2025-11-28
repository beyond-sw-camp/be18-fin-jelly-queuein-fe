<template>
  <el-table :data="rows" border style="width: 100%" @row-click="openModal">

    <el-table-column type="selection" width="48" />

    <el-table-column prop="assetName" label="자원명" width="130" align="center" />

    <el-table-column prop="assetType" label="자원 유형" width="110" align="center" />

    <el-table-column prop="categoryName" label="카테고리" width="110" align="center" />

    <el-table-column prop="assetStatus" label="자원 상태" width="120" align="center">
      <template #default="scope">
        <StatusTag :status="scope.row.assetStatus" />
      </template>
    </el-table-column>

    <el-table-column prop="isApproved" label="승인 여부" width="120" align="center">
      <template #default="scope">
        <span>{{ scope.row.isApproved ? '승인' : '미승인' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="예약 시작/종료 시간" width="200" align="center">
      <template #default="scope">
        {{ formatTime(scope.row.startAt) }} ~ {{ formatTime(scope.row.endAt) }}
      </template>
    </el-table-column>

    <el-table-column label="실제 시작/종료 시간" width="200" align="center">
      <template #default="scope">
        <span v-if="scope.row.actualStartAt && scope.row.actualEndAt">
          {{ formatTime(scope.row.startAt) }} ~ {{ formatTime(scope.row.endAt) }}
        </span>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column prop="reservationStatus" label="예약 상태" min-width="150" align="center">
      <template #default="scope">
        <StatusTag :status="scope.row.reservationStatus" />
      </template>
    </el-table-column>

  </el-table>

  <div class="pagination">
    <el-pagination
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="changePage"
    />
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

import { ref, watch } from 'vue'
import { reservationApi } from '@/api/reservationApi'
import StatusTag from './ReservationStatus.vue'
import ReservationDetailModal from './ReservationDetailModal.vue'

const props = defineProps({
  date: {
    type: Date,
    required: true
  }
})

const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const modalOpen = ref(false)
const selectedRow = ref(null)

const openModal = (row, column) => {
  if (column.type === 'selection') return
  selectedRow.value = row
  modalOpen.value = true
}

const formatTime = (instant) => {
  if (!instant) return '-'
  return new Date(instant).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const fetchReservations = async () => {
  const selectedDate = props.date.toISOString().split('T')[0]

  try {
    const res = await reservationApi.getUserReservations({
      page: page.value - 1,
      size: pageSize.value,
      date: selectedDate
    })

    rows.value = res.data.content
    total.value = res.data.totalElements
  } catch (err) {
    console.error('예약 조회 실패:', err)
  }
}

watch(() => props.date, fetchReservations, { immediate: true })

const changePage = (newPage) => {
  page.value = newPage
  getUserReservations()   
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;   /* 중앙 정렬 */
  margin-top: 20px;
}
</style>