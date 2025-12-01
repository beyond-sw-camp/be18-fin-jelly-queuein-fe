<script setup>
import { defineProps, defineEmits } from "vue"

// ❗ 여기 고쳤음 — default import 로 변경
import DataTable from "primevue/datatable"
import Column from "primevue/column"

defineProps({
  rows: Array,
  loading: Boolean,
  pageInfo: Object
})

const emit = defineEmits(["changePage"])

function onPage(event) {
  emit("changePage", event.page)
}

function formatDate(str) {
  if (!str) return "-"
  return str.substring(0, 16).replace("T", " ")
}
</script>

<template>
  <DataTable
    :value="rows"
    :loading="loading"
    paginator
    :rows="20"
    :totalRecords="pageInfo.totalPages * pageInfo.size"
    :first="pageInfo.page * pageInfo.size"
    @page="onPage"
    responsiveLayout="scroll"
    class="p-datatable-sm"
  >
    <Column field="assetName" header="자원명" />

    <Column field="reservationStartAt" header="예약 시작">
      <template #body="{ data }">
        {{ formatDate(data.reservationStartAt) }}
      </template>
    </Column>

    <Column field="reservationEndAt" header="예약 종료">
      <template #body="{ data }">
        {{ formatDate(data.reservationEndAt) }}
      </template>
    </Column>

    <Column field="reservationMinutes" header="예약 시간(분)" />

    <Column field="actualStartAt" header="실제 시작">
      <template #body="{ data }">
        {{ formatDate(data.actualStartAt) }}
      </template>
    </Column>

    <Column field="actualEndAt" header="실제 종료">
      <template #body="{ data }">
        {{ formatDate(data.actualEndAt) }}
      </template>
    </Column>

    <Column field="actualMinutes" header="실사용 시간(분)" />

    <Column field="usageRatio" header="사용률(%)">
      <template #body="{ data }">
        {{ (data.usageRatio * 100).toFixed(1) }}%
      </template>
    </Column>

  </DataTable>
</template>
