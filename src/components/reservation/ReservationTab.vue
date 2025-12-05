<template>
  <div class="tab-full-wrapper">
    <el-tabs v-model="active" class="reservation-tabs" @tab-click="onTabClick" type="line">
      <el-tab-pane label="예약 현황" name="status" />
      <el-tab-pane label="예약 가능 자원 목록" name="available" />
      <el-tab-pane label="예약하기" name="create" />
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

// 라우트 기반 활성 탭 선택
const active = ref(getTabNameByRoute(route.path))

function getTabNameByRoute(path) {
  if (path.includes('/app/reservations/me')) return 'status'
  if (path.includes('/app/reservations/available-assets')) return 'available'
  if (path.includes('/app/reservations/create')) return 'create'
  if (path.includes('/admin/reservations/applied')) return 'applied'
  return 'status'
}

function onTabClick(tab) {
  switch (tab.props.name) {
    case 'status':
      router.push('/app/reservations/me')
      break
    case 'available':
      router.push('/app/reservations/available-assets')
      break
    case 'create':
      active.value = getTabNameByRoute(route.path)
      ElMessage.warning('예약할 자원을 먼저 선택해주세요.')
      break
    case 'applied':
      router.push('/admin/reservations/applied')
      break
  }
}

onMounted(async () => {
  await nextTick() // active-bar 재계산
})

watch(
  () => route.path,
  (newPath) => {
    active.value = getTabNameByRoute(newPath)
  },
)
</script>

<style scoped>

/* 헤더 전체 넓이 */
.reservation-tabs :deep(.el-tabs__header) {
  width: 100%;
}

/* 기존 코드 제거됨 */

/* 안전한 flex 적용 — nav 에만 적용 */
.reservation-tabs :deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
}

/* 탭 균등 분배 */
.reservation-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}

/* 활성 탭 밑줄 설정 (Element Plus 기본값 사용) */
.reservation-tabs :deep(.el-tabs__active-bar) {
  height: 2px !important;
  bottom: 0 !important;
}
</style>
