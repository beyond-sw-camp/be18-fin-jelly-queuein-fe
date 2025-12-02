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
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { reservationApi } from '@/api/reservationApi'

const calendarRef = ref(null)
const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(today)
const currentView = ref('dayGridMonth')


/* ---------------------------
   FullCalendar 옵션
---------------------------- */
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: false,
  contentHeight: 490,
  displayEventTime: false,
  events: [],

  eventOverlap: false,
  slotEventOverlap: false,
  eventMaxStack: 1,

  events: [],
  eventContent: (arg) => {
    const d = arg.event.start
    const time = d ? d.toTimeString().slice(0, 5) : ''

    const count = arg.event.extendedProps.count ?? 1 // 다중 이벤트면 count 전달한다고 가정

    return {
      html: `
        <div class="custom-event-chip">
          <span class="event-title">${time} ${arg.event.title}</span>
          ${count > 1 ? `<span class="event-badge">+${count - 1}</span>` : ""}
        </div>
      `
    }
  }

}

/* ---------------------------
   API 데이터 → FullCalendar event 변환
---------------------------- */
const convertReservationsToEvents = (data) => {
  const events = []

  data.reservations.forEach(day => {
    day.reservations.forEach(r => {
      const start = new Date(r.startAt)
      const localStart = new Date(start.getTime() + 9 * 60 * 60 * 1000)

      events.push({
        id: r.reservationId,
        title: r.assetName,
        start: localStart
      })
    })
  })

  return events
}

/* ---------------------------
   YYYY-MM-DD → YYYY-MM 변환
---------------------------- */
const getYearMonth = (dateStr) => dateStr.slice(0, 7)

/* ---------------------------
   API 호출하여 FullCalendar 갱신
---------------------------- */
const loadCalendarEvents = async () => {
  const yearMonth = getYearMonth(selectedDate.value)

  const res = await reservationApi.getMonthlyReservations(yearMonth)

  console.log("RAW AXIOS DATA:", res.data)

  const json =
    res.data.reservations
      ? res.data
      : res.data.data?.reservations
      ? res.data.data
      : res.data.result?.reservations
      ? res.data.result
      : null

  console.log("PARSED JSON:", json)

  const api = calendarRef.value.getApi()

  if (!json || !json.reservations) {
    console.warn("❗ reservations 데이터를 찾을 수 없습니다")
    api.removeAllEvents()
    return
  }

  const events = convertReservationsToEvents(json)
  console.log("EVENTS:", events)

  api.removeAllEvents()
  events.forEach(ev => api.addEvent(ev))
}

/* 날짜 변경 */
const onDateChange = async (newDate) => {
  const api = calendarRef.value.getApi()
  selectedDate.value = newDate
  api.gotoDate(newDate)
  await loadCalendarEvents()
}

/* 뷰 변경 */
const changeView = async (view) => {
  const api = calendarRef.value.getApi()
  currentView.value = view
  api.changeView(view)
  api.gotoDate(selectedDate.value)
  await loadCalendarEvents()
}

/* 최초 로딩 */
onMounted(() => {
  loadCalendarEvents()
})
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
  width: 195px !important;
}

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

/* 1) 기본 이벤트 배경 제거 */
:deep(.fc-event-bg),
:deep(.fc-event-main) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 2) timegrid 이벤트 기본 박스 제거 */
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 3) FullCalendar가 interaction layer로 넣는 파란 박스 제거 */
:deep(.fc-timegrid-event-harness-inset) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 4) selection / mirror 이벤트 제거 (클릭/드래그 시 생기는 파란색) */
:deep(.fc-event.fc-mirror),
:deep(.fc-timegrid-selection) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
/* 1) 기본 파란 테두리 제거 */
:deep(.fc-timegrid-event) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 2) 이벤트 내부 영역도 전부 제거 */
:deep(.fc-event-main),
:deep(.fc-event-bg) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 3) interaction / inset 레이어도 제거 */
:deep(.fc-timegrid-event-harness-inset) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 이벤트 전체 박스를 덮도록 */
.custom-event-chip {
  width: 100% !important;
  height: 100% !important;   /* ← 이게 핵심 */
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  box-sizing: border-box;
  border-radius: 6px;

  background: #e6f0ff; /* 네가 원하는 색 */
  color: #1677ff;
  font-weight: 600;
}
/* 기본 이벤트 배경(파란색) 완전히 투명하게 만들기 */
:deep(.fc-event-bg),
:deep(.fc-event-main),
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.custom-event-chip {
  position: relative;             /* badge 기준점 */
  width: 100%;
  height: 100%;
  background: #e6f0ff;
  border-radius: 6px;
  padding: 6px 12px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1677ff;
}

.event-title {
  flex: 1;
  white-space: nowrap;
}

/* 🎯 오른쪽 위에 작게 붙는 +3 뱃지 */
.event-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #d9d9d9;
  color: #333;
  
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1;
}


</style> 