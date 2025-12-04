<template>
  <select class="dropdown" :value="modelValue" @change="updateValue">
    <option value="">{{ placeholder }}</option>

    <option v-for="b in buildings" :key="b.assetId" :value="b.assetId">
      {{ b.name }}
    </option>
  </select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

// props
const props = defineProps({
  modelValue: [String, Number],
  placeholder: { type: String, default: '사옥 선택' },
})

const emit = defineEmits(['update:modelValue'])

const buildings = ref([])

async function loadBuildings() {
  const res = await api.get('/assets/roots')
  buildings.value = res.data
}

function updateValue(e) {
  emit('update:modelValue', e.target.value)
}

onMounted(loadBuildings)
</script>

<style scoped>
.dropdown {
  width: 180px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}
</style>
