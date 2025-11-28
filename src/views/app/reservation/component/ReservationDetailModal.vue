<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- 제목 + X -->
      <div class="header">
        <h2>{{ asset.name }}</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <!-- 상세 테이블 -->
      <div class="detail-table">
        <div class="row">
          <div class="label green">자원 명</div>
          <div class="value">{{ asset.name }}</div>

          <div class="label green">예약 상태</div>
          <div class="value">{{ asset.status }}</div>
        </div>

        <div class="row">
          <div class="label green">예약자</div>
          <div class="value">{{ asset.reserver }}</div>

          <div class="label green">예약 날짜</div>
          <div class="value">{{ asset.date }}</div>
        </div>

        <div class="row">
          <div class="label green">승인자</div>
          <div class="value">{{ asset.approver ?? '-' }}</div>

          <div class="label green">사용 시간</div>
          <div class="value">{{ asset.time ?? '-' }}</div>
        </div>

        <div class="row">
          <div class="label green">참여자</div>
          <div class="value">{{ asset.participants ?? '-' }}</div>

          <div class="label green">실제 사용 시간</div>
          <div class="value">{{ asset.realTime ?? '-' }}</div>
        </div>

        <div class="row">
          <div class="label green">승인 / 거절 사유</div>
          <div class="value">{{ asset.reason ?? '-' }}</div>

          <div class="label green">비고</div>
          <div class="value">{{ asset.note ?? '-' }}</div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="footer" v-if="actionLabel">
        <button 
          class="footer-btn"
          :disabled="isActionDisabled"
          @click="onAction"
        >
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  asset: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'start', 'end'])

const close = () => emit("close")

// 상태별 버튼 라벨
const actionLabel = computed(() => {
  switch (props.asset.usage) {
    case "PENDING":
      return null
    case "APPROVED":
      return "사용 시작"
    case "IN_USE":
      return "사용 종료"
    case "COMPLETED":
      return "취소 불가"
    case "CANCELLED":
      return null
    default:
      return null
  }
})

// 비활성화 조건
const isActionDisabled = computed(() => props.asset.usage === "COMPLETED")

// 버튼 동작
const onAction = () => {
  if (props.asset.usage === "APPROVED") {
    emit("start", props.asset.id)
  } else if (props.asset.usage === "IN_USE") {
    emit("end", props.asset.id)
  }
}
</script>

<style scoped>
/* 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* 모달 박스 */
.modal {
  width: 800px;
  background: #fff;
  border-radius: 6px;
  padding: 30px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 상단 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

/* 테이블 모양 */
.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.row {
  display: grid;
  grid-template-columns: 180px 1fr 180px 1fr;
  border-bottom: 1px solid #eaeaea;
}

.label {
  padding: 14px;
  font-weight: 600;
  color: white;
}

.green {
  background: #7ba678;
}

.value {
  padding: 14px;
  background: #fafafa;
}

/* 버튼 */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.footer-btn {
  padding: 10px 28px;
  border-radius: 6px;
  background: #ffffff;
  border: 1.5px solid #d0d0d0;
  cursor: pointer;
  transition: 0.2s;
}

.footer-btn:hover {
  background: #f3f3f3;
}

.footer-btn:disabled {
  cursor: not-allowed;
  background: #eaeaea;
}
</style>
