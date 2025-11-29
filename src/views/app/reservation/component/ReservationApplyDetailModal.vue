<template>
  <div 
    class="modal-overlay" 
    v-if="asset && visible"
    @click.self="close"
  >
    <div class="modal">

      <!-- 제목 + 닫기 -->
      <div class="header">
        <h2>예약 상세 조회</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <!-- 상세 테이블 -->
      <div class="detail-table">

        <div class="row">
          <div class="label green">자원 명</div>
          <div class="value">{{ asset?.name ?? "-" }}</div>

          <div class="label green">예약 상태</div>
          <div class="value">{{ asset?.status ?? "-" }}</div>
        </div>

        <div class="row">
          <div class="label green">예약자</div>
          <div class="value">{{ asset?.reserver ?? "-" }}</div>

          <div class="label green">예약 날짜</div>
          <div class="value">{{ asset?.date ?? "-" }}</div>
        </div>

        <div class="row">
          <div class="label green">승인자</div>
          <div class="value">{{ asset?.approver ?? "-" }}</div>

          <div class="label green">사용 시간</div>
          <div class="value">
            {{ formatKoreaTime(asset?.startAt) }} ~ {{ formatKoreaTime(asset?.endAt) }}
          </div>
        </div>

        <div class="row">
          <div class="label green">참여자</div>
          <div class="value">{{ participantsText }}</div>

          <div class="label green">실제 사용 시간</div>
          <div class="value">
            <template v-if="asset?.actualStartAt">
              {{ formatKoreaTime(asset?.actualStartAt) }} ~ {{ formatKoreaTime(asset?.actualEndAt) }}
            </template>
            <template v-else>
              -
            </template>
          </div>
        </div>

        <div class="row">
          <div class="label green">승인 / 거절 사유</div>
          <div class="value">{{ asset?.reason ?? "-" }}</div>

          <div class="label green">비고</div>
          <div class="value">{{ asset?.note ?? "-" }}</div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  visible: Boolean,
  asset: Object
})

const emit = defineEmits(["close"])

const close = () => emit("close")

/* -------------------------------------------
  🔵 한국 시간 HH:mm 포맷터
------------------------------------------- */
const formatKoreaTime = (instant) => {
  if (!instant) return "-"

  const date = new Date(instant)
  if (isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

/* -------------------------------------------
   참여자 출력
------------------------------------------- */
const participantsText = computed(() => {
  const p = props.asset?.participants

  if (!p) return "-"

  if (Array.isArray(p)) {
    if (p.length === 0) return "-"
    return p
      .map(item => typeof item === "string" ? item : item.name ?? "-")
      .join(", ")
  }

  if (typeof p === "object") {
    return p.name ?? "-"
  }

  return p
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  width: 800px;
  background: #fff;
  border-radius: 6px;
  padding: 30px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

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

.detail-table {
  width: 100%;
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
</style>
