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
          <th style="width: 60px;">상세</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rows"
          :key="row.usageHistoryId"
        >

          <td>{{ row.assetName }}</td>
          <td>{{ toKST(row.reservationStartAt) }}</td>
          <td>{{ toKST(row.reservationEndAt) }}</td>
          <td>{{ row.reservationMinutes }}</td>
          <td>{{ toKST(row.actualStartAt) }}</td>
          <td>{{ toKST(row.actualEndAt) }}</td>
          <td>{{ row.actualMinutes }}</td>
          <td>{{ Math.round(row.usageRatio * 100) }}%</td>

          <!-- 조회 링크 형태로 변경 -->
          <td class="detail-cell">
            <span class="detail-link" @click="openDetail(row.usageHistoryId)">조회</span>
          </td>
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

      <button
        class="nav-btn"
        :disabled="currentPage === totalPages - 1"
        @click="goNextChunk"
      >
        <span class="arrow">&gt;</span>
      </button>
    </div>

    <!-- 상세 모달 -->
    <div v-if="showDetail" class="modal-backdrop" @click="closeDetail"></div>

    <div v-if="showDetail" class="detail-modal">
      <div class="modal-header">
        <span>상세 정보</span>
        <button class="close-btn" @click="closeDetail">✕</button>
      </div>

      <div class="modal-body">
        <div class="modal-image">
          <img
            v-if="detailData.assetImage"
            :src="detailData.assetImage"
            alt="자원 이미지"
          />
          <div v-else class="no-image">이미지 없음</div>
        </div>

        <div class="modal-info">
          <p><strong>자원명:</strong> {{ detailData.assetName }}</p>

          <p><strong>예약자:</strong>
            <span v-if="detailData.reserverNames?.length">
              {{ detailData.reserverNames.join(", ") }}
            </span>
            <span v-else>없음</span>
          </p>

          <p><strong>청구금액:</strong> {{ detailData.billAmount }}</p>
          <p><strong>실제 청구금액:</strong> {{ detailData.actualBillAmount }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import api from "@/api/axios"
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

// 날짜 변환 
function toKST(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString); // UTC 기반 Date 생성
  // KST = UTC + 9
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace("T", " ").slice(0, 16); 
}

function goNextChunk() {
  const target = Math.min(chunkEnd.value, totalPages.value - 1)
  emit("changePage", target)
}

/* 상세 모달 */
const showDetail = ref(false)
const detailData = ref({})

async function openDetail(id) {
  try {
    const { data } = await api.get(`/accounting/usage-history/${id}`)
    detailData.value = data
    showDetail.value = true
  } catch (err) {
    console.error("상세 API 오류:", err)
  }
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

/* hover */
.usage-table tbody tr:hover {
  background: #F6F6F6;
}

/* 조회 링크 */
.detail-cell {
  text-align: left !important;
  padding-left: 12px;
}

.detail-link {
  color: #1A73E8;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.detail-link:hover {
  color: #1257b0;
}

/* 페이징 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn.active {
  background: rgb(255, 255, 255);
  color: #00A950;
  border-color: #00A950;
}

.nav-btn {
  padding: 6px 10px;
  border-radius: 4px;
  background: white;
  border: 1px solid #ccc;
}

/* 모달 배경 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 998;
}

/* 모달 */
.detail-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  background: white;
  border-radius: 12px;
  padding: 32px;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
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
  gap: 40px;
}

.modal-image {
  width: 260px;
  height: 200px;
  background: #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image {
  color: #777;
  font-size: 13px;
}

.modal-info p {
  margin: 20px 0;
}
</style>
