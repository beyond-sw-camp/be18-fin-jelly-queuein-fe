<!-- file: src/layouts/AdminLayout.vue -->
<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <AppHeader />

    <div class="container">
      <AppSidebar />

      <main class="content">
        <RouterView />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.container {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>
