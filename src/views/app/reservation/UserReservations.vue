<template>
  <div>
    <!-- 헤더 -->
    <div class="header-row">
      <h2>사용자 예약 내용 조회</h2>
    </div>

    <!-- 날짜 필터 -->
    <ReservationFilters @change="handleFilterChange" />

    <!-- 예약 목록 테이블 -->
    <div>
      <el-table :data="rows" border style="width: 100%" @row-click="openRow" highlight-current-row>
        <!-- 선택 -->
        <el-table-column type="selection" width="48" />

        <!-- 기본 컬럼들 -->
        <el-table-column prop="assetName" label="자원명" width="130" align="center" />
        <el-table-column prop="assetType" label="자원 유형" width="110" align="center" />
        <el-table-column prop="categoryName" label="카테고리" width="110" align="center" />

        <!-- 자원 상태 -->
        <el-table-column label="자원 상태" width="120" align="center">
          <template #default="{ row }">
            <StatusTag :status="convertAssetStatus(row.assetStatus)" />
          </template>
        </el-table-column>

        <!-- 승인 여부 -->
        <el-table-column label="승인 여부" width="220" align="center">
          <template #default="{ row }">
            {{ row.isApproved ? '승인' : '미승인' }}
          </template>
        </el-table-column>

        <!-- 예약 시간 -->
        <el-table-column label="예약 시작/종료 시간" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.startAt) }} ~ {{ formatTime(row.endAt) }}
          </template>
        </el-table-column>

        <!-- 실제 시간 -->
        <el-table-column label="실제 시작/종료 시간" width="200" align="center">
          <template #default="{ row }">
            <span v-if="row.actualStartAt">
              {{ formatTime(row.actualStartAt) }} ~ {{ formatTime(row.actualEndAt) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 예약 상태 -->
        <el-table-column label="예약 상태" min-width="150" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.reservationStatus" />
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="changePage"
        />
      </div>
    </div>

    <!-- 상세 모달 -->
    <ReservationDetailModal
      v-model:visible="modalOpen"
      :asset="reservationDetail"
      @close="closeModal"
      @start="handleStart"
      @end="handleEnd"
      @cancel="handleCancel"
      @save-note="handleSaveNote"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onActivated, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

import ReservationFilters from '@/components/reservation/ReservationFilter.vue'
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal.vue'
import StatusTag from '@/components/reservation/ReservationStatus.vue'
import { reservationApi } from '@/api/reservationApi'

const route = useRoute()

// 기본 날짜 (오늘)
const selectedDate = ref(new Date().toISOString().split('T')[0])

// 필터 상태
const selectedFilters = ref({
  date: selectedDate.value,
  assetType: '',
  assetStatus: '',
  categoryId: '',
  layerZero: '',
  layerOne: '',
  assetName: '',
  keyword: '',
})

// 테이블 데이터
const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 모달 관련 상태
const modalOpen = ref(false)
const reservationDetail = ref(null)

// ----------------------------
// 시간 포맷터
// ----------------------------
const formatTime = (instant) => {
  if (!instant) return '-'

  const d = new Date(instant)
  if (isNaN(d.getTime())) return '-'

  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const convertAssetStatus = (status) => {
  if (!status) return '-'

  switch (status.toUpperCase()) {
    case 'AVAILABLE':
    case 'ASSET_AVAILABLE':
      return 'ASSET_AVAILABLE' // 이용 가능
    case 'UNAVAILABLE':
    case 'ASSET_UNAVAILABLE':
      return 'ASSET_UNAVAILABLE' // 이용 불가
    default:
      return status
  }
}

// ----------------------------
// API 호출
// ----------------------------
const fetchReservations = async () => {
  try {
    console.log('🔄 fetchReservations 호출됨', route.path)
    const params = {
      page: page.value - 1,
      size: pageSize.value,
      date: selectedFilters.value.date,
      assetType: selectedFilters.value.assetType || undefined,
      assetStatus: selectedFilters.value.assetStatus || undefined,
      categoryId: selectedFilters.value.categoryId || undefined,
      layerZero: selectedFilters.value.layerZero || undefined,
      layerOne: selectedFilters.value.layerOne || undefined,
      assetName: selectedFilters.value.assetName || undefined,
    }

    // 빈 값 제거
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    console.log('📤 API 요청 파라미터:', params)
    const res = await reservationApi.getUserReservations(params)
    console.log('📥 API 응답:', res?.data)

    rows.value = res?.data?.content ?? []
    total.value = res?.data?.totalElements ?? 0

    console.log('✅ 데이터 설정 완료 - rows:', rows.value.length, 'total:', total.value)
  } catch (err) {
    console.error('❌ 예약 조회 실패:', err)
    rows.value = []
    total.value = 0
  }
}

// ----------------------------
// Row 클릭 이벤트
// ----------------------------
const openRow = (row, column) => {
  if (!column || column.type === 'selection') return
  if (!row?.reservationId) return
  openDetailModal(row.reservationId)
}

// ----------------------------
// 필터 변경 핸들러
// ----------------------------
const handleFilterChange = (filters) => {
  selectedFilters.value = {
    ...selectedFilters.value,
    ...filters,
  }
  selectedDate.value = filters.date
  page.value = 1
  fetchReservations()
}

// ----------------------------
// 페이지 변경
// ----------------------------
const changePage = (newPage) => {
  page.value = newPage
  fetchReservations()
}

// ----------------------------
// 테이블 갱신
// ----------------------------
const refreshTable = () => {
  page.value = 1
  fetchReservations()
}

// ----------------------------
// 상세 조회 API 호출
// ----------------------------
const openDetailModal = async (reservationId) => {
  try {
    const res = await reservationApi.getReservationDetail(reservationId)
    const d = res.data

    reservationDetail.value = {
      id: d.reservationId,
      name: d.assetName,
      status: d.reservationStatus,
      usage: d.reservationStatus,
      isApproved: d.isApproved,
      reserver: d.applicantName,
      approver: d.respondentName,
      assetStatus: d.assetStatus,
      date: d.date,
      startAt: d.startAt,
      endAt: d.endAt,
      actualStartAt: d.actualStartAt,
      actualEndAt: d.actualEndAt,
      participants: d.attendants,
      reason: d.reason,
      note: d.description,
    }

    modalOpen.value = true
  } catch (err) {
    console.error('상세 조회 실패:', err)
  }
}

// ----------------------------
// 모달 액션 처리
// ----------------------------
const handleStart = async (id) => {
  try {
    await reservationApi.startUsing(id)
    modalOpen.value = false
    refreshTable()
  } catch (err) {
    console.error('사용 시작 실패:', err)
  }
}

const handleEnd = async (id) => {
  try {
    await reservationApi.endUsing(id)
    modalOpen.value = false
    refreshTable()
  } catch (err) {
    console.error('사용 종료 실패:', err)
  }
}

const handleCancel = async (id) => {
  try {
    await reservationApi.cancel(id)
    modalOpen.value = false
    refreshTable()
  } catch (err) {
    console.error('예약 취소 실패:', err)
  }
}

const handleSaveNote = async (note) => {
  if (!reservationDetail.value) return
  reservationDetail.value.note = note
  refreshTable()
}

const closeModal = () => {
  modalOpen.value = false
}

// ----------------------------
// 라우트 변경 감지하여 데이터 갱신
// ----------------------------
// 라우트 경로 변경 감지 (같은 경로로 이동해도 감지)
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    console.log('🔄 라우트 변경 감지:', oldPath, '->', newPath)
    if (newPath === '/app/reservations/me' || newPath.startsWith('/app/reservations/me')) {
      console.log('✅ 예약 현황 페이지로 이동 감지, 데이터 로드 시작')
      page.value = 1
      fetchReservations()
    }
  },
  { immediate: false },
)

// 라우트 업데이트 감지 (같은 라우트에서 파라미터만 변경될 때)
onBeforeRouteUpdate((to, from) => {
  console.log('🔄 onBeforeRouteUpdate:', from.path, '->', to.path)
  if (to.path === '/app/reservations/me') {
    page.value = 1
    nextTick(() => {
      fetchReservations()
    })
  }
})

// 라우트 전환 완료 이벤트 감지
const handleRouteTransitionComplete = (event) => {
  console.log('🎯 route-transition-complete 이벤트', event?.detail)
  const targetPath = event?.detail?.path || route.path
  if (targetPath === '/app/reservations/me') {
    console.log('✅ 예약 현황 페이지로 이동 감지 (이벤트), 데이터 로드 시작')
    page.value = 1
    fetchReservations()
  }
}

// 탭 변경 이벤트 감지 (같은 경로로 이동해도 감지)
const handleTabChanged = (event) => {
  console.log('🎯 reservation-tab-changed 이벤트 수신', event?.detail)
  const targetPath = event?.detail?.path
  if (targetPath === '/app/reservations/me') {
    console.log('✅ 예약 현황 탭 클릭 감지, 데이터 로드 시작')
    // 약간의 지연을 두어 컴포넌트가 완전히 마운트된 후 실행
    setTimeout(() => {
      page.value = 1
      fetchReservations()
    }, 150)
  }
}

// 필터 변경 감지
watch(
  () => selectedFilters.value,
  () => {
    page.value = 1
    fetchReservations()
  },
  { deep: true },
)

// 이벤트 리스너를 setup 단계에서 바로 등록 (컴포넌트 마운트 전에도 작동)
// 전역 이벤트 리스너로 등록하여 언마운트되어도 작동하도록
if (typeof window !== 'undefined') {
  console.log('📡 UserReservations setup - 이벤트 리스너 등록')
  // 기존 리스너가 있으면 제거 후 재등록 (중복 방지)
  window.removeEventListener('reservation-tab-changed', handleTabChanged)
  window.removeEventListener('route-transition-complete', handleRouteTransitionComplete)
  window.addEventListener('reservation-tab-changed', handleTabChanged)
  window.addEventListener('route-transition-complete', handleRouteTransitionComplete)
}

// 컴포넌트 마운트 시 초기 데이터 로드 (무조건 실행)
onMounted(() => {
  console.log('🚀 UserReservations onMounted', route.path)
  page.value = 1
  fetchReservations()
})

// keep-alive로 인한 재활성화 시에도 데이터 갱신 (무조건 실행)
onActivated(() => {
  console.log('🔄 UserReservations onActivated', route.path)
  page.value = 1
  fetchReservations()
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('route-transition-complete', handleRouteTransitionComplete)
  window.removeEventListener('reservation-tab-changed', handleTabChanged)
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 테이블 가로 스크롤(유령 scrollbar) 제거 */
.el-table__body-wrapper {
  overflow-x: hidden !important;
}

.el-table table {
  table-layout: fixed !important;
}

/* element-plus가 오른쪽에 자동으로 추가하는 여백 제거 */
.el-table__inner-wrapper {
  width: 100% !important;
}

/* 오른쪽 유령 여백 제거 */
:deep(.el-table__inner-wrapper) {
  width: 100% !important;
}

/* 가로 스크롤 강제 제거 */
:deep(.el-table__body-wrapper) {
  overflow-x: hidden !important;
}

/* 컬럼 width 계산 정확하게 */
:deep(.el-table table) {
  table-layout: fixed !important;
}

/* Element Plus가 자동으로 넣는 padding-right 제거 */
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  padding-right: 0 !important;
}

/* 임의로 붙는 scrollbar placeholder 제거 */
:deep(.el-table__footer-wrapper),
:deep(.el-table__append-wrapper) {
  padding-right: 0 !important;
}
</style>
