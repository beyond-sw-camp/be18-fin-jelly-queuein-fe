<template>
  <div class="calendar-container">
    <Card class="calendar-card">
      <template #content>
        <div class="calendar-top">
          <!-- 날짜 선택 -->
          <Calendar
            v-model="selectedDate"
            dateFormat="yy.mm.dd"
            showIcon
            iconDisplay="input"
            inputId="calendar-date"
            class="date-picker"
            @date-select="onDateChange"
          />

          <!-- 월별/주별 버튼 -->
          <div class="calendar-toggle">
            <Button
              label="월별"
              :outlined="currentView !== 'dayGridMonth'"
              :class="{ 'active-view': currentView === 'dayGridMonth' }"
              @click="changeView('dayGridMonth')"
            />
            <Button
              label="주별"
              :outlined="currentView !== 'timeGridWeek'"
              :class="{ 'active-view': currentView === 'timeGridWeek' }"
              @click="changeView('timeGridWeek')"
            />
          </div>
        </div>

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
import { ref, onMounted, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import koLocale from '@fullcalendar/core/locales/ko.js'
import { reservationApi } from '@/api/reservationApi'
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal.vue'
import Card from 'primevue/card'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'

const calendarRef = ref(null)
const today = new Date()
const selectedDate = ref(today)
const currentView = ref('dayGridMonth')

// 모달 관련
const modalOpen = ref(false)
const reservationDetail = ref(null)

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateForApi = (date) => {
  if (!date) return new Date().toISOString().slice(0, 10)
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/* ---------------------------
   FullCalendar 옵션
---------------------------- */
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin],
  locale: koLocale,
  initialView: currentView.value,
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
  contentHeight: 'auto',
  height: 'auto',
  displayEventTime: false,
  eventOverlap: false,
  slotEventOverlap: false,
  eventMaxStack: 1,
  allDaySlot: false,
  firstDay: 0, // 일요일부터 시작
  dayHeaderFormat: { weekday: 'short' }, // 요일을 짧게 표시 (일, 월, 화...)
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  
  eventContent: (arg) => {
    const startTime = arg.event.start ? arg.event.start.toTimeString().slice(0, 5) : ''
    const endTime = arg.event.end ? arg.event.end.toTimeString().slice(0, 5) : ''
    const timeText = endTime ? `${startTime} - ${endTime}` : startTime
    const count = arg.event.extendedProps.count ?? 1
    const bgColor = arg.event.backgroundColor || '#fce7f3'
    const textColor = arg.event.textColor || '#9f1239'
    return {
      html: `
        <div class="custom-event-chip" style="background-color: ${bgColor}; color: ${textColor};">
          <span class="event-title">${timeText} ${arg.event.title}</span>
          ${count > 1 ? `<span class="event-badge">+${count - 1}</span>` : ""}
        </div>
      `
    }
  },
  eventClick: (info) => {
    const reservationId = info.event.id
    if (reservationId) {
      openDetailModal(reservationId)
    }
  },
  events: [],
}))

/* ---------------------------
   예약 상태별 옅은 색상 매핑
---------------------------- */
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

