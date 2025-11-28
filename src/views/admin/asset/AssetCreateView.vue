<template>
  <div>
    <AssetForm :initialData="defaultForm" submitText="자원 생성" :onSubmit="createAsset" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AssetForm from './components/AssetForm.vue'
import { assetApi } from '@/api/assetApi'
import { ref } from 'vue'

const router = useRouter()

// 생성할 때 사용하는 기본 폼 값
const defaultForm = ref({
  parentName: '',
  name: '',
  categoryId: null,
  type: '',
  status: '',
  available: true,
  approved: true,
  approvalLevel: 1,
  pricePerHour: 0,
  fixedCost: 0,
  description: '',
  image: '',
})

async function createAsset(data) {
  const payload = {
    parentName: data.parentName,
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    image: data.image,
    status: data.status,
    type: data.type,
    accessLevel: Number(data.accessLevel),
    approvalStatus: Boolean(data.approvalStatus),
    costPerHour: Number(data.costPerHour),
    periodCost: Number(data.periodCost),
  }

  console.log('form data:', data)

  console.log('📌 실제 axios 보낸 payload:', JSON.stringify(data, null, 2))
  await assetApi.create(payload)
  router.push('/admin/assets')
}
</script>
