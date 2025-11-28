<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script setup>



import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: [
    { title: '노트북', date: '2025-10-01' },
    { title: '노트북', date: '2025-10-03', color: '#F6B26B' },
    { title: '노트북', date: '2025-10-07' }
  ]
}
</script>