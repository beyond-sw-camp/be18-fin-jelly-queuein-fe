<template>
  <div>
    <el-table 
      :data="rows" 
      border 
      style="width: 100%" 
      @row-click="openRow"
      highlight-current-row
    >
      <!-- 선택 -->
      <el-table-column type="selection" width="48" />

      <!-- 기본 컬럼들 -->
      <el-table-column prop="assetName" label="자원명" width="130" align="center" />
      <el-table-column prop="assetType" label="자원 유형" width="110" align="center" />
      <el-table-column prop="categoryName" label="카테고리" width="110" align="center" />

      <!-- 자원 상태 -->
      <el-table-column label="자원 상태" width="120" align="center">
        <template #default="{ row }">
        <StatusTag :status="convertAssetStatus(row.assetStatus)" />

        </template>
      </el-table-column>

      <!-- 승인 여부 -->
      <el-table-column label="승인 여부" width="220" align="center">
        <template #default="{ row }">
          {{ row.isApproved ? "승인" : "미승인" }}
        </template>
      </el-table-column>

      <!-- 예약 시간 -->
      <el-table-column label="예약 시작/종료 시간" width="200" align="center">
        <template #default="{ row }">
          {{ formatTime(row.startAt) }} ~ {{ formatTime(row.endAt) }}
        </template>
      </el-table-column>

      <!-- 실제 시간 -->
      <el-table-column label="실제 시작/종료 시간" width="200" align="center">
        <template #default="{ row }">
          <span v-if="row.actualStartAt">
            {{ formatTime(row.actualStartAt) }} ~ {{ formatTime(row.actualEndAt) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 예약 상태 -->
      <el-table-column label="예약 상태" min-width="150" align="center">
        <template #default="{ row }">
          <!-- 백에서 온 reservationStatus 그대로 StatusTag로 전달 -->
          <StatusTag :status="row.reservationStatus" />
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { reservationApi } from "@/api/reservationApi"
import StatusTag from "./ReservationStatus.vue"
const props = defineProps({
  filters: {
    type: Object,
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
// 시간 포맷터
// ----------------------------
const formatTime = (instant) => {
  if (!instant) return "-"

  const d = new Date(instant)
  if (isNaN(d.getTime())) return "-"

  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}
const convertAssetStatus = (status) => {
  if (!status) return "-"

  switch (status.toUpperCase()) {
    case "AVAILABLE":
    case "ASSET_AVAILABLE":
      return "ASSET_AVAILABLE"   // 이용 가능
    case "UNAVAILABLE":
    case "ASSET_UNAVAILABLE":
      return "ASSET_UNAVAILABLE" // 이용 불가
    default:
      return status
  }
}


// ----------------------------
// API 호출
// ----------------------------
const fetchReservations = async () => {
  try {
    const params = {
      page: page.value - 1,
      size: pageSize.value,
      date: props.filters.date,
      assetType: props.filters.assetType || undefined,
      assetStatus: props.filters.assetStatus || undefined,
      categoryName: props.filters.categoryName || undefined,
      layerZero: props.filters.layerZero || undefined,
      layerOne: props.filters.layerOne || undefined,
      assetName: props.filters.assetName || undefined
    }

    const res = await reservationApi.getUserReservations(params)

    rows.value = res?.data?.content ?? []
    total.value = res?.data?.totalElements ?? 0

    rows.value.forEach(row => {
      console.log("reservationStatus =", row.reservationStatus)
      console.log("isApproved =", row.isApproved)
    })
  } catch (err) {
    console.error("예약 조회 실패:", err)
  }
}


// ----------------------------
// Row 클릭 이벤트
// ----------------------------
const openRow = (row, column) => {
  if (!column || column.type === "selection") return
  if (!row?.reservationId) return
  emit("open-detail", row.reservationId)
}

// ----------------------------
// 날짜 변경 시 페이지 초기화 + 리스트 재조회
// ----------------------------
watch(
  () => props.filters,
  () => {
    page.value = 1
    fetchReservations()
  },
  { deep: true, immediate: true }
)


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

/* 테이블 가로 스크롤(유령 scrollbar) 제거 */
.el-table__body-wrapper {
  overflow-x: hidden !important;
}

.el-table table {
  table-layout: fixed !important;
}


/* element-plus가 오른쪽에 자동으로 추가하는 여백 제거 */
.el-table__inner-wrapper {
  width: 100% !important;
}
/* 오른쪽 유령 여백 제거 */
:deep(.el-table__inner-wrapper) {
  width: 100% !important;
}

/* 가로 스크롤 강제 제거 */
:deep(.el-table__body-wrapper) {
  overflow-x: hidden !important;
}

/* 컬럼 width 계산 정확하게 */
:deep(.el-table table) {
  table-layout: fixed !important;
}

/* Element Plus가 자동으로 넣는 padding-right 제거 */
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  padding-right: 0 !important;
}

/* 임의로 붙는 scrollbar placeholder 제거 */
:deep(.el-table__footer-wrapper),
:deep(.el-table__append-wrapper) {
  padding-right: 0 !important;
}

</style>