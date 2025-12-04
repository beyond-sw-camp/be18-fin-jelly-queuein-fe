<template>
  <el-table
    :data="props.rows"
    border
    style="width: 100%"
    @row-click="goToDetail"
    highlight-current-row
  >
    <el-table-column type="selection" width="48" />

    <el-table-column prop="assetName" label="자원명" width="230" align="center" />

    <!-- assetType -->
    <el-table-column prop="assetType" label="자원 유형" width="210" align="center" />

    <!-- categoryName -->
    <el-table-column prop="categoryName" label="카테고리" width="210" align="center" />

    <!-- reservable (문구로 표시) -->
    <el-table-column prop="reservable" label="예약 가능 여부" width="150" align="center">
      <template #default="scope">
        <StatusTag :status="scope.row.reservable ? 'AVAILABLE' : 'UNAVAILABLE'" />
      </template>
    </el-table-column>

    <!-- needsApproval -->
    <el-table-column prop="needsApproval" label="승인 필요" width="120" align="center">
      <template #default="scope">
        {{ scope.row.needsApproval ? "예" : "아니오" }}
      </template>
    </el-table-column>

    <el-table-column label="예약하기" min-width="150" align="center">
      <template #default="scope">
      <el-button
        class="reserve-btn"
        size="small"
        @click.stop="goToDetail(scope.row, {})"
      >
        예약
      </el-button>

      </template>
    </el-table-column>
  </el-table>

  <div class="pagination">
    <el-pagination
      layout="prev, pager, next"
      :total="total"
      @current-change="(page) => emit('page-change', page - 1)"
    />
  </div>
</template>

<script setup>
import StatusTag from './ReservationStatus.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  rows: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
    date: {
    type: String,
    required: true
  }
})
// 부모가 받을 이벤트 선언
const emit = defineEmits(['page-change'])

const router = useRouter()
const goToDetail = (row) => {

  const targetPath = row.needsApproval
  ? '/app/reservations/apply'   // 선착순
  : '/app/reservations/create' //신청
  router.push({
    path: targetPath,
    query: {
      assetId: row.assetId,
      assetName: row.assetName,
      date: typeof props.date === "string"
        ? props.date
        : props.date.toISOString().slice(0, 10)
    }
  })
}


</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.reserve-btn {
  border: 1px solid #409EFF;   /* 파란 테두리 */
  background-color: #ecf5ff !important; /* 연한 파랑 배경 */
  color: #409EFF;              /* 파란 글씨 */
  border-radius: 4px;
  padding: 4px 12px;
  font-weight: 500;
}

.reserve-btn:hover {
  background-color: #d9ecff !important; /* hover 시 조금 더 진한 연파랑 */
  border-color: #409EFF;
  color: #409EFF;
}

</style>
