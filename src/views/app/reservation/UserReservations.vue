<template>
  <div class="header-row">
    <h2>사용자 예약 내용 조회</h2>

    <el-input
      v-model="search"
      placeholder="검색어를 입력해주세요"
      class="search-input"
    >
      <template #append>
        <el-button icon="Search" />
      </template>
    </el-input>
  </div>

  <!-- 탭 -->
  <div class="tabs-full-row">
    <ReservationTabs />
  </div>

  <!-- 날짜 필터 -->
  <ReservationFilters @date-change="handleDateChange" />

  <!-- 예약 목록 -->
  <ReservationTable 
    :date="selectedDate"
    @open-detail="openDetailModal"
  />

  <!-- 상세 모달 -->
  <ReservationDetailModal
    v-model:visible="modalOpen"
    :assetName="reservationDetail.assetName"
    :status="reservationDetail.status"
    :reserver="reservationDetail.reserver"
    :approver="reservationDetail.approver"
    :date="reservationDetail.date"
    :reason="reservationDetail.reason"
    :useTime="reservationDetail.useTime"
    :realUseTime="reservationDetail.realUseTime"
    :participant="reservationDetail.participant"
    :note="reservationDetail.note"
  />

</template>


<script setup>
import { ref } from 'vue'
import ReservationTabs from './component/ReservationTab.vue'
import ReservationFilters from './component/ReservationFilter.vue'
import ReservationTable from './component/UserReservationTable.vue'
import ReservationDetailModal from './component/ReservationDetailModal.vue'
import { reservationApi } from '@/api/reservationApi'

// ------------------------------
// 🔵 검색어 (현재 사용 X, 향후 확장용)
// ------------------------------
const search = ref("")

// ------------------------------
// 🔵 오늘 날짜를 기본값으로 설정 (문자열)
// ------------------------------
const selectedDate = ref(
  new Date().toISOString().split("T")[0]   // "2025-11-28"
)

// ------------------------------
// 🔵 모달 ON/OFF
// ------------------------------
const modalOpen = ref(false)

// ------------------------------
// 🔵 상세 데이터 (props로 그대로 모달에 전달됨)
// ------------------------------
const reservationDetail = ref({
  assetName: '',
  status: '',
  reserver: '',
  approver: '',
  date: '',
  reason: '',
  useTime: '',
  realUseTime: '',
  participant: '',
  note: ''
})

// -------------------------------------
// 🔥 날짜 필터 변경 시 호출되는 함수
// -------------------------------------
const handleDateChange = (newDate) => {
  selectedDate.value = newDate   // "YYYY-MM-DD"
}

// -------------------------------------
// 🔥 상세조회 API 호출 → 모달에 값 세팅
// -------------------------------------
const openDetailModal = async (reservationId) => {
  try {
    const res = await reservationApi.getDetail(reservationId)
    const d = res.data

    reservationDetail.value = {
      assetName: d.assetName,
      status: d.reservationStatus,
      reserver: d.reserverName,
      approver: d.approverName,
      date: d.date,
      reason: d.reason,
      useTime: `${d.startAt} ~ ${d.endAt}`,
      realUseTime: d.actualStartAt 
        ? `${d.actualStartAt} ~ ${d.actualEndAt}` 
        : '-',
      participant: d.participant,
      note: d.note
    }

    modalOpen.value = true

  } catch (err) {
    console.error("상세 조회 실패:", err)
  }
}
</script>


<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 260px;
}

.tabs-full-row {
  margin-bottom: 15px;
}

</style>
