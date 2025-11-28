<template>
  <el-row :gutter="12" class="filter-row">

    <el-col :span="4">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="날짜 선택"
        @change="onDateSelect"
      />
    </el-col>

    <el-col :span="4">
      <el-select v-model="type" placeholder="자원 유형">
        <el-option label="공간" value="SPACE" />
        <el-option label="장비" value="EQUIP" />
      </el-select>
    </el-col>

    <el-col :span="4">
      <el-select v-model="asset" placeholder="자원 상태">
        <el-option 
          v-for="a in assets" 
          :key="a.id"
          :label="a.name"
          :value="a.id" 
        />
      </el-select>
    </el-col>

    <el-col :span="4">
      <el-select v-model="category" placeholder="카테고리">
        <el-option label="스튜디오" value="studio" />
      </el-select>
    </el-col>

    <el-col :span="4">
      <el-select v-model="usage" placeholder="0계층 선택">
        <el-option label="사용 가능" value="AVAILABLE" />
        <el-option label="사용 불가" value="UNAVAILABLE" />
      </el-select>
    </el-col>

    <el-col :span="4">
      <el-select v-model="usage" placeholder="1계층 선택">
        <el-option label="사용 가능" value="AVAILABLE" />
        <el-option label="사용 불가" value="UNAVAILABLE" />
      </el-select>
    </el-col>

  </el-row>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(null)
const type = ref(null)
const category = ref(null)
const usage = ref(null)
const search = ref("")

const asset = ref(null)
const assets = ref([
  { id: 1, name: "스튜디오 1" },
  { id: 2, name: "스튜디오 2" }
])


const emit = defineEmits(['date-change'])
const selectedDate = ref(new Date())

const onDateSelect = (value) => {
  selectedDate.value = value
  emit('date-change', value)
}
</script>

<style scoped>
.filter-row {
  margin: 20px 0;
}
</style>