/* ---------------------------
   API 데이터 → FullCalendar event 변환
---------------------------- */
const convertReservationsToEvents = (data) => {
  const events = []

  data.reservations.forEach(day => {
    day.reservations.forEach(r => {
      const start = new Date(r.startAt)
      const localStart = new Date(start.getTime() + 9 * 60 * 60 * 1000)
      const end = new Date(r.endAt)
      const localEnd = new Date(end.getTime() + 9 * 60 * 60 * 1000)
      events.push({
        id: r.reservationId,
        title: r.assetName,
        start: localStart,
        end: localEnd, // 끝나는 시간까지 표시
        allDay: false,
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

  return events
}

/* ---------------------------
   YYYY-MM-DD → YYYY-MM 변환
---------------------------- */
const getYearMonth = (date) => {
  if (!date) return new Date().toISOString().slice(0, 7)
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

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
const onDateChange = async () => {
  const api = calendarRef.value.getApi()
  const dateStr = formatDateForApi(selectedDate.value)
  api.gotoDate(dateStr)
  await loadCalendarEvents()
}

/* 뷰 변경 */
const changeView = async (view) => {
  const api = calendarRef.value.getApi()
  const currentDate = api.getDate() // 현재 캘린더의 날짜 저장
  currentView.value = view
  api.changeView(view)
  // 뷰 변경 후 날짜 유지
  api.gotoDate(currentDate)
  await loadCalendarEvents()
}

/* 최초 로딩 */
onMounted(() => {
  loadCalendarEvents()
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
    loadCalendarEvents()
  } catch (err) {
    console.error('사용 시작 실패:', err)
  }
}

const handleEnd = async (id) => {
  try {
    await reservationApi.endUsing(id)
    modalOpen.value = false
    loadCalendarEvents()
  } catch (err) {
    console.error('사용 종료 실패:', err)
  }
}

const handleCancel = async (id) => {
  try {
    await reservationApi.cancel(id)
    modalOpen.value = false
    loadCalendarEvents()
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

.calendar-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.date-picker {
  flex: 0 0 auto;
}

.calendar-toggle {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.calendar-toggle :deep(.p-button) {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.calendar-toggle .active-view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.calendar-wrapper {
  min-height: 600px;
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

:deep(.fc-button-primary:not(:disabled):active),
:deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background: #667eea;
  border-color: #667eea;
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

/* 날짜 셀 스타일 */
:deep(.fc-daygrid-day) {
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

:deep(.fc-daygrid-day:hover) {
  background: #f9fafb;
}

:deep(.fc-day-today) {
  background: #eff6ff !important;
  border: 2px solid #3b82f6 !important;
}

:deep(.fc-daygrid-day-number) {
  padding: 8px;
  color: #1f2937;
  font-weight: 600;
  font-size: 14px;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #3b82f6;
  font-weight: 700;
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
}

:deep(.fc-timegrid-col.fc-day-today) {
  background: #f0f9ff;
}

/* 이벤트 스타일 */
:deep(.fc-event-bg),
:deep(.fc-event-main),
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.custom-event-chip {
  position: relative;
  width: 100% !important;
  height: 100%;
  border-radius: 0;
  padding: 6px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 !important;
}

.custom-event-chip:hover {
  opacity: 0.8;
}

/* 월간 뷰에서 이벤트가 날짜 가로 전체를 차지하도록 */
:deep(.fc-daygrid-event) {
  margin: 0 !important;
  width: 100% !important;
  border-radius: 0 !important;
  left: 0 !important;
  right: 0 !important;
}

:deep(.fc-daygrid-event-harness) {
  width: 100% !important;
  left: 0 !important;
  right: 0 !important;
}

:deep(.fc-daygrid-event-harness > a) {
  width: 100% !important;
  margin: 0 !important;
  left: 0 !important;
  right: 0 !important;
}

/* 주별 뷰에서도 이벤트가 가로 전체를 차지하도록 */
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

.event-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.event-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  line-height: 1.2;
  font-weight: 700;
}

/* 월간 뷰 이벤트 */
:deep(.fc-daygrid-event) {
  margin: 2px 4px;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.fc-daygrid-event-harness) {
  max-height: 24px;
}

/* 주별 뷰 all-day 제거 */
:deep(.fc-timegrid-all-day) {
  display: none !important;
}

:deep(.fc-timegrid-axis) {
  border-right: 1px solid #e5e7eb;
}

/* 반응형 */
@media (max-width: 768px) {
  .calendar-container {
    padding: 16px;
  }

  .calendar-top {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-toggle {
    margin-left: 0;
    width: 100%;
  }

  .calendar-toggle :deep(.p-button) {
    flex: 1;
  }

  .calendar-wrapper {
    padding: 8px;
    min-height: 400px;
  }

  :deep(.fc-toolbar-title) {
    font-size: 18px;
  }
}
</style>
