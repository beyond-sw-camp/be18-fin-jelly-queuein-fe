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

    <!-- 0계층 (사옥) -->
    <el-col :span="4">
      <BuildingDropdown
        v-model="filters.layerZero"
        placeholder="0계층 선택"
        @update:modelValue="onBuildingChange"
      />
    </el-col>

    <!-- 1계층 (위치: 사옥 선택 시 활성화) -->
    <el-col :span="4">
      <LocationDropdown
        v-model="filters.layerOne"
        :buildingId="filters.layerZero"
        placeholder="1계층 선택"
        @update:modelValue="emitChange"
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
  margin: 20px 0;
}
</style>
