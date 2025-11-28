<template>
  
  <div class="timeline">

    <div class="row">
      <div class="row-label">시간</div>
      <div class="hours">
        <div v-for="h in 24" :key="h" class="hour-number">
          {{ h }}
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="row">
      <div class="row-label">예약 현황</div>

      <div
        class="slots"
        @mousedown="startDrag"
        @mousemove="duringDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <div
          v-for="(slot, i) in 24"
          :key="i"
          class="slot"
          :class="{
            reserved: isReserved(i + 1),
            selected: selectedRange.includes(i + 1)
          }"
          @click.stop="handleClick(i + 1)"
        ></div>
      </div>
    </div>

    <div class="divider"></div>

  </div>
</template>
<script setup>
import { ref } from "vue";

const emit = defineEmits(["select-time"]);

const reserved = ref([
  { start: 2, end: 8 },
  { start: 20, end: 22 }
]);

const selectedRange = ref([]);

let isDragging = false;
let dragStart = null;
let moved = false;

const isReserved = (hour) =>
  reserved.value.some((r) => hour >= r.start && hour <= r.end);

const startDrag = (e) => {
  isDragging = true;
  moved = false;

  const index = getIndex(e);
  if (!index || isReserved(index)) return;
  dragStart = index;
};

const duringDrag = (e) => {
  if (!isDragging || dragStart === null) return;

  moved = true;
  const index = getIndex(e);
  if (!index || isReserved(index)) return;

  const start = Math.min(dragStart, index);
  const end = Math.max(dragStart, index);

  for (let h = start; h <= end; h++) if (isReserved(h)) return;

  selectedRange.value = [];
  for (let h = start; h <= end; h++) selectedRange.value.push(h);
};

const endDrag = () => {
  if (isDragging && moved && selectedRange.value.length > 0) {
    const start = selectedRange.value[0];
    const end = selectedRange.value[selectedRange.value.length - 1] + 1; // end는 종료시간이므로 +1
    emit("select-time", { start, end });
  }
  isDragging = false;
  dragStart = null;
};

const handleClick = (index) => {
  if (moved) return;
  if (isReserved(index)) return;

  if (selectedRange.value.includes(index)) {
    selectedRange.value = [];
    emit("select-time", { start: null, end: null });
    return;
  }

  selectedRange.value = [index];
  emit("select-time", { start: index, end: index + 1 });
};

const getIndex = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  return Math.min(24, Math.max(1, Math.floor(x / (rect.width / 24)) + 1));
};
</script>

<style scoped>
.timeline {
  width: 100%;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.row-label {
  width: 90px;
  background: #c7dbbf;
  padding: 10px 0;
  text-align: center;
  font-weight: 600;
  border-radius: 4px;
  margin-right: 12px;
}

.hours {
  flex: 1;
  display: flex;
  justify-content: space-between;
  color: #a4ba9f;
  font-size: 14px;
  padding-right: 8px;
}

.hour-number {
  width: calc(100% / 24);
  text-align: center;
}

/* 슬롯 */
.slots {
  flex: 1;
  display: flex;
  height: 26px;
  user-select: none;
  gap: 6px; /* 🔥 원하는 간격으로 조절 */
}
.slot {
  flex: 1;
  background: #e7f0e2;
  border-radius: 4px; /* 네모! */
  cursor: pointer;
  transition: background 0.15s;
}

.slot.selected {
  background: #b5d4ad;
}

.slot.reserved {
  background: #bfbfbf !important;
  cursor: not-allowed;
}

.divider {
  width: 100%;
  border-bottom: 8px solid #eaeaea;
  transform: scaleY(0.5);
  margin: 7px 0;
}

</style>
