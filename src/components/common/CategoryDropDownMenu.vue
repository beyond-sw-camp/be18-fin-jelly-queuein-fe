<template>
  <div class="dropdown-wrapper">
    <select class="dropdown" :value="modelValue" @change="onChange">
      <option value="">카테고리 선택</option>

      <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
        {{ c.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi } from '@/api/categoryApi'

// props: v-model 대응
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

// emits: v-model 업데이트
const emit = defineEmits(['update:modelValue'])

const categories = ref([])

// 사용자 선택 시
function onChange(e) {
  emit('update:modelValue', e.target.value)
}

// 드롭다운 카테고리 로드
async function loadCategories() {
  const res = await categoryApi.getDropdown()
  categories.value = res.data
}

onMounted(loadCategories)
</script>

<style scoped>
.dropdown-wrapper {
  width: 100%;
}

.dropdown {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}
</style>
