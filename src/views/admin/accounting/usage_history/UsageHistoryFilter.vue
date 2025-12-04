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

    <!-- 검색창 + 아이콘 -->
    <div class="search-container">
      <InputText
        v-model="keyword"
        placeholder="자원명을 입력해주세요"
        class="search-input"
        @keyup.enter="emitSearch"
      />
      <i class="ri-search-line search-icon" @click="emitSearch"></i>
    </div>

  </div>
</template>


<script setup>
import { ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const emit = defineEmits(['search'])

const dateRange = ref(null)
const keyword = ref('')

function formatDate(date) {
  if (!date) return null
  return date.toISOString().split("T")[0]
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
  font-size: 14px;
  padding: 4px 5px;
}

/* 오른쪽 검색창 컨테이너 */
.search-container {
  position: relative;
  width: 260px;
  margin-left: auto;
}

.search-input {
  width: 100%;
  padding-right: 32px; /* 아이콘 공간 확보 */
}

/* 검색 아이콘 오른쪽 정렬 */
.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #555;
  cursor: pointer;
}

</style>
