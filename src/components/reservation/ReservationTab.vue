<template>
  <div class="tab-full-wrapper">
    <el-tabs v-model="active" class="reservation-tabs" @tab-click="onTabClick" type="line">
      <el-tab-pane label="예약 현황" name="status" />
      <el-tab-pane label="예약 가능 자원 목록" name="available" />
      <el-tab-pane label="예약 신청" name="createReservation" />
      <el-tab-pane label="예약 관리" name="applied" />
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 활성 탭 설정
const active = ref(getTabNameByRoute(route.path))

function getTabNameByRoute(path) {
  if (path.includes('/app/reservations/me')) return 'status'
  if (path.includes('/app/reservations/available-assets')) return 'available'
  if (path.includes('/app/reservations/create-reservation')) return 'createReservation'
  if (path.includes('/app/reservations/apply')) return 'createReservation'
  if (path.includes('/admin/reservations/applied')) return 'applied'
  return 'status'
}

function onTabClick(tab) {
  console.log('🖱️ 탭 클릭:', tab.props.name, '현재 경로:', route.path)

  let targetPath = ''
  switch (tab.props.name) {
    case 'status':
      targetPath = '/app/reservations/me'
      router.push('/app/reservations/me').then(() => {
        // 라우터 이동 완료 후 이벤트 발생 (컴포넌트가 마운트된 후)
        setTimeout(() => {
          console.log('📢 reservation-tab-changed 이벤트 발생:', tab.props.name, targetPath)
          window.dispatchEvent(
            new CustomEvent('reservation-tab-changed', {
              detail: { tab: tab.props.name, path: targetPath },
            }),
          )
        }, 100)
      })
      break
    case 'available':
      targetPath = '/app/reservations/available-assets'
      router.push('/app/reservations/available-assets')
      break
    case 'createReservation':
      ElMessage.warning('예약할 자원을 먼저 선택해주세요.')
      active.value = getTabNameByRoute(route.path)
      break
    case 'applied':
      targetPath = '/admin/reservations/applied'
      router.push('/admin/reservations/applied')
      break
  }
}

onMounted(async () => {
  await nextTick()
})

watch(
  () => route.path,
  (newPath) => {
    active.value = getTabNameByRoute(newPath)
  },
)
</script>

<style scoped>
/* 탭 헤더 전체 가로폭 확장 */
.reservation-tabs :deep(.el-tabs__header) {
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

/* nav flex 배치 */
.reservation-tabs :deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
  margin: 0 !important;
}

/* ElementPlus 기본 스타일 완전 통일 */
.reservation-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  padding: 0 !important;

  font-size: 14px !important;
  font-weight: 500 !important;
  height: 40px !important;
  line-height: 40px !important;
  color: #6b7280;
}

/* hover — 초록색 */
.reservation-tabs :deep(.el-tabs__item:hover) {
  color: #00a950 !important;
}

/* active — 초록색 + 굵게 */
.reservation-tabs :deep(.el-tabs__item.is-active) {
  color: #00a950 !important;
  font-weight: 600 !important;
}

/* 초록색 바 */
.reservation-tabs :deep(.el-tabs__active-bar) {
  background-color: #00a950 !important;
  height: 3px !important;
}
</style>
