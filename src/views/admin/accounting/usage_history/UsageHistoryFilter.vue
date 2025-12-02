<template>
  <div class="filter-box">

    <!-- 날짜 범위 선택 -->
    <DatePicker
      v-model="dateRange"
      selectionMode="range"
      highlightOnSelect
      showIcon
      iconDisplay="input"
      dateFormat="yy-mm-dd"
      class="dater"
      placeholder="날짜 범위를 선택하세요"
    />

    <!-- 검색창 -->
    <span class="search-box">
      <InputText
        v-model="keyword"
        placeholder="자원명을 입력하세요"
        class="keyword"
      />
    </span>

    <!-- 검색 버튼 -->
    <Button
      label="검색"
      class="p-button-success search-btn"
      @click="emitSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// 부모에게 전달
const emit = defineEmits(['search'])

const dateRange = ref(null)
const keyword = ref('')

/* 🔥 서버가 LocalDate로 받기 때문에 yyyy-MM-dd 로 변환해야 함 */
function formatDate(date) {
  if (!date) return null
  return date.toISOString().split("T")[0]  // "2025-12-04"
}

function emitSearch() {
  emit('search', {
    startDate: dateRange.value ? formatDate(dateRange.value[0]) : null,
    endDate: dateRange.value ? formatDate(dateRange.value[1]) : null,
    keyword: keyword.value
  })
}
</script>

<style scoped>
.filter-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

/* DatePicker width */
.dater {
  width: 270px;
  font-size: 14px;      /* 입력창 글씨 크기도 줄이기 가능 */
  padding: 4px 5px;     /* 내부 패딩 줄이기 */
}
/* 검색창 오른쪽 정렬 */
.search-box {
  margin-left: auto;
}

/* 검색 인풋 width */
.keyword {
  width: 250px;
}

/* 버튼 스타일 */
.search-btn {
  padding: 6px 14px;
}
</style>
