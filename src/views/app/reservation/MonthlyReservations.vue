<template>
  <div class="bg-white p-4 rounded shadow">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

// FullCalendar에서 사용할 이벤트 배열 (반응형)
const events = ref([])

// 임시로 날짜 상태도 유지
const currentDate = ref('2025-10-01')

/**
 * ⭐ API가 있으면 axios 호출
 * ⭐ API가 없으면 mock 데이터 사용
 */
async function fetchEvents(start, end) {
  console.log('🔹 Fetching events for:', start, '~', end)

  try {
    // ------------ API 생기면 이 부분만 살리면 됨 -----------
    /*
    const { data } = await axios.get('/api/reservations', {
      params: { start, end }
    })

    events.value = data.map(r => ({
      id: r.reservationId,
      title: r.assetName,
      start: r.startAt,
      end: r.endAt
    }))
    */
    // -------------------------------------------------------

    // ⭐ 현재는 API가 없어서 mock 데이터 사용
    events.value = [
      { id: 1, title: "9:00 노트북", start: "2025-10-01T09:00:00" },
      { id: 2, title: "9:00 노트북", start: "2025-10-03T09:00:00" },
      { id: 3, title: "9:00 노트북", start: "2025-10-07T09:00:00" },
      { id: 4, title: "9:00 노트북", start: "2025-10-15T09:00:00" },
      { id: 5, title: "9:00 노트북", start: "2025-10-23T09:00:00" }
    ]

  } catch (err) {
    console.error('❌ Failed to fetch events:', err)
  }
}

/**
 * FullCalendar 옵션
 */
const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events,
  initialDate: currentDate.value,

  // 상단 네비게이션 숨기기 (자체 UI 쓸 거니까)
  headerToolbar: false,

  // 월 이동 시 자동 fetch
  datesSet(info) {
    fetchEvents(info.startStr, info.endStr)
  },

  // 날짜 클릭 시
  dateClick(info) {
    console.log('📅 날짜 클릭:', info.dateStr)
  },

  // 이벤트 클릭 시
  eventClick(info) {
    console.log('🎯 이벤트 클릭:', info.event)
  }
})

// 첫 렌더링 시 mock 로드
fetchEvents("2025-10-01", "2025-10-31")
</script>

<style>
/* FullCalendar 기본 스타일 조정 가능 */
</style>
