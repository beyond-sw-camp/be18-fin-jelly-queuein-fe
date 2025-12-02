<template>
  <div>

    <div v-if="loading" class="loading">
      데이터를 불러오는 중...
    </div>

    <table v-else class="usage-table">
      <thead>
        <tr>
          <th>자원명</th>
          <th>예약 시작</th>
          <th>예약 종료</th>
          <th>예약 시간(분)</th>
          <th>실제 시작</th>
          <th>실제 종료</th>
          <th>실사용 시간(분)</th>
          <th>사용률(%)</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in rows" :key="row.usageHistoryId">
          <td>{{ row.assetName }}</td>
          <td>{{ row.reservationStartAt }}</td>
          <td>{{ row.reservationEndAt }}</td>
          <td>{{ row.reservationMinutes }}</td>
          <td>{{ row.actualStartAt }}</td>
          <td>{{ row.actualEndAt }}</td>
          <td>{{ row.actualMinutes }}</td>
          <td>{{ Math.round(row.usageRatio * 100) }}%</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이징 -->
    <div class="pagination">

      <!-- 이전 그룹 이동 -->
      <button
        class="nav-btn"
        :disabled="currentPage === 0"
        @click="goPrevChunk"
      >
        <span class="arrow">&lt;</span>
      </button>

      <!-- 페이지 번호 -->
      <span
        v-for="i in pagesToShow"
        :key="i"
        class="page-btn"
        :class="{ active: currentPage === i - 1 }"
        @click="changePage(i - 1)"
      >
        {{ i }}
      </span>

      <!-- 다음 그룹 이동 -->
      <button
        class="nav-btn"
        :disabled="currentPage === totalPages - 1"
        @click="goNextChunk"
      >
        <span class="arrow">&gt;</span>
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  rows: Array,
  loading: Boolean,
  pageInfo: Object,
})

const emit = defineEmits(["changePage"])

const chunkSize = 5

const currentPage = computed(() => props.pageInfo.page)
const totalPages = computed(() => props.pageInfo.totalPages)

const chunkStart = computed(() => {
  return Math.floor(currentPage.value / chunkSize) * chunkSize
})

const chunkEnd = computed(() => {
  return Math.min(chunkStart.value + chunkSize, totalPages.value)
})

const pagesToShow = computed(() => {
  let arr = []
  for (let i = chunkStart.value + 1; i <= chunkEnd.value; i++) {
    arr.push(i)
  }
  return arr
})

function changePage(page) {
  emit("changePage", page)
}

function goPrevChunk() {
  const target = Math.max(chunkStart.value - 1, 0)
  emit("changePage", target)
}

function goNextChunk() {
  const target = Math.min(chunkEnd.value, totalPages.value - 1)
  emit("changePage", target)
}
</script>

<style scoped>
/* ==== 테이블 전체 ==== */
.usage-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  background: white;
  font-size: 14px;
}

/* ==== 헤더 (연녹색 + 진녹색 글씨) ==== */
.usage-table thead tr {
  background: #D9E9CF;
  border-bottom: 2px solid #E0E6E0;
}

.usage-table th {
  padding: 12px;
  font-weight: 700;
  color: #565D6D;
  text-align: center;
  font-size: 14px;
}

/* ==== 본문 ==== */
.usage-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #EFEFEF;
  text-align: center;
  color: #333;
  font-size: 14px;
}

/* 행 hover */
.usage-table tbody tr:hover {
  background: #F6F6F6;
}

/* ==== 페이징 ==== */
.pagination {
  display: flex;
  justify-content: center;
  margin: 25px 0;
  gap: 8px;
}

/* 페이지 번호 */
.page-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 6px;
  min-width: 38px;
  text-align: center;
  background: white;
  font-size: 14px;
}

/* 현재 페이지 */
.page-btn.active {
  background: #ffffff;
  color: rgb(0, 0, 0);
  border-color: #00A950;
  font-weight: 600;
}

/* 좌우 화살표 */
.nav-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f7f7f7;
  cursor: pointer;
  min-width: 38px;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.arrow {
  font-size: 14px;
  font-weight: 600;
}
</style>
