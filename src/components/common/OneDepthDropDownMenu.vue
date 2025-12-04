<template>
  <select class="dropdown" :value="modelValue" @change="updateValue" :disabled="!buildingId">
    <option value="">{{ placeholder }}</option>

    <option v-for="l in locations" :key="l.assetId" :value="l.assetId">
      {{ l.name }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/api/axios'

// props
const props = defineProps({
  modelValue: [String, Number],
  buildingId: [String, Number], // 사옥 선택 값 필요
  placeholder: { type: String, default: '위치 선택' },
})

const emit = defineEmits(['update:modelValue'])

const locations = ref([])

async function loadLocations() {
  if (!props.buildingId) return
  const res = await api.get(`/assets/${props.buildingId}/one-depth`)
  locations.value = res.data
}

function updateValue(e) {
  emit('update:modelValue', e.target.value)
}

// buildingId 변경 시 위치 다시 로드
watch(() => props.buildingId, loadLocations)
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
