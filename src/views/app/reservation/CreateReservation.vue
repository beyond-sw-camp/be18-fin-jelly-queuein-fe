<template>
  <div class="reservation-page">
    <!-- 헤더 -->
    <div class="header-row">
      <h2>예약하기</h2>
    </div>
    <ReservationTabs />

    <!-- 자원 예약 정보 -->
    <h2>자원 예약</h2>
    <BookingHeader
      :assetName="assetInfo?.assetName || assetName"
      v-model:date="date"
      v-model:note="note"
      :timeRange="timeRange"
      :participants="selectedUsers.map(u => u.name)"
      @add="openParticipantModal"
    />




    <!-- 예약 시간 선택 -->
    <div class="time-section">
      <h2>예약 시간 선택</h2>
      <TimeBar 
        :blocks="timeBlocks" 
        v-model="selectedHours"
      />
    </div>

    <!-- 선택된 참여자 표시
    <div v-if="selectedUsers.length" class="selected-users">
      선택된 참여자: 
      <span v-for="user in selectedUsers" :key="user.id" class="user-chip">
        {{ user.name }}
      </span>
    </div> -->

    <!-- 참여자 선택 모달 -->
    <ParticipantModal
      :show="participantModalVisible"
      @close="participantModalVisible = false"
      @select="onSelectParticipants"
    />

    <!-- 예약 신청 버튼 -->
    <ApplyButton @click="submitBooking" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'

import TimeBar from './component/TimeBar.vue'
import BookingHeader from './component/BookingHeader.vue'
import ParticipantModal from './component/ParticipantModal.vue'
import ApplyButton from './component/ApplyButton.vue'
import ReservationTabs from './component/ReservationTab.vue'
import { reservationApi } from '@/api/reservationApi'

const route = useRoute()

// 목록 페이지에서 전달한 assetId와 date → params 로 변경!
const assetId = Number(route.query.assetId) 

const selectedDate = ref(route.query.date) 
const assetName = route.query.assetName?.toString() ?? ""

// 자원 정보
const assetInfo = ref<any>(null)

// 예약 가능 시간
const timeBlocks = ref<any[]>([])
const selectedHours = ref<number[]>([])

// 참여자
const participantModalVisible = ref(false)
const selectedUsers = ref<{ id: number; name: string }[]>([])
const note = ref("")

// -------------------------------
// 2️⃣ 예약 가능 시간 조회 API
// -------------------------------
const today = new Date().toISOString().slice(0, 10)
const date = ref<string>(route.query.date?.toString() ?? today)

const fetchAvailableTimes = async () => {
  await reservationApi.getAvailableTimes(assetId, date.value)
}




// -------------------------------
// 선택 시간 → 시간 문자열로 변환
// -------------------------------
const timeRange = computed(() => {
  if (!selectedHours.value.length) return '-'
  const start = Math.min(...selectedHours.value)
  const end = Math.max(...selectedHours.value) + 1

  return `${String(start).padStart(2,'0')}:00 ~ ${String(end).padStart(2,'0')}:00`
})

// 모달
const openParticipantModal = () => participantModalVisible.value = true
const onSelectParticipants = (users: any[]) => {
  selectedUsers.value = users
  participantModalVisible.value = false
}

// -------------------------------
// 예약 생성 API
// -------------------------------
async function submitBooking() {
  if (!selectedHours.value.length) {
    alert("예약 시간을 선택해주세요.")
    return
  }

  const startHour = Math.min(...selectedHours.value)
  const endHour = Math.max(...selectedHours.value) + 1

  const payload = {
    reserver: "박채연",
    startAt: `${date}T${startHour.toString().padStart(2,'0')}:00:00`,
    endAt: `${date}T${endHour.toString().padStart(2,'0')}:00:00`,
    participants: selectedUsers.value.map(u => u.id)
  }

  await api.post(`/reservations/${assetId}/instant-confirm`, payload)
}



// -------------------------------
// 페이지 로딩 시 API 호출
// -------------------------------
onMounted(() => {
  fetchAvailableTimes()
})
</script>

<style scoped>
.reservation-page {
  padding: 20px;
}

.time-section {
  margin-top: 40px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selected-users {
  margin: 10px 0;
  font-weight: 600;
}

.user-chip {
  display: inline-block;
  background: #b6ceb4;
  padding: 4px 8px;
  margin-right: 6px;
  border-radius: 8px;
  font-size: 13px;
}
</style>
