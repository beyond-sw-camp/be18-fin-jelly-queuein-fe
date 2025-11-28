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

  <!-- 탭을 전체 폭으로 확장시키는 wrapper -->
  <div class="tabs-full-row">
    <ReservationTabs />
  </div>

  <ReservationFilters />
  <ReservationTable />
</template>


<script setup>
import ReservationTabs from './component/ReservationTab.vue'
import ReservationFilters from './component/ReservationFilter.vue'
import ReservationTable from './component/UserReservationTable.vue'
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

.main-container {
  width: 70%;
}

.content {
  max-width: 820px;
  margin: 0 auto;
}

</style>
