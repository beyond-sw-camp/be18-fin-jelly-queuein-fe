<template>
  <div class="filter-box">
    <!-- 날짜 검색 -->
    <div class="date-range">
      <input type="date" v-model="startDate" />
      <span>~</span>
      <input type="date" v-model="endDate" />
    </div>

    <!-- 자원명 검색 -->
    <input
      v-model="keyword"
      placeholder="자원명을 입력하세요"
      class="keyword-input"
    />

    <!-- 검색 버튼 -->
    <button @click="emitSearch">검색</button>
  </div>
</template>

<script setup>
import { ref } from "vue"

const emit = defineEmits(["search"])

const startDate = ref("")
const endDate = ref("")
const keyword = ref("")

function emitSearch() {
  emit("search", {
    startDate: startDate.value,
    endDate: endDate.value,
    keyword: keyword.value,   // 🔥 서버 DTO 필드명과 동일
  })
}
</script>

<style scoped>
.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 5px;
}

.keyword-input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
