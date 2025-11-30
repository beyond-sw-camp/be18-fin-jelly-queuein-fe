<template>
  <el-row :gutter="12" class="filter-row">

    <!-- 날짜 선택 -->
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
      <el-select
        v-model="filters.assetType"
        placeholder="자원 유형"
        @change="emitChange"
      >
        <el-option label="정적(고정)" value="STATIC" />
        <el-option label="동적(이동)" value="DYNAMIC" />
      </el-select>
    </el-col>

    <!-- 자원 상태 -->
    <el-col :span="4">
      <el-select
        v-model="filters.assetStatus"
        placeholder="자원 상태"
        @change="emitChange"
      >
        <el-option label="사용 가능" value="AVAILABLE" />
        <el-option label="사용 불가" value="UNAVAILABLE" />
        <el-option label="점검 중" value="MAINTENANCE" />
      </el-select>
    </el-col>

    <!-- 카테고리 -->
    <el-col :span="4">
      <el-select
        v-model="filters.categoryName"
        placeholder="카테고리"
        @change="emitChange"
      >
        <el-option
          v-for="c in categories"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>
    </el-col>

    <!-- 0계층 -->
    <el-col :span="4">
      <el-select
        v-model="filters.layerZero"
        placeholder="0계층 선택"
        @change="emitChange"
      >
        <el-option
          v-for="l in layerZeroList"
          :key="l"
          :label="l"
          :value="l"
        />
      </el-select>
    </el-col>

    <!-- 1계층 -->
    <el-col :span="4">
      <el-select
        v-model="filters.layerOne"
        placeholder="1계층 선택"
        @change="emitChange"
      >
        <el-option
          v-for="l in layerOneList"
          :key="l"
          :label="l"
          :value="l"
        />
      </el-select>
    </el-col>

  </el-row>
</template>

<script setup>
import { ref, watch } from "vue"

// 부모에게 필터 변경 emit
const emit = defineEmits(["change"])
const today = new Date().toLocaleDateString('en-CA')
/* 필터 값 */
const filters = ref({
  date: today,
  assetType: "",
  assetStatus: "",
  categoryName: "",
  layerZero: "",
  layerOne: ""
})

/* 실제 카테고리 & 계층은 API로 받을 가능성 있지만,
   지금은 더미 데이터 유지 */
const categories = ref(["사옥", "스튜디오", "카메라", "음향"])
const layerZeroList = ref(["본사", "지점", "외부"])
const layerOneList = ref(["1F", "2F", "3F", "A동", "B동"])



watch(
  () => filters.value.date,
  () => {
    emit("change", { ...filters.value })
  },
  { immediate: true } // ← 이 옵션이 매우 중요함!!
)

</script>

<style scoped>
.filter-row {
  margin: 20px 0;
}
</style>
