<template>
  <div class="tabs-full-row">
    <ReservationTabs
      @change="
        (type) => {
          selectedFilters.assetType = type
          refreshTable()
        }
      "
    />
  </div>

  <div class="header-row">
    <h2>예약 가능 자원 조회</h2>
  </div>

  <!-- 🔹 ReservationFilters 사용 + @change 핸들러 연결 -->
  <ReservationFilters @change="handleFilterChange" />

  <ReservationTable
    @select="openCreatePage"
    :rows="tableData"
    :total="total"
    :date="selectedFilters.date"
    @page-change="
      (p) => {
        selectedFilters.page = p
        refreshTable()
      }
    "
  />
</template>

<script setup>
import ReservationFilters from '@/components/reservation/ReservationFilter.vue'
import ReservationTable from '@/components/reservation/ReservableAssetsTable.vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import router from '@/router'
import api from '@/api/axios'

const today = new Date().toISOString().slice(0, 10)

// 🔹 UserReservation 방식: selectedFilters 사용
const selectedFilters = ref({
  date: today,
  assetName: '',
  assetType: '',
  categoryId: '',
  assetStatus: '',
  layerZero: '',
  layerOne: '',
  page: 0,
  size: 10,
})

const tableData = ref([])
const total = ref(0)

// 🔹 UserReservation 방식: handleFilterChange 정의
const handleFilterChange = (filters) => {
  selectedFilters.value = {
    ...selectedFilters.value,
    ...filters,
    page: 0, // 필터 변경 시에만 초기화
  }
  fetchReservableAssets()
}

// 🔹 UserReservation 방식: refreshTable 정의
const refreshTable = () => {
  fetchReservableAssets()
}

// API 호출
async function fetchReservableAssets() {
  try {
    // 날짜 필수 검사
    if (!selectedFilters.value.date) {
      ElMessage.warning('날짜를 선택해주세요.')
      return
    }

    const params = { ...selectedFilters.value }

    // 빈 값 제거
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    const res = await api.get('/reservations/reservable-assets', { params })

    if (res?.data) {
      tableData.value = res.data.content || []
      total.value = res.data.totalElements || 0
    } else {
      console.warn('응답 데이터 형식이 올바르지 않습니다.')
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('예약 가능 자원 조회 실패:', error)
    ElMessage.error('예약 가능 자원을 불러오는데 실패했습니다.')
    tableData.value = []
    total.value = 0
  }
}

// 예약 생성 페이지 이동
function openCreatePage(asset) {
  try {
    if (!asset || !asset.id) {
      ElMessage.warning('자원 정보가 올바르지 않습니다.')
      return
    }

    if (!selectedFilters.value.date) {
      ElMessage.warning('날짜를 선택해주세요.')
      return
    }

    router.push({
      path: `/app/reservations/create`,
      query: {
        assetId: asset.id,
        date: selectedFilters.value.date,
        assetName: asset.name || '',
      },
    })
  } catch (error) {
    console.error('페이지 이동 실패:', error)
    ElMessage.error('페이지 이동에 실패했습니다.')
  }
}

// 초기 로드 시 호출
onMounted(() => {
  refreshTable()
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.header-row h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.tabs-full-row {
  margin-bottom: 24px;
}
</style>
