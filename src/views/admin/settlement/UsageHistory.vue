<template>
  <div class="usage-history-page">

    <h2 class="page-title">자원 사용 기록</h2>

    <!-- 검색 필터 -->
    <UsageHistoryFilter @search="loadData" />

    <!-- 테이블 -->
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
import api from "@/api/axios"

const rows = ref([])
const loading = ref(false)

const pageInfo = ref({
  page: 0,
  size: 20,
  totalPages: 0,
})

let lastFilter = {} // 마지막 검색 조건 저장

async function loadData(filter) {
  lastFilter = filter // 저장 (페이징 이동 때 사용)
  await fetchData(0)  // 항상 첫 페이지부터 검색
}

async function fetchData(page) {
  loading.value = true

  try {
    const res = await api.get("/api/v1/accounting/usage-history", {
      params: {
        ...lastFilter,
        page,
        size: 20,
      },
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

function changePage(newPage) {
  fetchData(newPage)
}

// 최초 로드 시 전체 조회
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
