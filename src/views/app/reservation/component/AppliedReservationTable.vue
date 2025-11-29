<template>
  <el-table
    :data="props.rows"
    border
    style="width: 100%"
    highlight-current-row
    @row-click="onRowClick"
  >
    <!-- 체크박스 -->
    <el-table-column type="selection" width="48" />

    <!-- 자원명 -->
    <el-table-column prop="assetName" label="자원명" width="230" align="center" />

    <!-- 신청자 -->
    <el-table-column prop="applicantName" label="신청자" width="120" align="center" />

    <!-- 승인자 -->
    <el-table-column prop="respondentName" label="승인자" width="220" align="center" />

    <!-- 예약 가능 여부 -->
    <el-table-column prop="isReservable" label="예약 가능 여부" width="150" align="center">
      <template #default="scope">
        {{ scope.row.isReservable ? "가능" : "불가능" }}
      </template>
    </el-table-column>

    <!-- 승인/거절 버튼 -->
    <el-table-column label="승인 / 거절" width="250" align="center">
      <template #default="scope">
        <el-button type="success" size="small" @click.stop="emit('approve', scope.row)">
          승인
        </el-button>

        <el-button type="danger" size="small" @click.stop="emit('reject', scope.row)" style="margin-left: 6px">
          거절
        </el-button>
      </template>
    </el-table-column>

    <!-- 예약 결과 -->
    <el-table-column label="예약 결과" width="180" align="center">
      <template #default="scope">
        <el-tag v-if="scope.row.isApproved === 'APPROVED'" type="success">승인</el-tag>
        <el-tag v-else-if="scope.row.isApproved === 'REJECTED'" type="danger">거절</el-tag>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <!-- 사유 -->
    <el-table-column prop="reason" label="사유" width="150" align="center" />
  </el-table>

  <!-- Pagination -->
  <div class="pagination">
    <el-pagination
      layout="prev, pager, next"
      :total="props.total"
      @current-change="(page) => emit('page-change', page - 1)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  rows: { type: Array, required: true },
  total: { type: Number, required: true }
})

const emit = defineEmits(["page-change", "approve", "reject", "open-detail"])

/**
 * 행 클릭 시 상세 조회 모달을 띄운다
 * 단, 체크박스 클릭 / 승인버튼 클릭 / 거절버튼 클릭일 때는 제외
 */
const onRowClick = (row, column) => {
  // 1) 선택 체크박스 클릭은 무시
  if (column?.type === "selection") return

  // 2) 예약 ID가 없는 경우는 상세조회 불가
  if (!row?.reservationId) return

  // 3) 부모로 이벤트 전달 → 상세 조회 모달 열림
  emit("open-detail", row.reservationId)
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
