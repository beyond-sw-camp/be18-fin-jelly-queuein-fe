<template>
  <el-dialog
    v-model="visible"
    width="60%"
    :show-close="false"
    class="reservation-dialog"
  >
    <!-- Header -->
    <div class="dialog-header">
      <h2>{{ assetName }}</h2>
      <el-icon class="close-icon" @click="close"><Close /></el-icon>
    </div>

    <!-- Content -->
    <div class="info-table">

      <div class="row">
        <div class="cell label">자원 명</div>
        <div class="cell">{{ assetName }}</div>

        <div class="cell label">예약 상태</div>
        <div class="cell">{{ status }}</div>
      </div>

      <div class="row">
        <div class="cell label">예약자</div>
        <div class="cell">{{ reserver }}</div>

        <div class="cell label">승인자</div>
        <div class="cell">{{ approver }}</div>
      </div>

      <div class="row">
        <div class="cell label">예약 날짜</div>
        <div class="cell">{{ date }}</div>

        <div class="cell label">승인 / 거절 사유</div>
        <div class="cell">{{ reason }}</div>
      </div>

      <div class="row">
        <div class="cell label">사용 시간</div>
        <div class="cell">{{ useTime }}</div>

        <div class="cell label">참여자</div>
        <div class="cell">{{ participant }}</div>
      </div>

      <div class="row">
        <div class="cell label">실제 사용 시간</div>
        <div class="cell">{{ realUseTime }}</div>

        <div class="cell label">비고</div>
        <div class="cell">{{ note }}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="dialog-footer">
      <el-button type="primary" @click="close">사용종료</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { Close } from "@element-plus/icons-vue";

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
  note: String
});

const emit = defineEmits(["update:visible"]);

const close = () => {
  emit("update:visible", false);
};
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

/* Each row is 4 columns (label/value + label/value) */
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
