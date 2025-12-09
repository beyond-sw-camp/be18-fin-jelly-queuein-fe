<template>
  <div class="bg-white p-4 rounded shadow">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { reservationApi } from '@/api/reservationApi'

const events = ref([])

const currentDate = ref('2025-10-20')

async function fetchWeekReservations(start, end) {
  const res = await reservationApi.getWeeklyReservations({
    startDate: start,
    endDate: end
  })

  return res.data  // { reservations: [...] }
}

function convertWeeklyToEvents(data) {
  const list = []

  data.reservations.forEach(day => {
    day.reservations.forEach(r => {
      const utc = new Date(r.startAt)
      const local = new Date(utc.getTime() + 9 * 60 * 60 * 1000)

      list.push({
        id: r.reservationId,
        title: `${local.toTimeString().slice(0,5)} ${r.assetName}`,
        start: local,
        color: '#93c5fd'
      })
    })
  })

  return list
}
const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin, dayGridPlugin],
  initialView: 'timeGridWeek',
  allDaySlot: false,
  initialDate: currentDate.value,
  events,

  eventContent: (arg) => {
    const d = arg.event.start
    const time = d ? d.toTimeString().slice(0, 5) : ''

    return {
      html: `
        <div class="custom-event-chip">
          <span>${time} ${arg.event.title}</span>
        </div>
      `
    }
  },

  datesSet: async (info) => {
    const start = info.startStr
    const end = info.endStr.slice(0, 10)

    const json = await fetchWeekReservations(start, end)
    events.value = convertWeeklyToEvents(json)
  },

  headerToolbar: false,
})

</script>


<style>
/* 기본 파란 event 박스 제거 */
:deep(.fc-timegrid-event),
:deep(.fc-v-event),
:deep(.fc-timegrid-event-harness) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* event 내부 영역도 투명 처리 */
:deep(.fc-timegrid-event .fc-event-main) {
  background: transparent !important;
  padding: 0 !important;
}

/* custom chip 스타일 */
.custom-event-chip {
  background: #e6f0ff !important;
  color: #1677ff !important;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

/* 이벤트가 들어가는 전체 column 자체 배경 제거 */
:deep(.fc-timegrid-col-events) {
  background: transparent !important;
}

/* 이벤트 외부를 감싸는 harness 제거 */
:deep(.fc-timegrid-event-harness) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* inset harness 레이어도 제거 */
:deep(.fc-timegrid-event-harness-inset) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 기본 이벤트 박스 제거 */
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 이벤트 메인 콘텐츠 제거 */
:deep(.fc-event-main),
:deep(.fc-event-bg) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 드래그/resize/mirror 등 interaction 배경 제거 */
:deep(.fc-event.fc-mirror),
:deep(.fc-timegrid-selection) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

</style>
