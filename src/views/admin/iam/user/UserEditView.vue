<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { userApi } from "@/api/iam/userApi.js";
import { roleApi } from "@/api/iam/roleApi.js";

import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

const route = useRoute();
const router = useRouter();

const userId = Number(route.params.userId);

const user = ref(null);
const roleOptions = ref([]);

// ---------------------------------------------
// ✔ 가상 부서 목록 하드코딩 (1~10)
// ---------------------------------------------
const deptOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `부서 ${i + 1}`,
  value: i + 1
}));

const form = ref({
  roleId: null,
  dptId: null,
  retireDate: null
});

async function loadData() {
  // 사용자 정보
  const userRes = await userApi.getUser(userId);
  user.value = userRes.data;

  // 역할 목록
  const roles = await roleApi.getRoleList();
  roleOptions.value = roles.data.roles.map(r => ({
    label: r.roleName,
    value: r.roleId
  }));

  // 사용자 기존 값 세팅
  form.value.roleId = user.value.roleId;
  form.value.dptId = user.value.dptId ?? null;
  form.value.retireDate = user.value.retireDate
    ? new Date(user.value.retireDate)
    : null;
}

onMounted(loadData);

// ---------------------------------------------
// ✔ 저장 처리: 역할 수정 + dptId + retireDate
// ---------------------------------------------
async function save() {
  try {
    // 역할 업데이트
    await userApi.updateUserRole(userId, { roleId: form.value.roleId });

    // 부서 + 퇴사일 업데이트
    await userApi.updateUser(userId, {
      dptId: form.value.dptId,
      retireDate: form.value.retireDate
        ? form.value.retireDate.toISOString()
        : null
    });

    alert("사용자 정보가 수정되었습니다.");
    router.push("/admin/users");
  } catch (e) {
    console.error(e);
    alert("수정 중 오류 발생");
  }
}
</script>

<template>
  <div class="page">
    <h2>사용자 편집</h2>
    <p>관리자가 다른 사용자의 정보를 수정할 수 있는 화면입니다.</p>

    <div class="card" v-if="user">
      <h3>기본 정보</h3>
      <div class="grid">
        <div>
          <label>사원명</label>
          <InputText :model-value="user.userName" disabled />
        </div>
        <div>
          <label>이메일</label>
          <InputText :model-value="user.email" disabled />
        </div>
        <div>
          <label>연락처</label>
          <InputText :model-value="user.phone" disabled />
        </div>
      </div>

      <h3 style="margin-top: 24px">관리자 편집</h3>

      <div class="grid">
        <div>
          <label>역할</label>
          <Dropdown v-model="form.roleId" :options="roleOptions" />
        </div>

        <div>
          <label>부서</label>
          <Dropdown v-model="form.dptId" :options="deptOptions" placeholder="부서 선택" />
        </div>

        <div>
          <label>퇴사일</label>
          <Calendar v-model="form.retireDate" dateFormat="yy-mm-dd" />
        </div>
      </div>

      <div class="actions">
        <Button label="취소" class="p-button-secondary" @click="router.back()" />
        <Button label="저장" class="p-button-primary" @click="save" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 30px;
  max-width: 700px;
}
.grid {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
}
</style>
