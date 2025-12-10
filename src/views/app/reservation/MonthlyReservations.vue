<template>
  <div class="calendar-page">
    <!-- 왼쪽 미니 캘린더 -->
    <MiniCalendar
      :selected-date="selectedDate"
      :events="calendarEvents"
      :current-view="currentView"
      @date-select="onMiniCalendarDateSelect"
      @event-click="onMiniCalendarEventClick"
    />

    <!-- 오른쪽 메인 캘린더 -->
    <div class="main-calendar-container">
      <Card class="calendar-card">
        <template #content>
          <div class="calendar-content-wrapper">
            <div class="calendar-top">
          <!-- 월별/주별/일별 버튼 -->
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
            <Button
              label="일별"
              :outlined="currentView !== 'timeGridDay'"
              :class="{ 'active-view': currentView === 'timeGridDay' }"
              @click="changeView('timeGridDay')"
            />
          </div>
        </div>

            <div class="calendar-wrapper">
              <FullCalendar ref="calendarRef" :options="calendarOptions" />
            </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import koLocale from '@fullcalendar/core/locales/ko.js'
import { reservationApi } from '@/api/reservationApi'
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal.vue'
import MiniCalendar from '@/components/reservation/MiniCalendar.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const calendarRef = ref(null)
const today = new Date()
const selectedDate = ref(today)
const currentView = ref('dayGridMonth')
const calendarEvents = ref([]) // 미니 캘린더용 이벤트 목록

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
  views: {
    timeGridDay: {
      slotMinTime: '04:00:00',
      slotMaxTime: '24:00:00',
    },
    timeGridWeek: {
      slotMinTime: '04:00:00',
      slotMaxTime: '24:00:00',
    }
  },
  contentHeight: 'auto',
  height: '100%',
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
  
  // 이벤트가 마운트될 때 배경색을 fc-event-main에도 적용
  eventDidMount: (arg) => {
    const event = arg.event
    if (!event.start || !event.end) return
    
    const bgColor = event.backgroundColor || '#fce7f3'
    const rgba = hexToRgbaFromString(bgColor, 0.3)
    
    // fc-event-main에 배경색 적용
    const eventMain = arg.el.querySelector('.fc-event-main')
    if (eventMain) {
      eventMain.style.backgroundColor = rgba
    }
    
    // 주간/일간 뷰일 때 타임슬롯 배경색도 적용
    if (currentView.value === 'timeGridWeek' || currentView.value === 'timeGridDay') {
      setTimeout(() => {
        applySlotBackgrounds()
      }, 100)
    }
  },
  eventClick: (info) => {
    const reservationId = info.event.id
    if (reservationId) {
      openDetailModal(reservationId)
    }
  },
  events: [],
  
  // 주간/일간 뷰일 때 타임슬롯 배경색 적용
  datesSet: async (info) => {
    // 주간/일간 뷰일 때만 배경색 적용
    if (currentView.value === 'timeGridWeek' || currentView.value === 'timeGridDay') {
      console.log(`[MonthlyReservations] datesSet - ${currentView.value} view`)
      await nextTick()
      setTimeout(() => {
        console.log('[MonthlyReservations] Calling applySlotBackgrounds from datesSet')
        applySlotBackgrounds()
      }, 500)
    }
  },
  
  // 이벤트가 마운트될 때 타임슬롯 배경색 적용 (주간/일간 뷰일 때만)
  eventDidMount: (arg) => {
    if (currentView.value === 'timeGridWeek' || currentView.value === 'timeGridDay') {
      setTimeout(() => {
        applySlotBackgrounds()
      }, 100)
    }
  },
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
  
  // 캘린더 이벤트 저장 (미니 캘린더용)
  calendarEvents.value = events

  api.removeAllEvents()
  events.forEach(ev => api.addEvent(ev))
  
  // 주간/일간 뷰일 때 타임슬롯 배경색 적용
  if (currentView.value === 'timeGridWeek' || currentView.value === 'timeGridDay') {
    await nextTick()
    setTimeout(() => {
      applySlotBackgrounds()
    }, 500)
  }
}

