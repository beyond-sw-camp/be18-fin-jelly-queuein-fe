<template>
  <div>
    <!-- 헤더 -->
    <div class="header-row">
      <h2>예약 신청 목록 조회</h2>

      <el-input
        v-model="searchParams.assetName"
        placeholder="검색어를 입력해주세요"
        class="search-input"
        @keyup.enter="fetchAppliedReservations"
      >
        <template #append>
          <el-button icon="Search" @click="fetchAppliedReservations" />
        </template>
      </el-input>
    </div>

    <ReservationTabs />

    <ReservationFilters
      @change="(f) => {
        Object.assign(searchParams, f)
        searchParams.page = 0 
        fetchAppliedReservations()
      }"
    />

    <ReservationTable
      :rows="tableData"
      :total="total"
      @page-change="(p) => {
        searchParams.page = p
        fetchAppliedReservations()
      }"
      @open-detail="openDetailModal"
      @approve="onApprove"
      @reject="onReject"
    />

    <ReservationDetailModal
      v-model:visible="modalOpen"
      :asset="reservationDetail"
      @close="closeModal"
      @save-reason="onSaveReason"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api/axios"

import ReservationTabs from "./component/ReservationTab.vue"
import ReservationFilters from "./component/ReservationFilter.vue"
import ReservationTable from "./component/AppliedReservationTable.vue"
import ReservationDetailModal from "./component/ReservationApplyDetailModal.vue"


const searchParams = ref({
  date: "",
  applicantName: "",
  respondentName: "",
  isApproved: "",
  isReservable: "",
  assetName: "",
  assetType: "",
  categoryName: "",
  assetStatus: "",
  layerZero: "",
  layerOne: "",
  page: 0,
  size: 10
})

const tableData = ref([])
const total = ref(0)

const modalOpen = ref(false)
const reservationDetail = ref(null)
const currentUserName = ref("")


async function fetchAppliedReservations() {
  const params = buildParams()
  const res = await api.get("/reservations/pending", { params })

  tableData.value = res.data.content ?? []
  total.value = res.data.totalElements ?? 0
}

async function openDetailModal(reservationId) {
  try {
    const res = await api.get(`/reservations/${reservationId}`)
    const d = res.data

    reservationDetail.value = {
      id: d.reservationId,                       
      version: d.version,
      name: d.assetName,
      status: d.reservationStatus,
      date: d.date,
      reserver: d.applicantName,
      approver: d.respondentName,

      startAt: d.startAt,
      endAt: d.endAt,

      actualStartAt: d.actualStartAt,
      actualEndAt: d.actualEndAt,

      participants: d.attendants,
      reason: d.reason,
      note: d.note,
      usage: d.reservationStatus
    }

    modalOpen.value = true
  } catch (err) {
    console.error("상세 조회 실패:", err)
  }
}

function closeModal() {
  modalOpen.value = false
  reservationDetail.value = null
}
async function handleSaveReason(reason) {
  try {
    await api.patch(`/reservations/${reservationDetail.value.id}/approve`, {
      version: reservationDetail.value.version,
      reason: reason
    })

    reservationDetail.value.reason = reason
    fetchAppliedReservations()
  } catch (err) {
    console.error("승인/거절 사유 저장 실패:", err)
  }
}
const onSaveReason = (reason) => {
  const id = reservationDetail.value.id

  // 테이블 row 찾아서 reason만 수정
  const idx = tableData.value.findIndex(r => r.reservationId === id)
  if (idx !== -1) {
    tableData.value[idx].reason = reason
  }

  // 상세 데이터도 업데이트
  reservationDetail.value.reason = reason

  modalOpen.value = false
}

async function onApprove(row) {
  try {
    await api.patch(`/reservations/${row.reservationId}/approve`, {
      version: row.version,
      approverName: currentUserName.value
    })

    // UI 반영
    row.isApproved = "APPROVED"
    row.respondentName = currentUserName.value

    fetchAppliedReservations() // 전체 갱신
  } catch (err) {
    console.error("승인 실패:", err)
  }
}

async function onReject(row) {
  try {
    await api.patch(`/reservations/${row.reservationId}/reject`, {
      version: row.version,
      approverName: currentUserName.value
    })

    // UI 반영
    row.isApproved = "REJECTED"
    row.respondentName = currentUserName.value

    fetchAppliedReservations()
  } catch (err) {
    console.error("거절 실패:", err)
  }
}
function getKSTDateString() {
  const offset = 9 * 60 * 60 * 1000
  const kst = new Date(Date.now() + offset)
  return kst.toISOString().slice(0, 10)
}
function buildParams() {
  const params = {}
  Object.entries(searchParams.value).forEach(([key, value]) => {
    params[key] = value === "" ? null : value
  })
  return params
}


onMounted(async() => {
  searchParams.value.date = getKSTDateString()

  try {
    const res = await api.get("/users/me")
    currentUserName.value = res.data.userName
  } catch (e) {
    console.error("유저 정보 조회 실패:", e)
  }

  fetchAppliedReservations()
})
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
</style>
