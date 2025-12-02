<template>
  <div>
    <ul class="tree">
      <li class="root">{{ rootName }}</li>
      <li v-for="c in children" :key="c">{{ c }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  rootName: String,
  children: Array,
})
</script>

<style scoped>
.tree {
  list-style: none;
  padding-left: 0;
}
.root {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