// 타임슬롯 배경색 적용 함수
function applySlotBackgrounds() {
  console.log('[MonthlyReservations] applySlotBackgrounds called')
  const calendarEl = calendarRef.value?.getApi()?.el
  if (!calendarEl) {
    console.warn('[MonthlyReservations] Calendar element not found')
    return
  }
  console.log('[MonthlyReservations] Calendar element found')
  
  // 모든 타임슬롯 배경색 초기화
  const allSlots = calendarEl.querySelectorAll('.fc-timegrid-slot')
  console.log('[MonthlyReservations] Found slots:', allSlots.length)
  allSlots.forEach(slot => {
    slot.style.backgroundColor = ''
    slot.classList.remove('has-event-slot')
  })
  
  // 모든 이벤트 엘리먼트 찾기
  const allEvents = calendarEl.querySelectorAll('.fc-timegrid-event')
  console.log('[MonthlyReservations] Found events:', allEvents.length)
  
  if (allEvents.length === 0) {
    console.warn('[MonthlyReservations] No events found')
    return
  }
  
  allEvents.forEach((eventEl, eventIndex) => {
    console.log(`[MonthlyReservations] Processing event ${eventIndex + 1}...`)
    // 이벤트의 배경색 가져오기 (인라인 스타일에서)
    const eventChip = eventEl.querySelector('.custom-event-chip')
    if (!eventChip) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: custom-event-chip not found`)
      return
    }
    
    // 인라인 스타일에서 배경색 가져오기
    const bgColorStyle = eventChip.getAttribute('style')
    if (!bgColorStyle || !bgColorStyle.includes('background-color')) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: no background-color in style`)
      return
    }
    
    const bgColorMatch = bgColorStyle.match(/background-color:\s*([^;]+)/)
    if (!bgColorMatch) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: could not parse background-color`)
      return
    }
    
    const bgColor = bgColorMatch[1].trim()
    const rgba = hexToRgbaFromString(bgColor, 0.3)
    console.log(`[MonthlyReservations] Event ${eventIndex + 1}: bgColor=${bgColor}, rgba=${rgba}`)
    
    // 이벤트가 속한 타임슬롯 찾기
    const timeGridCol = eventEl.closest('.fc-timegrid-col')
    if (!timeGridCol) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: timeGridCol not found`)
      return
    }
    
    const colFrame = timeGridCol.querySelector('.fc-timegrid-col-frame')
    if (!colFrame) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: colFrame not found`)
      return
    }
    
    // 이벤트의 실제 위치 계산
    const eventRect = eventEl.getBoundingClientRect()
    const colRect = colFrame.getBoundingClientRect()
    const eventTop = eventRect.top - colRect.top
    const eventBottom = eventRect.bottom - colRect.top
    
    console.log(`[MonthlyReservations] Event ${eventIndex + 1}: eventTop=${eventTop}, eventBottom=${eventBottom}`)
    
    // 실제 타임슬롯 높이 계산 (첫 번째 슬롯의 높이 사용)
    const firstSlot = colFrame.querySelector('.fc-timegrid-slot')
    if (!firstSlot) {
      console.warn(`[MonthlyReservations] Event ${eventIndex + 1}: firstSlot not found`)
      return
    }
    const slotHeight = firstSlot.getBoundingClientRect().height || 60
    console.log(`[MonthlyReservations] Event ${eventIndex + 1}: slotHeight=${slotHeight}`)
    
    // 시작/종료 인덱스 계산
    const slots = colFrame.querySelectorAll('.fc-timegrid-slot')
    const startSlotIndex = Math.max(0, Math.floor(eventTop / slotHeight))
    const endSlotIndex = Math.min(
      slots.length,
      Math.ceil(eventBottom / slotHeight)
    )
    
    console.log(`[MonthlyReservations] Event ${eventIndex + 1}: startSlotIndex=${startSlotIndex}, endSlotIndex=${endSlotIndex}, slots.length=${slots.length}`)
    
    // 해당 범위의 모든 타임슬롯에 배경색 적용
    let appliedCount = 0
    for (let i = startSlotIndex; i < endSlotIndex && i < slots.length; i++) {
      const slot = slots[i]
      if (slot) {
        slot.style.backgroundColor = rgba
        slot.classList.add('has-event-slot')
        appliedCount++
      }
    }
    console.log(`[MonthlyReservations] Event ${eventIndex + 1}: Applied to ${appliedCount} slots`)
  })
  
  console.log('[MonthlyReservations] applySlotBackgrounds finished')
}

// 문자열에서 hex 색상을 rgba로 변환
function hexToRgbaFromString(colorStr, alpha) {
  // 이미 rgba 형식인 경우
  if (colorStr.includes('rgba')) {
    return colorStr.replace(/rgba?\([^)]+\)/, (match) => {
      return match.replace(/,\s*[\d.]+\)$/, `, ${alpha})`)
    })
  }
  
  // hex 색상인 경우
  if (colorStr.startsWith('#')) {
    return hexToRgba(colorStr, alpha)
  }
  
  // rgb 형식인 경우
  if (colorStr.includes('rgb')) {
    return rgbToRgba(colorStr, alpha)
  }
  
  return colorStr
}

// RGB를 rgba로 변환
function rgbToRgba(rgb, alpha) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`
  }
  return rgb
}

// Hex 색상을 rgba로 변환
function hexToRgba(hex, alpha) {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.slice(0, 2), 16)
  const g = parseInt(cleanHex.slice(2, 4), 16)
  const b = parseInt(cleanHex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
  // 주간/일간 뷰로 전환했을 때 타임슬롯 배경색 적용
  if (view === 'timeGridWeek' || view === 'timeGridDay') {
    await nextTick()
    setTimeout(() => {
      applySlotBackgrounds()
    }, 500)
  }
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

/* 미니 캘린더 이벤트 핸들러 */
const onMiniCalendarDateSelect = (date) => {
  selectedDate.value = date
  const api = calendarRef.value.getApi()
  api.gotoDate(date)
  loadCalendarEvents()
}

const onMiniCalendarEventClick = (event) => {
  openDetailModal(event.id)
}
</script>

<style scoped>
.calendar-page {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1920px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  overflow: hidden;
  align-items: stretch;
}

.main-calendar-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 148px);
}

.calendar-container {
  padding: 24px;
  max-width: 100%;
}

.calendar-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calendar-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 16px;
}

.calendar-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
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
  flex: 1;
  padding: 0;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
}

.calendar-wrapper :deep(.fc) {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

.calendar-wrapper :deep(.fc-view-harness) {
  flex: 1;
  overflow: visible;
  min-height: 0;
}

.calendar-wrapper :deep(.fc-scroller) {
  overflow-y: auto !important;
  overflow-x: hidden;
  height: 100% !important;
}

.calendar-wrapper :deep(.fc-timegrid-body) {
  overflow-y: visible;
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
:deep(.fc-timegrid-event) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* fc-event-main은 JavaScript로 배경색이 동적으로 적용됨 */
:deep(.fc-event-main) {
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
