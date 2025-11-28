<template>
  <div class="calendar-top">
    <!-- 날짜 선택 -->
    <el-date-picker
      v-model="selectedDate"
      type="date"
      format="YYYY.MM.DD"
      value-format="YYYY-MM-DD"
      @change="onDateChange"
      class="date-picker"
    />

    <!-- 월별/주별 버튼 -->
    <div class="calendar-toggle">
      <button 
        @click="changeView('dayGridMonth')" 
        :class="{ active: currentView === 'dayGridMonth' }"
      >월별</button>

      <button 
        @click="changeView('timeGridWeek')" 
        :class="{ active: currentView === 'timeGridWeek' }"
      >주별</button>
    </div>
  </div>

  <div class="calendar-wrapper">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

const calendarRef = ref(null)
const selectedDate = ref('2025-10-20')
const currentView = ref('dayGridMonth')

const onDateChange = (newDate) => {
  const api = calendarRef.value.getApi()
  api.gotoDate(newDate) // FullCalendar 날짜 이동
}

const changeView = (view) => {
  const api = calendarRef.value.getApi()
  api.changeView(view)
  currentView.value = view
  api.gotoDate(selectedDate.value) // 뷰 전환 시 날짜도 유지
}

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: false,
  contentHeight: 650,
  displayEventTime: false,
  events: []
}
</script>

<style>
.calendar-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.date-picker {
  width: 160px;
}

/* 월별/주별 버튼 스타일 */
.calendar-toggle {
  display: flex;
  gap: 8px;
}

.calendar-toggle button {
  padding: 8px 20px;
  border: 1.5px solid #dddddd;
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.calendar-toggle button.active {
  background: #B6CEB4;
  color: #000;
  border-color: #B6CEB4;
}

</style>