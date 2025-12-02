<template>
  <div class="usage-trend-page">

    <h2 class="page-title">사용 추이</h2>

    <!-- 필터 -->
    <div class="filters">

      <!-- baseYear 선택 -->
      <select v-model="selectedBaseYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- compareYear 선택 -->
      <select v-model="selectedCompareYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- 검색창 = assetName -->
      <div class="search-box">
        <input
          type="text"
          placeholder="검색어를 입력해주세요"
          v-model="assetName"
          @keyup.enter="loadData"
        />
        <i class="ri-search-line" style="cursor:pointer" @click="loadData"></i>
      </div>
    </div>

    <!-- 본문 -->
    <div class="content-wrapper">

      <!-- 차트 박스 -->
      <div class="chart-box">
        <div class="chart-header">
          <span>{{ dataAssetName }}</span>
        </div>

        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          style="width:100%; height:360px;"
        />
      </div>

      <!-- 오른쪽 카드 -->
      <div class="right-cards">

        <div class="info-card">
          <h3>{{ summary.usageRateIncrease }}%</h3>
          <p>{{ selectedBaseYear }}년 대비 {{ selectedCompareYear }}년<br/>사용 증가율</p>
        </div>

        <div class="info-card">
          <h3>{{ summary.actualUsageIncrease }}%</h3>
          <p>{{ selectedBaseYear }}년 대비 {{ selectedCompareYear }}년<br/>실 사용률 증가율</p>
        </div>

        <div class="info-card">
          <h3>{{ summary.resourceUtilizationIncrease }}%</h3>
          <p>{{ selectedBaseYear }}년 대비 {{ selectedCompareYear }}년<br/>월별 트렌드 증가율</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api/axios"

// ---------------------
// UI State
// ---------------------
const yearList = [2023, 2024, 2025, 2026]

const selectedBaseYear = ref(2023)
const selectedCompareYear = ref(2024)
const assetName = ref("")

// ---------------------
const dataAssetName = ref("")
const summary = ref({})
const chartData = ref({})
const chartOptions = ref({})

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    const { data } = await api.get("/accounting/usage-history/trend", {
      params: {
        baseYear: selectedBaseYear.value,
        compareYear: selectedCompareYear.value,
        assetName: assetName.value
      }
    })

    // 데이터 반영
    dataAssetName.value = data.asset.assetName
    summary.value = data.summary

    const labels = data.monthlyData.map(m => `${m.month}월`)
    const baseValues = data.monthlyData.map(m => m.baseYearUsageRate)
    const compareValues = data.monthlyData.map(m => m.compareYearUsageRate)

    // 꺾은선 그래프
    chartData.value = {
      labels,
      datasets: [
        {
          label: selectedBaseYear.value,
          data: baseValues,
          borderColor: "#E6A500",
          backgroundColor: "rgba(230,165,0,0.2)",
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: "#E6A500",
          pointBorderColor: "#E6A500",
          tension: 0
        },
        {
          label: selectedCompareYear.value,
          data: compareValues,
          borderColor: "#00A950",
          backgroundColor: "rgba(0,169,80,0.2)",
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: "#00A950",
          pointBorderColor: "#00A950",
          tension: 0
        }
      ]
    }

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 }
        }
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: false,   // 박스 대신 선을 사용
            boxWidth: 40,
            boxHeight: 0,
            color: '#333'
          }
        }
      }
    }

  } catch (err) {
    console.error("API 오류:", err)
  }
}
</script>

<style scoped>
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

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
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
</style>
