<template>
  <div class="usage-trend-page">

    <h2 class="page-title">운영 성과 분석</h2>

    <!-- 🔹오른쪽 상단 버튼 -->
    <button class="target-btn" @click="openTargetModal">
      {{ hasTarget ? "사용률 조회" : "사용률 등록" }}
    </button>

    <!-- 필터 -->
    <div class="filters">

      <select v-model="selectedBaseYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

      <select v-model="selectedCompareYear" @change="loadData">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}</option>
      </select>

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

      <div class="chart-box">
        <div class="chart-header">
          <span>{{ assetTitle }}</span>
        </div>

        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          style="width: 100%; height: 360px;"
        />
      </div>

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

    <!-- ============================= -->
    <!-- 사용률 등록 모달 -->
    <!-- ============================= -->
    <div v-if="showRegisterModal" class="modal-backdrop" @click="closeRegisterModal"></div>
    <div v-if="showRegisterModal" class="modal-box">
      <h3>{{ currentYear }} 목표 사용률</h3>

      <input
        type="number"
        v-model="registerRate"
        placeholder="예: 85"
        class="input-box"
      />

      <button class="confirm-btn" @click="registerTarget">
        등록
      </button>
    </div>

    <!-- ============================= -->
    <!-- 사용률 조회 모달 -->
    <!-- ============================= -->
    <div v-if="showViewModal" class="modal-backdrop" @click="closeViewModal"></div>
    <div v-if="showViewModal" class="modal-box">
      <h3>목표 사용률</h3>

      <p style="font-size: 20px; margin-top: 10px;">
        {{ currentYear }}년 → <b>{{ (targetRate * 100).toFixed(0) }}%</b>
      </p>

      <button class="confirm-btn" @click="closeViewModal">
        확인
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api/axios"

/* =======================
      상태
======================= */
const yearList = [2021, 2022, 2023, 2024, 2025, 2026]
const selectedBaseYear = ref(2024)
const selectedCompareYear = ref(2025)
const assetName = ref("")
const assetTitle = ref("전체")

const summary = ref({})
const chartData = ref({})
const chartOptions = ref({})

/* 에러 모달 */
const showErrorModal = ref(false)
const errorMessage = ref("")
function closeErrorModal() { showErrorModal.value = false }

/* =======================
      사용률 등록 상태
======================= */
const currentYear = new Date().getFullYear()
const hasTarget = ref(false)   // 등록 여부
const targetRate = ref(0)

const showRegisterModal = ref(false)
const showViewModal = ref(false)
const registerRate = ref("")   // 사용자가 입력한 값

/* =======================
      초기 로드
======================= */
onMounted(() => {
  loadData()
  loadTargetRate()
})

/* =======================
   KPI 데이터
======================= */
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
        { label: selectedBaseYear.value, backgroundColor: "#8B5401", data: base },
        { label: selectedCompareYear.value, backgroundColor: "#00A950", data: compare }
      ]
    }

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { ticks: { callback: v => (v / 10000).toLocaleString() + "만" } }
      }
    }

  } catch (e) {
    console.error("API 오류:", e)
    errorMessage.value = "등록되지 않은 자원입니다."
    showErrorModal.value = true
  }
}

/* =======================
   목표 사용률 조회
======================= */
async function loadTargetRate() {
  try {
    const { data } = await api.get("/accounting/usage-targets")

    if (data?.targetRate !== undefined) {
      hasTarget.value = true
      targetRate.value = data.targetRate
    }
  } catch (e) {
    hasTarget.value = false
  }
}

/* =======================
    버튼 클릭 시 모달 결정
======================= */
function openTargetModal() {
  if (hasTarget.value) showViewModal.value = true
  else showRegisterModal.value = true
}

/* =======================
    사용률 등록 POST
======================= */
async function registerTarget() {
  if (!registerRate.value) return

  try {
    await api.post("/accounting/usage-targets", {
      targetRate: Number(registerRate.value) / 100
    })

    hasTarget.value = true
    targetRate.value = Number(registerRate.value) / 100

    showRegisterModal.value = false
  } catch (e) {
    console.error("등록 실패:", e)
  }
}

function closeRegisterModal() { showRegisterModal.value = false }
function closeViewModal() { showViewModal.value = false }

/* =======================
    금액 표시 변환
======================= */
function formatMoney(v) {
  if (v === undefined || v === null) return "-"
  return (v / 10000).toLocaleString() + " 만원"
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

/* 🔹 상단 버튼 */
.target-btn {
  position: absolute;
  right: 40px;
  top: 130px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

/* 필터 */
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

/* 본문 */
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

/* 모달 공통 */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.35);
  z-index: 998;
}

.modal-box {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 26px;
  width: 320px;
  border-radius: 12px;
  text-align: center;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.input-box {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.confirm-btn {
  margin-top: 20px;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: #00A950;
  color: white;
  cursor: pointer;
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
