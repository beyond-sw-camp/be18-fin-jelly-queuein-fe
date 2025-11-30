<template>
  <div class="time-bar-wrapper">
    <!-- 시간 라벨 -->
    <div class="time-labels">
      <div class="label">시간</div>
      <div 
        v-for="h in hours" 
        :key="h"
        class="hour-label"
      >
        {{ h }}
      </div>
    </div>

    <div class="divider"></div>

    <!-- 시간 블록 -->
    <div class="time-blocks">
      <div class="label">예약 현황</div>

      <div
        v-for="(block, idx) in blocks"
        :key="idx"
        class="block"
        :class="{
          available: block.type === 'available',
          reserved: block.type === 'reserved',
          selected: selected.includes(idx)
        }"
        @click="toggleHour(idx)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

interface Block {
  label: string
  type: 'reserved' | 'available'
  start: number
  end: number
}

const props = defineProps<{
  blocks: Block[]
  modelValue?: number[]
}>()

const emit = defineEmits(['update:modelValue'])

const hours = Array.from({ length: 24 }, (_, i) => i)

const selected = ref<number[]>([...(props.modelValue || [])])

// v-model 동기화
watch(() => props.modelValue, val => {
  selected.value = [...(val || [])]
})

const toggleHour = (idx: number) => {
  const block = props.blocks[idx]

  // 예약 불가 구간 클릭 → 무시
  if (block.type === 'reserved') return

  // 이미 선택된 구간 → 제거
  if (selected.value.includes(idx)) {
    selected.value = selected.value.filter(v => v !== idx)
    emit('update:modelValue', selected.value)
    return
  }

  // 아무것도 없으면 처음 선택
  if (selected.value.length === 0) {
    selected.value.push(idx)
  } else {
    const min = Math.min(...selected.value)
    const max = Math.max(...selected.value)

    // 연속 확장
    if (idx === min - 1) selected.value.unshift(idx)
    else if (idx === max + 1) selected.value.push(idx)
    else selected.value = [idx] // 비연속 → 새로 시작
  }

  emit('update:modelValue', selected.value)
}
</script>

<style scoped>
.time-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-labels,
.time-blocks {
  display: flex;
  align-items: center;
}

.label {
  width: 70px;
  font-weight: 600;
  background: #cfe3ca;
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  margin-right: 4px;
}

.hour-label,
.block {
  flex: 1;
  height: 24px;
  margin-right: 2px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.block {
  cursor: pointer;
  background: #e6f0e6;
}

.block.reserved {
  background: #ccc;
  cursor: not-allowed;
}

.block.available {
  background: #e6f0e6;
}

.block.selected {
  background: #b6ceb4 !important;
}

.divider {
  width: 100%;
  border-bottom: 4px solid #eaeaea;
  margin: 6px 0 16px 0;
}
</style>
