<template>
  <el-table :data="rows" border style="width: 100%">
    <el-table-column type="selection" width="48" align="center" />

    <el-table-column prop="assetName" label="자원명" width="250" align="center" />

    <el-table-column prop="requester" label="신청자" width="120" align="center" />

    <el-table-column prop="approver" label="승인자" width="220" align="center" />

    <el-table-column prop="avail" label="예약 가능 여부" width="120" align="center" />

    <!-- 승인/거절 버튼 -->
    <el-table-column label="승인 / 거절" width="250" align="center">
      <template #default="scope">
        <el-button type="success" size="small" @click="approve(scope.row)">
          승인
        </el-button>

        <el-button
          type="danger"
          size="small"
          @click="reject(scope.row)"
          style="margin-left: 6px"
        >
          거절
        </el-button>
      </template>
    </el-table-column>

    <!-- 예약 결과 -->
    <el-table-column label="예약 결과" width="220" align="center">
      <template #default="scope">
        <el-tag v-if="scope.row.result === 'approved'" type="success">승인</el-tag>
        <el-tag v-else-if="scope.row.result === 'rejected'" type="danger">거절</el-tag>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column prop="reason" label="사유" min-width="30" align="center" />
  </el-table>
</template>

<script setup>
import { ref } from 'vue'

/** 테이블 데이터 */
const rows = ref([
  {
    id: 1,
    assetName: '스튜디오 1',
    requester: '박채연',
    approver: '박채연',
    avail: '가능',
    result: null,
    reason: '-',
  },
  {
    id: 2,
    assetName: '스튜디오 1',
    requester: '박채연',
    approver: '박채연',
    avail: '불가능',
    result: 'rejected',
    reason: '-',
  },
  {
    id: 3,
    assetName: '스튜디오 1',
    requester: '박채연',
    approver: '박채연',
    avail: '가능',
    result: 'approved',
    reason: '-',
  },
])

/** 승인 버튼 */
function approve(row) {
  row.result = 'approved'
}

/** 거절 버튼 */
function reject(row) {
  row.result = 'rejected'
}
</script>
<style scoped>
:deep(.el-table__row td),
:deep(.el-table__header th) {
  width: calc(100% / 8) !important;
}
</style>
