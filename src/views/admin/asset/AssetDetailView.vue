<template>
  <div class="detail-wrapper">
    <!-- 왼쪽: 계층 구조 트리 -->
    <div class="tree-panel">
      <h3 class="tree-title">자원 상세 정보</h3>

      <ul class="tree-list">
        <li class="tree-root">🏢 {{ asset.parentName || '루트 자원' }}</li>
        <li>📍 {{ asset.name }}</li>
      </ul>
    </div>

    <!-- 오른쪽: 상세 정보 -->
    <div class="detail-panel">
      <!-- 이미지 -->
      <div class="image-area">
        <div class="image-box">
          <img v-if="asset.image" :src="asset.image" alt="asset image" />
          <div v-else class="image-placeholder">이미지 없음</div>
        </div>
      </div>

      <table class="detail-table">
        <tbody>
          <tr>
            <th>자원 명</th>
            <td>{{ asset.name }}</td>

            <th>자원 유형</th>
            <td>{{ convertType(asset.type) }}</td>
          </tr>

          <tr>
            <th>자원 상태</th>
            <td>{{ convertStatus(asset.status) }}</td>

            <th>카테고리</th>
            <td>{{ asset.categoryName }}</td>
          </tr>

          <tr>
            <th>예약 가능 여부</th>
            <td>{{ asset.available ? '예약 가능' : '불가' }}</td>

            <th>승인 유무</th>
            <td>{{ asset.approvalStatus ? '승인 필요' : '승인 불필요' }}</td>
          </tr>

          <tr>
            <th>시간당 청구 비용</th>
            <td>{{ formatPrice(asset.costPerHour) }}</td>

            <th>인가 단계</th>
            <td>{{ asset.accessLevel }}</td>
          </tr>

          <tr>
            <th>고정비</th>
            <td>{{ formatPrice(asset.periodCost) }}</td>

            <th>버전</th>
            <td>{{ asset.version || '-' }}</td>
          </tr>

          <tr>
            <th>자원 설명</th>
            <td colspan="3">{{ asset.description }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 하단 버튼들 -->
      <div class="bottom-btns">
        <button class="edit-btn" @click="goEdit">자원 수정</button>
        <button class="history-btn">자원 수정 이력 조회</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assetApi } from '@/api/assetApi'

const route = useRoute()
const router = useRouter()
const assetId = route.params.assetId

const asset = ref({})

async function loadDetail() {
  try {
    const res = await assetApi.getDetail(assetId)
    asset.value = res.data
  } catch (e) {
    console.error(e)
    alert('자원 정보를 불러오지 못했습니다.')
  }
}

function goEdit() {
  router.push(`/admin/assets/${assetId}/edit`)
}

// 표시 변환 함수들
const convertStatus = (status) => {
  return (
    {
      AVAILABLE: '사용 가능',
      UNAVAILABLE: '사용 불가',
      MAINTENANCE: '점검 중',
    }[status] || status
  )
}

const convertType = (type) => {
  return (
    {
      STATIC: '정적 자원',
      DYNAMIC: '업무기기',
    }[type] || type
  )
}

const formatPrice = (v) => (v != null ? `${v.toLocaleString()}원` : '-')

onMounted(loadDetail)
</script>

<style scoped>
.detail-wrapper {
  display: flex;
  width: 100%;
  gap: 40px;
}

/* 왼쪽 패널 */
.tree-panel {
  width: 250px;
  border-right: 1px solid #e5e5e5;
  padding-right: 20px;
}

.tree-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tree-list {
  list-style: none;
  padding-left: 0;
}

.tree-root {
  margin-bottom: 10px;
  font-weight: 700;
}

/* 오른쪽 상세 영역 */
.detail-panel {
  flex: 1;
}

.image-area {
  margin-bottom: 20px;
}

.image-box {
  width: 400px;
  height: 250px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: #999;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.detail-table th {
  background: #b9cdb4;
  padding: 12px;
  width: 160px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.detail-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.bottom-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.edit-btn,
.history-btn {
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #c7dbcc;
  background: #e6f0e6;
}
</style>
