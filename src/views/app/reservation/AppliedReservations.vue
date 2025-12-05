<template>
  <div>
    <div class="tabs-full-row">
      <ReservationTabs />
    </div>

    <!-- 헤더 -->
    <div class="header-row">
      <h2>예약 관리</h2>

      <!-- <el-input
      v-model="selectedFilters.assetName"
      placeholder="검색어를 입력해주세요"
      class="search-input"
      @keyup.enter="refreshTable"
    >
      <template #append>
        <el-button :icon="Search" @click="refreshTable" />
      </template>
    </el-input> -->
    </div>

    <ReservationFilters @change="handleFilterChange" />

    <!-- 예약 목록 -->
    <ReservationTable
      :rows="tableData"
      :filters="selectedFilters"
      :key="tableKey"
      @open-detail="openDetailModal"
    />

    <ReservationDetailModal
      v-model:visible="modalOpen"
      :asset="reservationDetail"
      @close="closeModal"
      @save-reason="updateReason"
      @approve="onApprove"
      @reject="onReject" 
    /><!-- 부모에서 emit reason 처리-->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import api from "@/api/axios"

import ReservationTabs from '@/components/reservation/ReservationTab.vue'
import ReservationFilters from '@/components/reservation/ReservationFilter.vue'
import ReservationTable from '@/components/reservation/AppliedReservationTable.vue'
import ReservationDetailModal from '@/components/reservation/ReservationApplyDetailModal.vue'
import { Search } from '@element-plus/icons-vue'

const handleFilterChange = (filters) => {
  selectedFilters.value = { ...filters } // 필터 전체 반영
  selectedDate.value = filters.date // 날짜도 따로 필요하면 그대로
  refreshTable()
}
const selectedDate = ref(new Date().toISOString().split('T')[0])
// 테이블 갱신용 key
const tableKey = ref(0)
const refreshTable = () => {
  tableKey.value += 1
}

const selectedFilters = ref({
  date: selectedDate.value,
  assetName: "",       // 검색바 입력값 포함
  assetType: "",
  assetStatus: "",
  categoryName: "",
  layerZero: "",
  layerOne: "",
  page: 0,
  size: 10,
})

const tableData = ref([])
const total = ref(0)

const modalOpen = ref(false)
const reservationDetail = ref(null)
const currentUserName = ref('')

onMounted(async () => {
  selectedFilters.value.date = getKSTDateString()

  try {
    const res = await api.get('/users/me')
    currentUserName.value = res.data.userName
  } catch (e) {
    console.error('유저 정보 조회 실패:', e)
  }

  fetchAppliedReservations()
})

async function fetchAppliedReservations() {
  const params = buildParams()
  const res = await api.get('/reservations/pending', { params })

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
      usage: d.reservationStatus,
      description: d.description,
    }

    modalOpen.value = true
  } catch (err) {
    console.error('상세 조회 실패:', err)
  }
}

function closeModal() {
  modalOpen.value = false
  reservationDetail.value = null
}



const updateReason = ({ reservationId, reason }) => {
  console.log("부모에서 받은 reason:", reason, "reservationId:", reservationId)
  tableData.value = tableData.value.map(r =>
    r.id === reservationId ? { ...r, reason } : r
  )
}


// 부모 컴포넌트
async function onApprove(payload) {
  try {
    await api.patch(`/reservations/${payload.reservationId}/approve`, {
      version: payload.version,
      approverName: currentUserName.value,
      reason: payload.reason // 모달에서 입력한 reason
    })

    fetchAppliedReservations() // 갱신
  } catch (err) {
    console.error('승인 실패:', err)
  }
}

async function onReject(payload) {
  try {
    await api.patch(`/reservations/${payload.reservationId}/reject`, {
      version: payload.version,
      approverName: currentUserName.value,
      reason: payload.reason
    })

    fetchAppliedReservations()
  } catch (err) {
    console.error('거절 실패:', err)
  }
}


function getKSTDateString() {
  const offset = 9 * 60 * 60 * 1000
  const kst = new Date(Date.now() + offset)
  return kst.toISOString().slice(0, 10)
}
function buildParams() {
  const params = {}
  Object.entries(selectedFilters.value).forEach(([key, value]) => {
    params[key] = value === '' ? null : value
  })
  return params
}

onMounted(async () => {
  searchParams.value.date = getKSTDateString()

  try {
    const res = await api.get('/users/me')
    currentUserName.value = res.data.userName
  } catch (e) {
    console.error('유저 정보 조회 실패:', e)
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

.tabs-full-row {
  margin-bottom: 15px;
}
</style>
