<template>
  <div>

    <div v-if="loading" class="loading">
      데이터를 불러오는 중...
    </div>

    <table v-else class="usage-table">
      <thead>
        <tr>
          <th style="width: 60px;">상세</th>
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
          <td>
            <button class="detail-btn" @click="openDetail(row)">
              조회
            </button>
          </td>

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
      <button class="nav-btn" :disabled="currentPage === 0" @click="goPrevChunk">
        <span class="arrow">&lt;</span>
      </button>

      <span
        v-for="i in pagesToShow"
        :key="i"
        class="page-btn"
        :class="{ active: currentPage === i - 1 }"
        @click="changePage(i - 1)"
      >
        {{ i }}
      </span>

      <button class="nav-btn" :disabled="currentPage === totalPages - 1" @click="goNextChunk">
        <span class="arrow">&gt;</span>
      </button>
    </div>

    <!-- ========================== -->
    <!-- 상세 모달 ------------------- -->
    <!-- ========================== -->
    <div v-if="showDetail" class="modal-backdrop" @click="closeDetail"></div>

    <div v-if="showDetail" class="detail-modal">
      <div class="modal-header">
        <span>상세 정보</span>
        <button class="close-btn" @click="closeDetail">✕</button>
      </div>

      <div class="modal-body">
        <div class="modal-image"></div>

        <div class="modal-info">
          <p><strong>자원명:</strong> {{ detailData.assetName }}</p>
          <p><strong>예약 시작:</strong> {{ detailData.reservationStartAt }}</p>
          <p><strong>예약 종료:</strong> {{ detailData.reservationEndAt }}</p>
          <p><strong>실사용 시간:</strong> {{ detailData.actualMinutes }}분</p>
          <p><strong>사용률:</strong> {{ Math.round(detailData.usageRatio * 100) }}%</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from "vue"

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

/* ============
   상세 모달
============== */
const showDetail = ref(false)
const detailData = ref({})

function openDetail(row) {
  detailData.value = row
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
}
</script>

<style scoped>
/* 테이블 */
.usage-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  background: white;
  font-size: 14px;
}

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

.usage-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #EFEFEF;
  text-align: center;
  color: #333;
  font-size: 14px;
}

.usage-table tbody tr:hover {
  background: #F6F6F6;
}

/* 조회 버튼 */
.detail-btn {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #1A73E8;
  color: #1A73E8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.detail-btn:hover {
  background: #EBF3FF;
}

/* 모달 배경 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(3px);
  z-index: 998;
}

/* 모달 */
.detail-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  z-index: 999;
  box-shadow: 0px 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  margin-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  gap: 20px;
}

.modal-image {
  width: 160px;
  height: 140px;
  background: #ddd;
  border-radius: 8px;
}

.modal-info p {
  margin: 6px 0;
}
</style>
