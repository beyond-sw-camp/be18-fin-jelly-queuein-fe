<template>
  <el-table 
    :data="rows" 
    border 
    style="width: 100%" 
    @row-click="openRow"
    highlight-current-row
  >

    <el-table-column type="selection" width="48" />

    <el-table-column prop="assetName" label="자원명" width="130" align="center" />

    <el-table-column prop="assetType" label="자원 유형" width="110" align="center" />

    <el-table-column prop="categoryName" label="카테고리" width="110" align="center" />

    <el-table-column label="자원 상태" width="120" align="center">
      <template #default="scope">
        <StatusTag :status="scope.row.assetStatus" />
      </template>
    </el-table-column>

    <el-table-column label="승인 여부" width="120" align="center">
      <template #default="scope">
        {{ scope.row.isApproved ? "승인" : "미승인" }}
      </template>
    </el-table-column>

    <el-table-column label="예약 시작/종료 시간" width="200" align="center">
      <template #default="scope">
        {{ formatTime(scope.row.startAt) }} ~ {{ formatTime(scope.row.endAt) }}
      </template>
    </el-table-column>

    <el-table-column label="실제 시작/종료 시간" width="200" align="center">
      <template #default="scope">
        <span v-if="scope.row.actualStartAt">
          {{ formatTime(scope.row.actualStartAt) }} ~ {{ formatTime(scope.row.actualEndAt) }}
        </span>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column label="예약 상태" width="150" align="center">
      <template #default="scope">
        <StatusTag :status="scope.row.reservationStatus" />
      </template>
    </el-table-column>

  </el-table>

  <!-- Pagination -->
  <div class="pagination">
    <el-pagination
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="changePage"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { reservationApi } from "@/api/reservationApi"
import StatusTag from "./ReservationStatus.vue"

const props = defineProps({
  date: {
    type: String,   // yyyy-MM-dd
    required: true,
  },
})

const emit = defineEmits(["open-detail"])

// ----------------------------
// 상태값
// ----------------------------
const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// ----------------------------
// 일반 함수
// ----------------------------
const formatTime = (instant) => {
  if (!instant) return "-"
  return new Date(instant).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

// ----------------------------
// API 호출
// ----------------------------
const fetchReservations = async () => {
  try {
    const res = await reservationApi.getUserReservations({
      page: page.value - 1,
      size: pageSize.value,
      date: props.date,
    })

    rows.value = res.data.content
    total.value = res.data.totalElements
  } catch (err) {
    console.error("예약 조회 실패:", err)
  }
}

// ----------------------------
// Row 클릭 → 부모에게 ID 전달
// ----------------------------
const openRow = (row, column) => {
  if (column.type === "selection") return
  if (!row.reservationId) return
  emit("open-detail", row.reservationId)
}

// ----------------------------
// 날짜 변경 시 자동 호출
// ----------------------------
watch(() => props.date, fetchReservations, { immediate: true })

// ----------------------------
// 페이지 변경
// ----------------------------
const changePage = (newPage) => {
  page.value = newPage
  fetchReservations()
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>