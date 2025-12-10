<template>
  <div class="iam-tabs">
    <button
      v-for="t in tabs"
      :key="t.to"
      :class="['tab', { active: isActive(t.to) }]"
      @click="go(t.to)"
    >
      <i :class="t.icon"></i>
      <span>{{ t.label }}</span>
      <span v-if="isActive(t.to)" class="active-indicator"></span>
    </button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { label: '사용자', to: '/admin/users', icon: 'pi pi-user' },
  { label: '역할', to: '/admin/roles', icon: 'pi pi-shield' },
  { label: '권한', to: '/admin/permissions/list', icon: 'pi pi-key' },
]

function go(path) {
  router.push(path)
}

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.iam-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  justify-content: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.tab {
  position: relative;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 14px 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  flex: 1;
  justify-content: center;
  color: #666;
  overflow: hidden;
}

.tab:hover {
  background: #eeeeee;
  border-color: #d0d0d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.tab.active:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.tab i {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.tab.active i {
  transform: scale(1.1);
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}
</style>
