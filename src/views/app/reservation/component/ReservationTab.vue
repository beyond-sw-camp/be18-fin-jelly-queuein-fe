<template>
  <div class="tab-full-wrapper">
    <el-tabs v-model="active" class="reservation-tabs" @tab-click="onTabClick">
      <el-tab-pane label="예약 현황" name="status" />
      <el-tab-pane label="예약 가능 자원 목록" name="available" />
      <el-tab-pane label="예약하기" name="create" />
      <el-tab-pane label="예약 관리" name="applied" />
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

//처음 접속 시 라우트 경로에 따라 active 자동 설정
const active = ref(getTabNameByRoute(route.path))

function getTabNameByRoute(path) {
  if (path.includes('/app/reservations/me')) return 'status'
  if (path.includes('/app/reservations/available-assets')) return 'available'
  if (path.includes('/app/reservations/create')) return 'create'
  if (path.includes('/app/reservations/applied')) return 'applied'
  return 'status'
}

//탭 클릭 시 라우팅
function onTabClick(tab) {
  switch (tab.props.name) {
    case 'status':
      router.push('/app/reservations/me')
      break
    case 'available':
      router.push('/app/reservations/available-assets')
      break
    case 'create':
      router.push('/app/reservations/create')
      break
    case 'applied':
      router.push('/app/reservations/applied')
      break
  }
}

//라우터가 변하면 active도 업데이트 (뒤로가기/새로고침 대응)
watch(
  () => route.path,
  newPath => {
    active.value = getTabNameByRoute(newPath)
  }
)
</script>
<style>
.tab-full-wrapper {
  width: 100%;
  display: block; 
}

.reservation-tabs :deep(.el-tabs__nav) {
  display: flex !important;
  width: 100%;
}

.reservation-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}
</style>