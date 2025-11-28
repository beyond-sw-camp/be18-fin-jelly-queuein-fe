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
  contentHeight: 490,
  displayEventTime: false,

  events: [
    {
      title: '노트북',
      start: '2025-10-01T09:00:00',
      end: '2025-10-01T10:00:00'
    }
  ],

  eventContent: (arg) => {
    const d = arg.event.start;
    const time = d ? d.toTimeString().slice(0, 5) : '';

    return {
      html: `
        <div class="custom-event-chip">
          <span>${time} ${arg.event.title}</span>
        </div>
      `
    };
  }

}



</script>

<style>
.custom-event-chip {
  background: #e6f0ff;
  color: #1677ff;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
  font-weight: 600;
}

.calendar-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.date-picker {
  width: 195px !important;
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
.custom-event-chip {
  background: #e6f0ff !important;
  color: #1677ff !important;
}
.fc-daygrid-day-frame {
  min-height: 60px !important;
}

/* padding도 제거 (칩만 딱 붙게 하기 위해) */
:deep(.fc-timegrid-event .fc-event-main-frame) {
  padding: 0 !important;
}

/* 전체 클릭 영역이 투명해야 칩만 보임 */
:deep(.fc-timegrid-event .fc-event-main) {
  padding: 0 !important;
}


</style>