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
      :reserver="currentUserName"
      :timeRange="timeRange"
      :participants="selectedUsers"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'

import TimeBar from '@/components/reservation/TimeBar.vue'
import BookingHeader from '@/components/reservation/BookingHeader.vue'
import ParticipantModal from '@/components/reservation/ParticipantModal.vue'
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
console.log("route.query.date =", route.query.date)

// 참여자
const participantModalVisible = ref(false)
const selectedUsers = ref<{ id: number; name: string }[]>([])
const note = ref("")

// -------------------------------
//  예약 가능 시간 조회 API
// -------------------------------
const today = new Date().toLocaleDateString('en-CA')  

const rawDate = route.query.date
const initialDate =
  Array.isArray(rawDate) ? rawDate[0] : rawDate

const date = ref(initialDate || today)
const onSelectParticipants = (users) => {
  selectedUsers.value = users.map(u => ({
    id: u.userId,         // 서버로 보낼 값
    name: u.userName      // 화면에 보여줄 값
  }))
}
// console.log("받은 값:", users);
// console.log("저장 직전:", users.map(u => ({ id: u.userId, name: u.userName })));


function convertToTimeBlocks(apiData) {
  const blocks = []
  const availableHours = new Set<number>()

  apiData.timeSlots.forEach(slot => {
    // 1) start, end 숫자로 변환
    let start = Number(slot.start.slice(0, 2))
    let end = Number(slot.end.slice(0, 2))

    // 2) end가 00이면 24로 변경 → 정상적인 범위로 조정
    if (end === 0) end = 24

    // 3) available 이 true 일 때만 availableHours 추가
    if (slot.available) {
      for (let h = start; h < end; h++) {
        availableHours.add(h)
      }
    }
  })

  // 4) 0~23 모든 시간대 생성
  for (let h = 0; h < 24; h++) {
    blocks.push({
      label: `${h}:00`,
      type: availableHours.has(h) ? "available" : "reserved",
      start: h,
      end: h + 1
    })
  }

  return blocks
}

const fetchAvailableTimes = async () => {
  const res = await reservationApi.getAvailableTimes(assetId, date.value)

  timeBlocks.value = convertToTimeBlocks(res.data)
}

// 날짜 변경 시 자동으로 예약 가능 시간 갱신
watch(() => date.value, () => {
  fetchAvailableTimes()
})


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


function toUtcIso(date, hour) {
  const local = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+09:00`);
  return local.toISOString();
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
  const endHourRaw = Math.max(...selectedHours.value) + 1

  let endDateValue = date.value
  let endHour = endHourRaw

  if (endHourRaw === 24) {
    const [y, m, d] = date.value.split("-").map(Number);
    const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
    endDateValue = nextDay.toISOString().slice(0, 10); // yyyy-MM-dd
    endHour = 0;
  }

  // --- KST(+09:00) → UTC ISO 변환 ---
  const startAt = toUtcIso(date.value, startHour);
  const endAt = toUtcIso(endDateValue, endHour);

  const payload = {
    applicantId: currentUserId.value,
    attendants: selectedUsers.value.map(u => ({
      userId: u.id
    })),
    startAt,
    endAt,
    description: note.value,  
  };




  await api.post(`/reservations/${assetId}/instant-confirm`, payload)
}
const currentUserName = ref("")
const currentUserId = ref(null)
onMounted(async () => {
  try {
    const res = await api.get("/users/me")
    currentUserId.value = res.data.userId
    currentUserName.value = res.data.userName
  } catch (e) {
    console.error("유저 정보 조회 실패", e)
  }

  fetchAvailableTimes()
})



// -------------------------------
// 페이지 로딩 시 API 호출
// -------------------------------

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