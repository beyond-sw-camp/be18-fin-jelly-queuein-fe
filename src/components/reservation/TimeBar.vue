<template>
  <div class="time-bar-wrapper">
    <div class="time-labels">
      <div class="label">시간</div>
      <div
        v-for="h in hours"
        :key="h"
        class="hour-label"
      >
        {{ h  }}
      </div>
    </div>

    <div class="divider"></div>

    <div class="time-blocks">
      <div class="label">예약 현황</div>
        <div
          v-for="h in 24"
          :key="h"
          class="block"
          :class="{
            available: blocks[h-1]?.type === 'available',
            reserved: blocks[h-1]?.type === 'reserved',
            selected: selected.includes(h-1),
            dragging: isDragging && isInDragRange(h-1)
          }"
          @mousedown="onMouseDown(h-1, $event)"
          @mouseenter="onMouseEnter(h-1)"
          @mouseup="onMouseUp"
          @click="onBlockClick(h-1, $event)"
        ></div>

    </div>
  </div>


</template>

<script setup>
import { ref, watch } from 'vue'

// 반드시 여기 있어야 template에서 인식됨
const hours = Array.from({ length: 24 }, (_, i) => i)

const props = defineProps({
  blocks: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])
const selected = ref([...(props.modelValue || [])])

// 부모가 v-model 업데이트하면 동기화
watch(() => props.modelValue, val => selected.value = [...(val || [])])

// 드래그 관련 상태
const isDragging = ref(false)
const dragStart = ref(null)
const dragEnd = ref(null)
const isClick = ref(true) // 클릭인지 드래그인지 구분

// 예약 블록인지 확인
const isReserved = (h) => {
  return props.blocks.some(b => b.type === 'reserved' && h >= b.start && h < b.end)
}

// 드래그 범위에 포함되는지 확인
const isInDragRange = (h) => {
  if (dragStart.value === null || dragEnd.value === null) return false
  const start = Math.min(dragStart.value, dragEnd.value)
  const end = Math.max(dragStart.value, dragEnd.value)
  return h >= start && h <= end
}

// 마우스 다운
const onMouseDown = (h, event) => {
  if (isReserved(h)) return
  
  event.stopPropagation()
  event.preventDefault()
  
  isDragging.value = true
  isClick.value = true
  dragStart.value = h
  dragEnd.value = h
  
  // 마우스가 블록 밖으로 나가도 계속 추적
  document.addEventListener('mousemove', onDocumentMouseMove)
  document.addEventListener('mouseup', onDocumentMouseUp)
}

// 문서 전체 마우스 이동 (드래그 중)
const onDocumentMouseMove = (event) => {
  if (!isDragging.value) return
  
  isClick.value = false // 드래그 중이면 클릭이 아님
  
  // 마우스 위치에 해당하는 블록 찾기
  const blocks = document.querySelectorAll('.time-blocks .block')
  let targetHour = null
  
  blocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect()
    if (event.clientX >= rect.left && event.clientX <= rect.right) {
      targetHour = index
    }
  })
  
  if (targetHour !== null && !isReserved(targetHour)) {
    dragEnd.value = targetHour
    updateSelectionFromDrag()
  }
}

// 문서 전체 마우스 업
const onDocumentMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    dragStart.value = null
    dragEnd.value = null
  }
  
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
}

// 블록 위에서 마우스 이동
const onMouseEnter = (h) => {
  if (isDragging.value && !isReserved(h)) {
    dragEnd.value = h
    updateSelectionFromDrag()
  }
}

// 블록 클릭 (드래그가 아닐 때만)
const onBlockClick = (h, event) => {
  event.stopPropagation()
  
  // 드래그가 끝난 후 클릭 이벤트가 발생하는 경우 무시
  if (!isClick.value) {
    isClick.value = true
    return
  }
  
  if (isReserved(h)) return
  
  // 단일 클릭: 토글
  if (selected.value.includes(h)) {
    selected.value = selected.value.filter(v => v !== h)
  } else {
    // 범위 선택 모드: 시작 시간과 끝 시간 클릭
    if (selected.value.length === 0) {
      // 첫 번째 클릭: 시작 시간
      selected.value = [h]
    } else {
      // 두 번째 클릭: 끝 시간 (범위 선택)
      const start = Math.min(...selected.value)
      const end = Math.max(...selected.value)
      
      if (h < start) {
        // 새로운 시작 시간이 더 작으면 범위 확장
        const range = []
        for (let i = h; i <= end; i++) {
          if (!isReserved(i)) range.push(i)
        }
        selected.value = range
      } else if (h > end) {
        // 새로운 끝 시간이 더 크면 범위 확장
        const range = []
        for (let i = start; i <= h; i++) {
          if (!isReserved(i)) range.push(i)
        }
        selected.value = range
      } else {
        // 범위 내 클릭: 해당 시간만 토글
        if (selected.value.includes(h)) {
          selected.value = selected.value.filter(v => v !== h)
        } else {
          selected.value.push(h)
          selected.value.sort((a, b) => a - b)
        }
      }
    }
  }
  
  emit('update:modelValue', selected.value)
}

// 드래그로 선택 업데이트
const updateSelectionFromDrag = () => {
  if (dragStart.value === null || dragEnd.value === null) return
  
  const start = Math.min(dragStart.value, dragEnd.value)
  const end = Math.max(dragStart.value, dragEnd.value)
  
  const range = []
  for (let i = start; i <= end; i++) {
    if (!isReserved(i)) {
      range.push(i)
    }
  }
  
  selected.value = range
  emit('update:modelValue', selected.value)
}

// 마우스 업
const onMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    dragStart.value = null
    dragEnd.value = null
  }
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
  width: 90px;
  font-weight: 600;
  background: #cfe3ca;
  padding: 14px;
  border-radius: 4px;
  text-align: center;
  margin-right: 4px;
}

.hour-label,
.block {
  flex: 1;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 2px;
  border-radius: 4px;
  font-size: 12px;
}

.block {
  cursor: pointer;
  background: #e6f0e6;
}

.block.reserved {
  background: #ccc;
  cursor: not-allowed;
}

.block.selected {
  background: #b6ceb4;
}

.block.dragging {
  background: #9bc497;
  opacity: 0.8;
}

.divider {
  width: 100%;
  border-bottom: 4px solid #eaeaea;
  margin: 6px 0 16px 0;
}
</style>
