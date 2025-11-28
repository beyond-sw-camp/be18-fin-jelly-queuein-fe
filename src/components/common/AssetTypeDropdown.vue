<template>
  <select class="dropdown" :value="modelValue" @change="updateValue">
    <option value="" disabled>{{ placeholder }}</option>

    <option value="STATIC">정적</option>
    <option value="DYNAMIC">동적</option>
  </select>
</template>

<script setup>
const props = defineProps({
  modelValue: [String, Number],
  placeholder: { type: String, default: '자원 유형' },
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
