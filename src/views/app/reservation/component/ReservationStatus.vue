<template>
  <el-tag :type="color" size="small">{{ text }}</el-tag>
</template>

<script setup>
const props = defineProps({ status: String })

const map = {
  PENDING: { text: "대기", color: "warning" },
  USING: { text: "사용중", color: "success" },
  APPROVED: { text: "승인됨", color: "success" },
  REJECTED: { text: "거절됨", color: "success" },
  CANCELED: { text: "사용취소", color: "danger" },
  COMPLETED: { text: "사용완료", color: "success" },
}

const text = map[props.status]?.text ?? "사용 가능"
const color = map[props.status]?.color ?? "info"
</script>
