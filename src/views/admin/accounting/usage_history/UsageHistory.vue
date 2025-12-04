<template>
  <div class="usage-history-page">

    <h2 class="page-title">자원 사용 기록</h2>

    <!-- 검색 필터 -->
    <UsageHistoryFilter @search="loadData" />

    <!-- 테이블 + 페이징 -->
    <UsageHistoryTable
      :rows="rows"
      :loading="loading"
      :pageInfo="pageInfo"
      @changePage="changePage"
    />

  </div>
</template>

<script setup>
import { ref } from "vue"
import UsageHistoryFilter from "./UsageHistoryFilter.vue"
import UsageHistoryTable from "./UsageHistoryTable.vue"
import api from "@/api/axios.js"

const rows = ref([])
const loading = ref(false)

const pageInfo = ref({
  page: 0,
  size: 10,
  totalPages: 0,
})

// 🔥 마지막 검색조건 저장
let lastFilter = {
  startDate: null,
  endDate: null,
  keyword: null
}

// 🔥 UsageHistoryFilter 가 보내준 값 저장
async function loadData(filter) {
  lastFilter = filter  // ⭐ 새로운 필터값 저장
  await fetchData(0)   // 첫 페이지부터 다시 조회
}

// 🔥 서버에서 데이터 조회
async function fetchData(page) {
  loading.value = true

  try {
    const res = await api.get("/accounting/usage-history", {
      params: {
        startDate: lastFilter.startDate,
        endDate: lastFilter.endDate,
        keyword: lastFilter.keyword,
        page,
        size: pageInfo.value.size,
      }
    })

    rows.value = res.data.content

    pageInfo.value = {
      page: res.data.page,
      size: res.data.size,
      totalPages: res.data.totalPages,
    }

  } catch (err) {
    console.error("조회 실패", err)
  }

  loading.value = false
}

// 🔥 페이지 클릭 시 실행
function changePage(newPage) {
  fetchData(newPage)
}

// 🔥 초기 1회 조회
fetchData(0)
</script>

<style scoped>
.usage-history-page {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}
</style>
