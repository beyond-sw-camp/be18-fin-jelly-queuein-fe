<template>
  <div class="bg-white p-4 rounded shadow">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>

  <!-- 예약 상세 모달 -->
  <ReservationDetailModal
    :visible="modalOpen"
    :asset="reservationDetail"
    @close="closeModal"
    @start="handleStart"
    @end="handleEnd"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { reservationApi } from '@/api/reservationApi'
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal.vue'

const calendarRef = ref(null)
const events = ref([])

const currentDate = ref('2025-10-20')

// 모달 관련
const modalOpen = ref(false)
const reservationDetail = ref(null)

async function fetchWeekReservations(start, end) {
  // 백엔드 API는 date 파라미터만 받음 (시작 날짜)
  const res = await reservationApi.getWeeklyReservations(start)

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
    const start = info.startStr.slice(0, 10) // YYYY-MM-DD 형식

    const json = await fetchWeekReservations(start, start)
    events.value = convertWeeklyToEvents(json)
  },

  eventClick: (info) => {
    const reservationId = info.event.id
    if (reservationId) {
      openDetailModal(reservationId)
    }
  },

  headerToolbar: false,
})

/* ------------------------------------
   상세 조회 API 호출
------------------------------------ */
const openDetailModal = async (reservationId) => {
  try {
    const res = await reservationApi.getReservationDetail(reservationId)
    const d = res.data

    reservationDetail.value = {
      id: d.reservationId,
      name: d.assetName,
      status: d.reservationStatus,
      usage: d.reservationStatus,
      isApproved: d.isApproved,
      reserver: d.applicantName,
      approver: d.respondentName,
      assetStatus: d.assetStatus,
      date: d.date,

      startAt: d.startAt,
      endAt: d.endAt,
      actualStartAt: d.actualStartAt,
      actualEndAt: d.actualEndAt,

      participants: d.attendants,

      reason: d.reason,
      note: d.description,
    }

    modalOpen.value = true
  } catch (err) {
    console.error('상세 조회 실패:', err)
  }
}

/* ------------------------------------
   모달 액션 처리
------------------------------------ */
const handleStart = async (id) => {
  try {
    await reservationApi.startUsing(id)
    modalOpen.value = false
    // 캘린더 새로고침
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start, start)
      events.value = convertWeeklyToEvents(json)
    }
  } catch (err) {
    console.error('사용 시작 실패:', err)
  }
}

const handleEnd = async (id) => {
  try {
    await reservationApi.endUsing(id)
    modalOpen.value = false
    // 캘린더 새로고침
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start, start)
      events.value = convertWeeklyToEvents(json)
    }
  } catch (err) {
    console.error('사용 종료 실패:', err)
  }
}

const handleCancel = async (id) => {
  try {
    await reservationApi.cancel(id)
    modalOpen.value = false
    // 캘린더 새로고침
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start, start)
      events.value = convertWeeklyToEvents(json)
    }
  } catch (err) {
    console.error('예약 취소 실패:', err)
  }
}

/* 모달 닫기 */
const closeModal = () => {
  modalOpen.value = false
}

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
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-event-chip:hover {
  background: #b3d9ff !important;
  transform: scale(1.05);
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
