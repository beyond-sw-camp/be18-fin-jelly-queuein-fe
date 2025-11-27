<template>
  <select class="dropdown" :value="modelValue" @change="updateValue">
    <option value="" disabled>{{ placeholder }}</option>

    <option value="AVAILABLE">사용 가능</option>
    <option value="UNAVAILABLE">사용 불가</option>
    <option value="MAINTENANCE">점검 중</option>
  </select>
</template>

<script setup>
const props = defineProps({
  modelValue: [String, Number],
  placeholder: { type: String, default: '자원 상태' },
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (e) => emit('update:modelValue', e.target.value)
</script>

<style scoped>
.dropdown {
  width: 180px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}
</style>
