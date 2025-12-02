<template>
  <div class="category-page">
    <!-- 페이지 제목 -->
    <h2 class="page-title">자원 카테고리</h2>

    <!-- 카테고리 목록 테이블 -->
    <table class="category-table">
      <thead>
        <tr>
          <th>카테고리 번호</th>
          <th>카테고리 명</th>
          <th>개수</th>
          <th>생성자</th>
          <th>생성 날짜</th>
          <th>카테고리 설명</th>
          <th>편집</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in categories" :key="c.categoryId">
          <td>{{ c.categoryId }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.assetCount }}</td>
          <td>{{ resolveCreatedBy(c.createdBy) }}</td>
          <td>{{ formatDate(c.createdAt) }}</td>
          <td>{{ c.description }}</td>
          <td class="actions">
            <button class="edit-btn" @click.stop="editCategory(c)">수정</button>
            /
            <button class="delete-btn" @click.stop="deleteCategory(c)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="pagination-container">
      <button :disabled="page === 0" @click="changePage(page - 1)">〈</button>

      <button
        v-for="p in totalPages"
        :key="p"
        :class="['page-btn', { active: p - 1 === page }]"
        @click="changePage(p - 1)"
      >
        {{ p }}
      </button>

      <button :disabled="page + 1 >= totalPages" @click="changePage(page + 1)">〉</button>
    </div>

    <!-- 생성 버튼 -->
    <div>
      <button class="create-btn" @click="openCreateModal">카테고리 생성</button>

      <CategoryFormModal
        v-if="showCreateModal"
        title="카테고리 생성"
        submitText="등록"
        @submit="createCategory"
        @close="showCreateModal = false"
      />
    </div>

    <CategoryFormModal
      v-if="showEditModal"
      title="카테고리 수정"
      submitText="수정"
      :initialData="editTarget"
      @submit="updateCategory"
      @close="showEditModal = false"
    />

    <ConfirmModal
      v-if="showDeleteModal"
      title="카테고리 삭제"
      message="삭제하면 복구할 수 없습니다. 계속할까요?"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi } from '@/api/categoryApi'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import CategoryFormModal from './CategoryFormModal.vue'

// 상태
const categories = ref([])
const page = ref(0)
const size = ref(10)
const totalPages = ref(1)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const editTarget = ref(null)

const selectedCategory = ref(null)

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toISOString().split('T')[0]
}

// createdBy → 이름 매핑 (나중에 실제 값으로 대체)
function resolveCreatedBy(id) {
  return id ? '관리자' : '-'
}

// 데이터 로드
async function loadCategories() {
  const res = await categoryApi.getManagementList(page.value, size.value)
  categories.value = res.data.content
  totalPages.value = res.data.totalPages
}

// 페이지 이동
function changePage(newPage) {
  page.value = newPage
  loadCategories()
}

// 버튼 클릭 이벤트 (모달 작업은 다음 단계)
async function createCategory(data) {
  try {
    await categoryApi.create(data)
    alert('카테고리가 생성되었습니다.')

    await loadCategories()

    closeCreateModal()
  } catch (err) {
    console.error(err)
    alert('카테고리 생성 실패')
  }
}

async function updateCategory(data) {
  try {
    await categoryApi.update(editTarget.value.categoryId, data)
    alert('카테고리가 수정되었습니다.')

    showEditModal.value = false
    await loadCategories()
  } catch (err) {
    console.error(err)
    alert('수정 실패')
  }
}

async function confirmDelete() {
  try {
    await categoryApi.delete(selectedCategory.value.categoryId)
    showDeleteModal.value = false
    loadCategories()
  } catch (err) {
    alert(err.response?.data?.message || '삭제 실패')
  }
}

function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function editCategory(c) {
  editTarget.value = { ...c }
  showEditModal.value = true
}

function deleteCategory(c) {
  selectedCategory.value = c
  showDeleteModal.value = true
}

onMounted(loadCategories)
</script>

<style scoped>
.category-page {
  position: relative;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* 테이블 */
.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th {
  background: #f7f7f7;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.category-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.actions {
  color: #555;
}

.edit-btn {
  color: #2d6cdf;
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
}

.delete-btn {
  color: #d9534f;
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}
.page-btn {
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #b6ceb4;
  cursor: pointer;
  border-radius: 4px;
}

.page-btn.active {
  background: #b6ceb4; /* 사이드바 강조색 */
  border-color: #b6ceb4;
  color: #000;
}

/* 우측 하단 생성 버튼 */
.create-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #b6ceb4; /* 사이드바 강조색 */
  color: #000;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  outline: none;
}

.page-btn:hover,
.create-btn:hover {
  opacity: 0.85;
}
</style>
