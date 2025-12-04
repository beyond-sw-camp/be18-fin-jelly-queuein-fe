<template>
  <el-row :gutter="12" class="filter-row">

    <!-- 날짜 선택 (Element Plus 유지) -->
    <el-col :span="4">
      <el-date-picker
        v-model="filters.date"
        type="date"
        placeholder="날짜 선택"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="emitChange"
      />
    </el-col>

    <!-- 자원 유형 -->
    <el-col :span="4">
      <AssetTypeDropdown
        v-model="filters.assetType"
        placeholder="자원 유형"
        @update:modelValue="emitChange"
      />
    </el-col>

    <!-- 자원 상태 -->
    <el-col :span="4">
      <AssetStatusDropdown
        v-model="filters.assetStatus"
        placeholder="자원 상태"
        @update:modelValue="emitChange"
      />
    </el-col>

    <!-- 카테고리 -->
    <el-col :span="4">
      <CategoryDropdown
        v-model="filters.categoryName"
        placeholder="카테고리"
        @update:modelValue="emitChange"
      />
    </el-col>


    <!-- 1계층 (위치: 사옥 선택 시 활성화) -->
    <el-col :span="4">
      <LocationDropdown
        v-model="filters.layerOne"
        :buildingId="filters.layerZero"
        @update:modelValue="emitChange"
      />
    </el-col>

        <!-- 0계층 (사옥) -->
    <el-col :span="4">
      <BuildingDropdown
        v-model="filters.layerZero"
        @update:modelValue="onBuildingChange"
      />
    </el-col>

  </el-row>
</template>

<script setup>
import { ref, watch } from "vue"

import AssetTypeDropdown from "@/components/common/AssetTypeDropdown.vue"
import AssetStatusDropdown from "@/components/common/AssetStatusDropdown.vue"
import CategoryDropdown from "@/components/common/CategoryDropDownMenu.vue"
import BuildingDropdown from "@/components/common/OneDepthDropDownMenu.vue"
import LocationDropdown from "@/components/common/RootDropDownMenu.vue"

// 부모에게 필터 변경 emit
const emit = defineEmits(["change"])
const today = new Date().toLocaleDateString("en-CA")

const filters = ref({
  date: today,
  assetType: "",
  assetStatus: "",
  categoryName: "",
  layerZero: "",
  layerOne: ""
})

function emitChange() {
  emit("change", { ...filters.value })
}

// 건물(0계층) 변경 시 위치 초기화 + emit
function onBuildingChange(val) {
  filters.value.layerZero = val
  filters.value.layerOne = "" // 위치 초기화
  emitChange()
}

// 날짜는 초기 로드시 바로 emit
watch(
  () => filters.value.date,
  () => emitChange(),
  { immediate: true }
)
</script>

<style scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

/* 모든 el-col은 동일 크기로 강제 */
.filter-row > .el-col {
  flex: 1;
  min-width: 180px;
  box-sizing: border-box;
}

/* 내부 요소 모두 width 100% */
.filter-row :deep(.el-select),
.filter-row :deep(.el-date-editor),
.filter-row :deep(.el-input),
.filter-row :deep(.el-input__wrapper),
.filter-row :deep(.el-input__inner) {
  width: 100% !important;
  box-sizing: border-box;
}

/* 드롭다운 내부도 padding 균일하게 */
.filter-row :deep(.el-input__wrapper) {
  padding-left: 12px !important;
  padding-right: 12px !important;
}


/* 🔥 반응형: 화면이 좁아지면 3등분 */
@media (max-width: 1200px) {
  .filter-row > .el-col {
    flex: 1 1 calc(33.33% - 12px); /* 한 줄에 3개 */
  }
}

/* 🔥 더 좁아지면 2등분 */
@media (max-width: 900px) {
  .filter-row > .el-col {
    flex: 1 1 calc(50% - 12px); /* 한 줄에 2개 */
  }
}

/* 🔥 모바일: 1개씩 */
@media (max-width: 600px) {
  .filter-row > .el-col {
    flex: 1 1 100%; /* 한 줄에 하나 */
  }
}

</style>
