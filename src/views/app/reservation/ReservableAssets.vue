<template>
  <div class="header-row">
    <h2>예약 가능 자원 조회</h2>

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
  <ReservationTabs />
  <ReservationFilters />
  <ReservationTable />
</template>

<script setup>
import ReservationTabs from './component/ReservationTab.vue'
import ReservationFilters from './component/ReservationFilter.vue'
import ReservationTable from './component/ReservableAssetsTable.vue'
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
