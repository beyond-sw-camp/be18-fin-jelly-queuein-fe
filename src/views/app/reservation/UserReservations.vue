<template>
  <div>
    <!-- 헤더 -->
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
      :key="tableKey"
    />

    <!-- 상세 모달 -->
    <ReservationDetailModal
      v-model:visible="modalOpen"
      :asset="reservationDetail"
      @close="closeModal"
      @start="handleStart"
      @end="handleEnd"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"

import ReservationTabs from "./component/ReservationTab.vue"
import ReservationFilters from "./component/ReservationFilter.vue"
import ReservationTable from "./component/UserReservationTable.vue"
import ReservationDetailModal from "./component/ReservationDetailModal.vue"
import { reservationApi } from "@/api/reservationApi"

// 검색어
const search = ref("")

// 기본 날짜 (오늘)
const selectedDate = ref(new Date().toISOString().split("T")[0])

// 모달 관련 상태
const modalOpen = ref(false)
const reservationDetail = ref(null)

// 테이블 갱신용 key
const tableKey = ref(0)
const refreshTable = () => {
  tableKey.value += 1
}

// 날짜 변경 handler
const handleDateChange = (newDate) => {
  selectedDate.value = newDate
  refreshTable()
}

/* ------------------------------------
   상세 조회 API 호출
------------------------------------ */
const openDetailModal = async (reservationId) => {
  try {
    const res = await reservationApi.getReservationDetail(reservationId)
    const d = res.data

    reservationDetail.value = {
      id: d.id,
      name: d.assetName,
      status: d.reservationStatus,
      usage: d.reservationStatus, // 버튼 로직용
      isApproved: d.isApproved,
      reserver: d.reserverName,
      approver: d.approverName,
      assetStatus: d.assetStatus,
      date: d.date,

      startAt: d.startAt,
      endAt: d.endAt,
      actualStartAt: d.actualStartAt,
      actualEndAt: d.actualEndAt,

      participants: d.participant,

      reason: d.reason,
      note: d.note
    }

    modalOpen.value = true

  } catch (err) {
    console.error("상세 조회 실패:", err)
  }
}

/* ------------------------------------
   사용 시작
------------------------------------ */
const handleStart = async (id) => {
  try {
    await reservationApi.startUsing(id)
    modalOpen.value = false
    refreshTable()
  } catch (e) {
    console.error("사용 시작 실패:", e)
  }
}

/* ------------------------------------
   사용 종료
------------------------------------ */
const handleEnd = async (id) => {
  try {
    await reservationApi.endUsing(id)
    modalOpen.value = false
    refreshTable()
  } catch (e) {
    console.error("사용 종료 실패:", e)
  }
}

/* ------------------------------------
   예약 취소
------------------------------------ */
const handleCancel = async (id) => {
  try {
    await reservationApi.cancel(id)
    modalOpen.value = false
    refreshTable()
  } catch (e) {
    console.error("취소 실패:", e)
  }
}

/* ------------------------------------
   모달 닫기
------------------------------------ */
const closeModal = () => {
  modalOpen.value = false
  reservationDetail.value = null
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
