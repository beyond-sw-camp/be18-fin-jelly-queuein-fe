<template>
  <div class="header-row">
    <h2>예약 가능 자원 조회</h2>

    <el-input
      v-model="searchParams.assetName"
      placeholder="검색어를 입력해주세요"
      class="search-input"
      @keyup.enter="fetchReservableAssets"
    >
      <template #append>
        <el-button icon="Search" @click="fetchReservableAssets" />
      </template>
    </el-input>
  </div>
  <ReservationTabs
    @change="(type) => {
      searchParams.assetType = type
      fetchReservableAssets()
    }"
  />
  <ReservationFilters
    @change="(f) => {
      searchParams.categoryName = f.categoryName
      searchParams.assetStatus = f.assetStatus
      searchParams.layerZero = f.layerZero
      searchParams.layerOne = f.layerOne
      fetchReservableAssets()
    }"
  />


  <ReservationTable
    :rows="tableData"
    :total="total"
    @page-change="(p) => {
      searchParams.page = p
      fetchReservableAssets()
    }"
  />

</template>

<script setup>
import ReservationTabs from './component/ReservationTab.vue'
import ReservationFilters from './component/ReservationFilter.vue'
import ReservationTable from './component/ReservableAssetsTable.vue'
import { ref, onMounted } from 'vue'

import api from '@/api/axios'


const searchParams = ref({
  date: '',           // 반드시 yyyy-MM-dd 형태
  assetName: '',
  assetType: '',
  categoryName: '',
  assetStatus: '',
  layerZero: '',
  layerOne: '',
  page: 0,
  size: 10,
})

const tableData = ref([])
const total = ref(0)


async function fetchReservableAssets() {

  // 기존 params 생성 방식 대신, 빈 값 제거 처리
  const params = {
    date: searchParams.value.date,
    assetName: searchParams.value.assetName,
    assetType: searchParams.value.assetType,
    categoryName: searchParams.value.categoryName,
    assetStatus: searchParams.value.assetStatus,
    layerZero: searchParams.value.layerZero,
    layerOne: searchParams.value.layerOne,
    page: searchParams.value.page,
    size: searchParams.value.size
  }

  // 🔥 빈 문자열("")은 서버로 보내지 않도록 제거
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === undefined || params[key] === null) {
      delete params[key]
    }
  })

  const res = await api.get('/reservations/reservable-assets', { params })

  tableData.value = res.data.content
  total.value = res.data.totalElements

  console.log("응답:", res.data)
  console.log("컨텐츠:", res.data.content)
}



onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  searchParams.value.date = today
  fetchReservableAssets()
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

.reservation-view {
  padding: 20px 30px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 10px;
}
</style>
