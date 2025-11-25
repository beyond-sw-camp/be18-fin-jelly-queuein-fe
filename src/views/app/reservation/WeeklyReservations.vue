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
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// 주별 이벤트 리스트
const events = ref([])

// 현재 날짜(주 이동 기준 날짜)
const currentDate = ref('2025-09-29')

// mock 데이터 로드 함수
async function fetchEvents(start, end) {
  console.log("🔹 Fetching week events:", start, "~", end)

  // API 없을 때 mock 사용
  events.value = [
    { id: 1, title: "9:00 노트북", start: "2025-09-29T09:00:00", color: "#93c5fd" },
    { id: 2, title: "10:00 노트북", start: "2025-09-29T10:00:00", color: "#93c5fd" },
    { id: 3, title: "11:00 태블릿", start: "2025-09-30T11:00:00", color: "#fde68a" },
    { id: 4, title: "11:00 태블릿", start: "2025-10-02T11:00:00", color: "#fde68a" },
    { id: 5, title: "13:00 노트북", start: "2025-10-02T13:00:00", color: "#93c5fd" },
    { id: 6, title: "11:00 태블릿", start: "2025-10-03T11:00:00", color: "#fde68a" }
  ]
}

// FullCalendar 옵션
const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin, dayGridPlugin],
  initialView: 'timeGridWeek',
  events,
  initialDate: currentDate.value,
  allDaySlot: false,
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',

  headerToolbar: false, // 직접 만든 UI 쓸 것이므로 숨김

  datesSet(info) {
    fetchEvents(info.startStr, info.endStr)
  },

  dateClick(info) {
    console.log("📅 날짜 클릭:", info.dateStr)
  },

  eventClick(info) {
    console.log("🎯 이벤트 클릭:", info.event)
  }
})

// 첫 화면 로드 시 mock 데이터 로딩
fetchEvents("2025-09-29", "2025-10-05")
</script>

<style>
/* 필요한 경우 스타일 override */
</style>
