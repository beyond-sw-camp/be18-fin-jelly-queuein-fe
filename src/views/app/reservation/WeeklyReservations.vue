<template>
  <div class="calendar-container">
    <Card class="calendar-card">
      <template #content>
        <div class="calendar-wrapper">
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>
      </template>
    </Card>

    <!-- 예약 상세 모달 -->
    <ReservationDetailModal
      :visible="modalOpen"
      :asset="reservationDetail"
      @close="closeModal"
      @start="handleStart"
      @end="handleEnd"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko.js'
import { reservationApi } from '@/api/reservationApi'
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal.vue'
import Card from 'primevue/card'

const calendarRef = ref(null)
const events = ref([])
const currentDate = ref(new Date())

// 모달 관련
const modalOpen = ref(false)
const reservationDetail = ref(null)

async function fetchWeekReservations(start) {
  const res = await reservationApi.getWeeklyReservations(start)
  return res.data
}

/* 예약 상태별 옅은 색상 매핑 */
const getEventColor = (status) => {
  const statusUpper = (status || '').toUpperCase()
  switch (statusUpper) {
    case 'PENDING':
      return '#fef3c7' // 옅은 노란색
    case 'APPROVED':
      return '#d1fae5' // 옅은 초록색
    case 'USING':
      return '#dbeafe' // 옅은 파란색
    case 'COMPLETED':
      return '#f3f4f6' // 옅은 회색
    case 'REJECTED':
      return '#fee2e2' // 옅은 빨간색
    case 'CANCELED':
      return '#f9fafb' // 옅은 회색
    default:
      return '#fce7f3' // 옅은 분홍색 (기본)
  }
}

/* 텍스트 색상 매핑 */
const getEventTextColor = (status) => {
  const statusUpper = (status || '').toUpperCase()
  switch (statusUpper) {
    case 'PENDING':
      return '#92400e' // 진한 노란색 텍스트
    case 'APPROVED':
      return '#065f46' // 진한 초록색 텍스트
    case 'USING':
      return '#1e40af' // 진한 파란색 텍스트
    case 'COMPLETED':
      return '#374151' // 진한 회색 텍스트
    case 'REJECTED':
      return '#991b1b' // 진한 빨간색 텍스트
    case 'CANCELED':
      return '#6b7280' // 회색 텍스트
    default:
      return '#9f1239' // 진한 분홍색 텍스트
  }
}

function convertWeeklyToEvents(data) {
  const list = []

  data.reservations.forEach(day => {
    day.reservations.forEach(r => {
      const startUtc = new Date(r.startAt)
      const localStart = new Date(startUtc.getTime() + 9 * 60 * 60 * 1000)
      const endUtc = new Date(r.endAt)
      const localEnd = new Date(endUtc.getTime() + 9 * 60 * 60 * 1000)

      list.push({
        id: r.reservationId,
        title: r.assetName,
        start: localStart,
        end: localEnd, // 끝나는 시간까지 표시
        backgroundColor: getEventColor(r.reservationStatus),
        borderColor: getEventColor(r.reservationStatus),
        textColor: getEventTextColor(r.reservationStatus),
        extendedProps: {
          status: r.reservationStatus,
          startAt: r.startAt,
          endAt: r.endAt
        }
      })
    })
  })

  return list
}

const calendarOptions = computed(() => ({
  plugins: [timeGridPlugin, interactionPlugin, dayGridPlugin],
  locale: koLocale,
  initialView: 'timeGridWeek',
  allDaySlot: false,
  initialDate: currentDate.value,
  events: events.value,
  firstDay: 0, // 일요일부터 시작
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  buttonText: {
    today: '오늘',
    month: '월',
    week: '주',
    day: '일'
  },
  dayHeaderFormat: { weekday: 'short' },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  slotMinTime: '06:00:00',
  slotMaxTime: '24:00:00',
  contentHeight: 'auto',
  height: 'auto',

  eventContent: (arg) => {
    const startTime = arg.event.start ? arg.event.start.toTimeString().slice(0, 5) : ''
    const endTime = arg.event.end ? arg.event.end.toTimeString().slice(0, 5) : ''
    const timeText = endTime ? `${startTime} - ${endTime}` : startTime
    const bgColor = arg.event.backgroundColor || '#fce7f3'
    const textColor = arg.event.textColor || '#9f1239'

    return {
      html: `
        <div class="custom-event-chip" style="background-color: ${bgColor}; color: ${textColor};">
          <span class="event-time">${timeText}</span>
          <span class="event-title">${arg.event.title}</span>
        </div>
      `
    }
  },

  datesSet: async (info) => {
    const start = info.startStr.slice(0, 10)
    const json = await fetchWeekReservations(start)
    events.value = convertWeeklyToEvents(json)
  },

  eventClick: (info) => {
    const reservationId = info.event.id
    if (reservationId) {
      openDetailModal(reservationId)
    }
  },
}))

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
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start)
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
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start)
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
    const api = calendarRef.value?.getApi()
    if (api) {
      const view = api.view
      const start = view.activeStart.toISOString().slice(0, 10)
      const json = await fetchWeekReservations(start)
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

<style scoped>
.calendar-container {
  padding: 24px;
  max-width: 100%;
}

.calendar-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.calendar-wrapper {
  min-height: 700px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

/* FullCalendar 한국어 스타일 개선 */
:deep(.fc) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.fc-toolbar-title) {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

:deep(.fc-button) {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.fc-button:hover) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

:deep(.fc-button:active),
:deep(.fc-button-active) {
  background: #667eea;
  border-color: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

/* 요일 헤더 스타일 - 단색 배경 */
:deep(.fc-col-header-cell) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  padding: 12px 8px;
  text-align: center;
}

:deep(.fc-col-header-cell-cushion) {
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
}

/* 일요일 빨간 글씨 */
:deep(.fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion) {
  color: #ef4444;
}

/* 토요일 파란 글씨 */
:deep(.fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion) {
  color: #3b82f6;
}

/* 주별 뷰 시간 슬롯 */
:deep(.fc-timegrid-slot) {
  height: 60px;
  border-top: 1px solid #f3f4f6;
}

:deep(.fc-timegrid-slot-label) {
  padding: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

:deep(.fc-timegrid-col) {
  border-left: 1px solid #e5e7eb;
  background: white;
}

:deep(.fc-timegrid-col.fc-day-today) {
  background: #f0f9ff;
}

:deep(.fc-timegrid-now-indicator-line) {
  border-color: #3b82f6;
  border-width: 2px;
}

/* 이벤트 스타일 */
:deep(.fc-event-bg),
:deep(.fc-event-main),
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.custom-event-chip {
  width: 100% !important;
  height: 100%;
  border-radius: 0;
  padding: 6px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 !important;
}

.custom-event-chip:hover {
  opacity: 0.8;
}

/* 주별 뷰에서 이벤트가 가로 전체를 차지하도록 */
:deep(.fc-timegrid-event) {
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
}

:deep(.fc-timegrid-event-harness) {
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
}

.event-time {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 700;
}

.event-title {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 주별 뷰 all-day 제거 */
:deep(.fc-timegrid-all-day) {
  display: none !important;
}

:deep(.fc-timegrid-axis) {
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
}

:deep(.fc-timegrid-axis-cushion) {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 768px) {
  .calendar-container {
    padding: 16px;
  }

  .calendar-wrapper {
    padding: 8px;
    min-height: 500px;
  }

  :deep(.fc-toolbar-title) {
    font-size: 18px;
  }

  :deep(.fc-timegrid-slot) {
    height: 50px;
  }
}
</style>
