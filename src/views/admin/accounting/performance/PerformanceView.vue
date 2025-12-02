<template>
  <div class="usage-trend-page">

    <h2 class="page-title">운영 성과 분석</h2>

    <!-- 필터 -->
    <div class="filters">

      <!-- baseYear -->
      <select v-model="selectedBaseYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- compareYear -->
      <select v-model="selectedCompareYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- 검색 -->
      <div class="search-box">
        <input
          type="text"
          v-model="assetName"
          placeholder="검색어를 입력해주세요"
          @keyup.enter="loadData"
        />
        <i class="ri-search-line" @click="loadData"></i>
      </div>

    </div>

    <!-- 본문 -->
    <div class="content-wrapper">

      <!-- 좌측 차트 -->
      <div class="chart-box">

        <div class="chart-header">
          <span>{{ assetTitle }}</span>
        </div>

        <!-- 막대 그래프 -->
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          style="width: 100%; height: 360px;"
        />
      </div>

      <!-- 우측 정보 카드 -->
      <div class="right-cards">

        <div class="info-card">
          <h3>{{ formatMoney(summary.baseYearTotalSaving) }}</h3>
          <p>{{ selectedBaseYear }}년 총 절감 금액</p>
        </div>

        <div class="info-card">
          <h3>{{ formatMoney(summary.compareYearCurrentSaving) }}</h3>
          <p>{{ selectedCompareYear }}년 총 절감 금액</p>
        </div>

        <div class="info-card">
          <h3>{{ formatMoney(summary.accumulatedSaving) }}</h3>
          <p>누적 절감 금액</p>
        </div>

      </div>

    </div>

    <!-- ============================= -->
    <!-- 에러 모달 -->
    <!-- ============================= -->
    <div v-if="showErrorModal" class="modal-backdrop" @click="closeErrorModal"></div>

    <div v-if="showErrorModal" class="modal-box">
      <p>{{ errorMessage }}</p>
      <button class="close-btn" @click="closeErrorModal">확인</button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api/axios"

const yearList = [2021, 2022, 2023, 2024, 2025, 2026]
const selectedBaseYear = ref(2024)
const selectedCompareYear = ref(2025)
const assetName = ref("")

const assetTitle = ref("전체")

const summary = ref({})
const chartData = ref({})
const chartOptions = ref({})

/* 에러 모달 상태 */
const showErrorModal = ref(false)
const errorMessage = ref("")

function closeErrorModal() {
  showErrorModal.value = false
}

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    const { data } = await api.get("/accounting/settlement/performance", {
      params: {
        baseYear: selectedBaseYear.value,
        compareYear: selectedCompareYear.value,
        assetName: assetName.value || null
      }
    })

    assetTitle.value = data.asset.assetName
    summary.value = data.summary

    const labels = data.monthlyData.map(m => `${m.month}월`)
    const base = data.monthlyData.map(m => m.baseYearSaving)
    const compare = data.monthlyData.map(m => m.compareYearSaving)

    chartData.value = {
      labels,
      datasets: [
        {
          label: selectedBaseYear.value,
          backgroundColor: "#8B5401",
          data: base,
          borderRadius: 4
        },
        {
          label: selectedCompareYear.value,
          backgroundColor: "#00A950",
          data: compare,
          borderRadius: 4
        }
      ]
    }

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: v => (v / 10000).toLocaleString() + "만",
          }
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }

  } catch (e) {
    console.error("API 오류:", e)

    // 잘못된 자원 검색 시
    errorMessage.value = "등록되지 않은 자원입니다."
    showErrorModal.value = true
  }
}

function formatMoney(v) {
  if (v === undefined || v === null) return "-"
  return (v / 10000).toLocaleString() + " 만원"
}
</script>

<style scoped>
/* --- 기존 사용 추이 화면 스타일 그대로 유지 --- */

.usage-trend-page {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filters select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.search-box input {
  border: none;
  outline: none;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.chart-box {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.right-cards {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: white;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.info-card h3 {
  font-size: 26px;
  color: #00A950;
  margin-bottom: 6px;
}

/* ==== 에러 모달 스타일 ==== */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.35);
  z-index: 999;
}

.modal-box {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 26px;
  width: 320px;
  border-radius: 10px;
  text-align: center;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.close-btn {
  margin-top: 18px;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: #00A950;
  color: white;
  cursor: pointer;
}
</style>
