<template>
  <el-dialog
    v-model="localVisible"
    width="60%"
    :show-close="false"
    class="reservation-dialog"
  >
    <!-- Header -->
    <div class="dialog-header">
      <h2>{{ safeAssetName }}</h2>
      <el-icon class="close-icon" @click="close"><Close /></el-icon>
    </div>

    <!-- Info Table -->
    <div class="info-table">
      <div class="row">
        <div class="cell label">자원 명</div>
        <div class="cell">{{ safeAssetName }}</div>

        <div class="cell label">예약 상태</div>
        <div class="cell">{{ safeStatus }}</div>
      </div>

      <div class="row">
        <div class="cell label">예약자</div>
        <div class="cell">{{ safeReserver }}</div>

        <div class="cell label">승인자</div>
        <div class="cell">{{ safeApprover }}</div>
      </div>

      <div class="row">
        <div class="cell label">예약 날짜</div>
        <div class="cell">{{ safeDate }}</div>

        <div class="cell label">승인 / 거절 사유</div>
        <div class="cell">{{ safeReason }}</div>
      </div>

      <div class="row">
        <div class="cell label">사용 시간</div>
        <div class="cell">{{ safeUseTime }}</div>

        <div class="cell label">참여자</div>
        <div class="cell">{{ safeParticipant }}</div>
      </div>

      <div class="row">
        <div class="cell label">실제 사용 시간</div>
        <div class="cell">{{ safeRealUseTime }}</div>

        <div class="cell label">비고</div>
        <div class="cell">{{ safeNote }}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="dialog-footer">
      <el-button type="primary" @click="close">사용종료</el-button>
    </div>
  </el-dialog>
</template>


<script setup>
import { computed } from "vue"
import { Close } from "@element-plus/icons-vue"

const props = defineProps({
  visible: Boolean,
  assetName: String,
  status: String,
  reserver: String,
  approver: String,
  date: String,
  reason: String,
  useTime: String,
  realUseTime: String,
  participant: String,
  note: String,
})

const safe = (v) => v ?? "-"

const safeAssetName = computed(() => safe(props.assetName))
const safeStatus = computed(() => safe(props.status))
const safeReserver = computed(() => safe(props.reserver))
const safeApprover = computed(() => safe(props.approver))
const safeDate = computed(() => safe(props.date))
const safeReason = computed(() => safe(props.reason))
const safeUseTime = computed(() => safe(props.useTime))
const safeRealUseTime = computed(() => safe(props.realUseTime))
const safeParticipant = computed(() => safe(props.participant))
const safeNote = computed(() => safe(props.note))

const emit = defineEmits(["update:visible"])

const localVisible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
})

const close = () => emit("update:visible", false)
</script>


<style scoped>
.reservation-dialog ::v-deep(.el-dialog__body) {
  padding: 0px 30px 30px 30px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-top: 20px;
}

.dialog-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.close-icon {
  cursor: pointer;
  font-size: 20px;
}

.info-table {
  border: 3px solid #3c68a4;
  padding: 20px;
  border-radius: 10px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 2fr;
  margin-bottom: 8px;
}

.cell {
  padding: 8px 10px;
  border-bottom: 1px solid #e8e8e8;
}

.label {
  background: #7da97d;
  font-weight: 600;
  color: white;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}
</style>
