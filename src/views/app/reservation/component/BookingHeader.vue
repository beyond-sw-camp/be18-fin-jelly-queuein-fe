<template>
  <div class="reservation-header">

    <!-- 제목 -->
    <h2 class="title">{{ assetName }}</h2>

    <!-- 상단 속성 라인 -->
    <div class="info-row">
      <div class="info-label">자원 명</div>
      <div class="info-value">{{ assetName }}</div>

      <div class="info-label">예약 날짜</div>
      <div class="info-value">{{ date }}</div>

      <div class="info-label">예약자</div>
      <div class="info-value">{{ reserver }}</div>

      <div class="info-label">예약시간</div>
      <div class="info-value">{{ timeRange }}</div>
    </div>

    <!-- 추가된 구분선 (자원명 ~ 참여자 사이) -->
    <div class="divider"></div>

    <!-- 참여자 -->
    <div class="line-row">
      <div class="line-label">참여자</div>
      <div class="line-content">
        <el-button type="success" circle @click="onAdd">+</el-button>

        <div v-for="(p,i) in participants" :key="i" class="tag">
          {{ p }}
        </div>
      </div>
    </div>

    <!-- 비고 -->
    <div class="line-row">
      <div class="line-label">비고</div>
      <div class="line-content">{{ note }}</div>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  assetName: String,
  date: String,
  reserver: String,
  timeRange: String,
  participants: Array,
  note: String
});

const emit = defineEmits(["add"]);
const onAdd = () => emit("add");
</script>

<style scoped>
.reservation-header {
  width: 100%;
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 14px;
}

/* 상단 정보줄 */
.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.info-label {
  background: #c7dbbf;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  min-width: 90px;
  text-align: center;
}

.info-value {
  font-size: 15px;
  color: #555;
  margin-right: 18px;
  min-width: 80px;
}

/* 행 단위 영역 (참여자/비고) */
.line-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 4px solid #eaeaea;
}

.line-label {
  width: 90px;
  background: #c7dbbf;
  padding: 10px 0;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  margin-right: 12px;
}

.line-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag {
  background: #aed8ae;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
}

/* "자원명 ~ 참여자" 사이 구분선 */
.divider {
  width: 100%;
  border-bottom: 4px solid #eaeaea;
  margin: 6px 0 16px 0; /* 위쪽/아래쪽 이상적 간격 */
}
</style>
