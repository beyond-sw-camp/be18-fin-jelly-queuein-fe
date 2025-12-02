<!-- file: src/components/common/ConfirmModal.vue -->
<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-box">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>

      <div class="modal-actions">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="confirm-btn" @click="confirm">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '확인' },
  message: { type: String, default: '계속 진행하시겠습니까?' },
})

const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}

function close() {
  emit('cancel')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  width: 360px;
  background: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-message {
  margin-top: 12px;
  font-size: 15px;
  color: #555;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 14px;
  background: #eee;
  border-radius: 6px;
  border: none;
  outline: none;
  cursor: pointer;
}

.confirm-btn {
  padding: 8px 14px;
  background: #c7dbcc;
  border-radius: 6px;
  border: none;
  outline: none;
  cursor: pointer;
}

.confirm-btn:hover {
  opacity: 0.85;
}
</style>
