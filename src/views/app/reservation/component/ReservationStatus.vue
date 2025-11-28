<template>
  <el-tag :type="color" size="small">
    {{ text }}
  </el-tag>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  } 
})

/**
 * 🔥 예약 상태 매핑 테이블
 */
const map = {
  PENDING:   { text: "대기",     color: "warning" },
  USING:     { text: "사용중",   color: "success" },
  APPROVED:  { text: "승인됨",   color: "success" },
  REJECTED:  { text: "거절됨",   color: "danger" },
  CANCELED:  { text: "취소됨",   color: "info" },
  COMPLETED: { text: "사용완료", color: "success" },
}

/**
 * 🔥 매핑되지 않은 상태도 안전하게 처리
 */
const current = map[props.status] ?? {
  text: props.status ?? "-",
  color: "info",
}

const text = current.text
const color = current.color
</script>
