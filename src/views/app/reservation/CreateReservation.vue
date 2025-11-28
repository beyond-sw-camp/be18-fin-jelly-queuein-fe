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
      :assetName="'카메라 1'"
      :date="'2025-01-01'"
      :reserver="'박채연'"
      :timeRange="timeRange"
      :participants="selectedUsers.map(u => u.name)"
      note="1팀 회의용"
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
import { ref, computed } from 'vue'
import TimeBar from './component/TimeBar.vue'
import BookingHeader from './component/BookingHeader.vue'
import ParticipantModal from './component/ParticipantModal.vue'
import ApplyButton from './component/ApplyButton.vue'
import ReservationTabs from './component/ReservationTab.vue'

// 예약 가능한 시간 블록 예시
const timeBlocks = [
  { label: '예약 됨', type: 'reserved', start: 1, end: 11 },
  { label: '예약 가능', type: 'available', start: 11, end: 13 },
  { label: '예약 됨', type: 'reserved', start: 20, end: 24 }
]

// 선택된 시간
const selectedHours = ref<number[]>([])

// 선택된 시간 범위를 BookingHeader에 표시
const timeRange = computed(() => {
  if (!selectedHours.value.length) return '-'
  const start = Math.min(...selectedHours.value)
  const end = Math.max(...selectedHours.value) + 1
  return `${String(start).padStart(2,'0')}:00 ~ ${String(end).padStart(2,'0')}:00`
})

// 참여자 관련
const participantModalVisible = ref(false)
const selectedUsers = ref<{ id: number; name: string; email?: string }[]>([])

const openParticipantModal = () => {
  participantModalVisible.value = true
}

const onSelectParticipants = (users: { id: number; name: string; email?: string }[]) => {
  selectedUsers.value = users
  participantModalVisible.value = false
}

// 예약 신청
const submitBooking = () => {
  if (!selectedHours.value.length) {
    alert("예약 시간을 선택해주세요.")
    return
  }
  if (!selectedUsers.value.length) {
    alert("참여자를 선택해주세요.")
    return
  }

  const payload = {
    assetId: 1, // 실제 선택된 자원 ID
    reserver: "박채연",
    hours: selectedHours.value,
    participants: selectedUsers.value.map(u => u.id)
  }

  console.log("예약 신청 데이터:", payload)
  // 서버 요청 예시
  // axios.post('/api/reservations', payload)
}
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
