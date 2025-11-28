<template>
  <div class="reservation-page">
    <div class="header-row">
      <h2>예약하기</h2>
    </div>
    <ReservationTabs/>


    <h2>자원 예약</h2>
    <BookingHeader
      :assetName="'카메라 1'"
      :date="'2025-01-01'"
      :reserver="'박채연'"
      :timeRange="'10:00 ~ 12:00'"
      :participants="selectedUser ? [selectedUser.name] : []"
      note="1팀 회의용"
      @add="openParticipantModal"
    />

    <div class="time-section">
      <h2>예약 시간 선택</h2>
      <TimeBar :blocks="timeBlocks" />
    </div>

    <!-- 선택된 참여자 이름 -->
    <span v-if="selectedUser">{{ selectedUser.name }}</span>

    <!-- 참여자 선택 모달 -->
    <ParticipantModal
      :show="participantModalVisible"
      @close="participantModalVisible = false"
      @select="onSelectParticipant"
    />

    <ApplyButton />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimeBar from './component/TimeBar.vue'
import BookingHeader from './component/BookingHeader.vue'
import ParticipantModal from './component/ParticipantModal.vue'
import ApplyButton from './component/ApplyButton.vue'
import ReservationTabs from './component/ReservationTab.vue'

const timeBlocks = [
  { label: '예약 됨', type: 'reserved', start: 1, end: 11 },
  { label: '예약 가능', type: 'available', start: 11, end: 13 },
  { label: '예약 됨', type: 'reserved', start: 20, end: 24 }
]

const participantModalVisible = ref(false)
const selectedUser = ref(null)

const openParticipantModal = () => {
  participantModalVisible.value = true
}

const onSelectParticipant = (user) => {
  selectedUser.value = user
  participantModalVisible.value = false
}
</script>

<style>
.reservation-page {
  padding: 10px 10px;
}

.time-section {
  margin-top: 100px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -40px;
  margin: 0; 
}


</style>
