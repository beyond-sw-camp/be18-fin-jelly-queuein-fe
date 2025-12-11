<script setup>
import { RouterView } from 'vue-router'
import { useSSE } from "@/composables/useSSE";

const token = localStorage.getItem("accessToken");
useSSE(token);
</script>

<template>
  <RouterView />
</template>

<style>
/* 전역 스타일이 필요하다면 여기에 */
</style>
