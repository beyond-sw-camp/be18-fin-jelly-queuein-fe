<script setup>
import { ref, watch, nextTick } from "vue"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import Calendar from "primevue/calendar"
import { userApi } from "@/api/iam/userApi.js"

const props = defineProps({ visible: Boolean })
const emit = defineEmits(["close", "created"])

// ----------------------------
// 부서 목록
// ----------------------------
const departmentOptions = [
  { label: "개발 1팀", value: 1 },
  { label: "개발 2팀", value: 2 },
  { label: "인사팀", value: 3 },
  { label: "재무팀", value: 4 }
]

// ----------------------------
// 폼 데이터 + 에러
// ----------------------------
const form = ref({
  dptId: null,
  userName: "",
  email: "",
  hireDate: null,
  phone: "",
  birthYear: null,
  birthMonth: null,
  birthDay: null
})

const errors = ref({
  dptId: "",
  userName: "",
  email: "",
  hireDate: "",
  phone: "",
  birth: ""
})

// ----------------------------
// 전화번호 하이픈 + 길이 제한
// ----------------------------
function autoPhone(raw) {
  if (!raw) return ""
  let digits = raw.replace(/\D/g, "").slice(0, 11) // 딱 11자리 제한

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return digits.replace(/(\d{3})(\d{1,4})/, "$1-$2")
  return digits.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3")
}

watch(
  () => form.value.phone,
  val => form.value.phone = autoPhone(val)
)

// ----------------------------
// 날짜 목록 생성
// ----------------------------
const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => ({
  label: String(2025 - i),
  value: 2025 - i
}))

const months = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1
}))

const days = ref([])

watch(
  () => [form.value.birthYear, form.value.birthMonth],
  ([y, m]) => {
    if (!y || !m) {
      days.value = []
      form.value.birthDay = null
      return
    }

    const last = new Date(y, m, 0).getDate()
    days.value = Array.from({ length: last }, (_, i) => ({
      label: String(i + 1),
      value: i + 1
    }))
  }
)

// ----------------------------
// 검색 → 엔터 → 정확한 값 반영
// (PrimeVue filter-input 직접 제어 방식)
// ----------------------------
async function handleEnterSelect(event, options, setter) {
  await nextTick()

  const input = event.target
  const query = input.value.trim()

  if (!query) return

  // 입력값 일치 항목 찾기
  const matched = options.find(op => op.label === query)

  if (matched) {
    setter(matched.value)
  }

  // filterInput 초기화 & 드롭다운 닫기
  input.value = ""
  input.blur()
}

// ----------------------------
// 초기화
// ----------------------------
function resetForm() {
  form.value = {
    dptId: null,
    userName: "",
    email: "",
    hireDate: null,
    phone: "",
    birthYear: null,
    birthMonth: null,
    birthDay: null
  }

  errors.value = {
    dptId: "",
    userName: "",
    email: "",
    hireDate: "",
    phone: "",
    birth: ""
  }
}

// ----------------------------
// 저장
// ----------------------------
async function submit() {
  errors.value = {
    dptId: "",
    userName: "",
    email: "",
    hireDate: "",
    phone: "",
    birth: ""
  }

  if (!form.value.dptId) errors.value.dptId = "부서를 선택해주세요."
  if (!form.value.userName) errors.value.userName = "이름을 입력해주세요."
  if (!form.value.email) errors.value.email = "이메일을 입력해주세요."
  if (form.value.email && !form.value.email.includes("@"))
    errors.value.email = "이메일 형식이 올바르지 않습니다."
  if (!form.value.hireDate) errors.value.hireDate = "입사일을 선택해주세요."

  const hasErr = Object.values(errors.value).some(e => e)
  if (hasErr) return


  // 전화번호 검증
  let phone = null
  if (form.value.phone) {
    const digits = form.value.phone.replace(/\D/g, "")
    if (digits.length !== 11 || !digits.startsWith("010")) {
      errors.value.phone = "전화번호는 010으로 시작하는 11자리여야 합니다."
      return
    }
    phone = form.value.phone
  }

  // 생년월일 검증
  let birth = null
  if (form.value.birthYear || form.value.birthMonth || form.value.birthDay) {
    if (!form.value.birthYear || !form.value.birthMonth || !form.value.birthDay) {
      errors.value.birth = "생년·월·일을 모두 선택해주세요."
      return
    }
    birth = `${form.value.birthYear}-${String(form.value.birthMonth).padStart(2, "0")}-${String(form.value.birthDay).padStart(2, "0")}`
  }

  const payload = {
    dptId: form.value.dptId,
    userName: form.value.userName,
    email: form.value.email,
    hireDate: form.value.hireDate.toISOString().slice(0, 10),
    phone,
    birth
  }

  await userApi.createUser(payload)

  emit("created")
  emit("close")
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="사용자 등록"
    :style="{ width: '480px' }"
    @update:visible="emit('close')"
  >
    <div class="form">

      <!-- 부서 -->
      <label>부서</label>
      <Dropdown
        v-model="form.dptId"
        :options="departmentOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="부서를 선택하세요"
        class="input"
        :class="{ invalid: errors.dptId }"
      />
      <p v-if="errors.dptId" class="error">{{ errors.dptId }}</p>

      <!-- 이름 -->
      <label>이름</label>
      <InputText
        v-model="form.userName"
        class="input"
        :class="{ invalid: errors.userName }"
      />
      <p v-if="errors.userName" class="error">{{ errors.userName }}</p>

      <!-- 이메일 -->
      <label>이메일</label>
      <InputText
        v-model="form.email"
        class="input"
        :class="{ invalid: errors.email }"
      />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>

      <!-- 입사일 -->
      <label>입사일</label>
      <Calendar
        v-model="form.hireDate"
        dateFormat="yy-mm-dd"
        class="input"
        :class="{ invalid: errors.hireDate }"
      />
      <p v-if="errors.hireDate" class="error">{{ errors.hireDate }}</p>

      <!-- 연락처 -->
      <label>연락처(선택)</label>
      <InputText
        v-model="form.phone"
        class="input"
        placeholder="예: 010-1234-5678"
        maxlength="13"
        :class="{ invalid: errors.phone }"
      />
      <p v-if="errors.phone" class="error">{{ errors.phone }}</p>

      <!-- 생년월일 -->
      <label>생년월일(선택)</label>
      <div class="birth-row">

        <!-- 년도 -->
        <Dropdown
          v-model="form.birthYear"
          :options="years"
          optionLabel="label"
          optionValue="value"
          placeholder="년도"
          filter
          @keydown.enter="handleEnterSelect($event, years, v => form.birthYear = v)"
          class="birth-select"
        />

        <!-- 월 -->
        <Dropdown
          v-model="form.birthMonth"
          :options="months"
          optionLabel="label"
          optionValue="value"
          placeholder="월"
          filter
          @keydown.enter="handleEnterSelect($event, months, v => form.birthMonth = v)"
          class="birth-select"
        />

        <!-- 일 -->
        <Dropdown
          v-model="form.birthDay"
          :options="days"
          optionLabel="label"
          optionValue="value"
          placeholder="일"
          filter
          @keydown.enter="handleEnterSelect($event, days, v => form.birthDay = v)"
          class="birth-select"
        />

      </div>
      <p v-if="errors.birth" class="error">{{ errors.birth }}</p>

      <div class="actions">
        <Button label="초기화" text @click="resetForm" />
        <Button label="취소" text @click="emit('close')" />
        <Button label="등록" @click="submit" />
      </div>

    </div>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.input {
  width: 100%;
}
.birth-row {
  display: flex;
  gap: 10px;
}
.birth-select {
  flex: 1;
}
.error {
  color: #d92d20;
  font-size: 13px;
  margin-top: -6px;
}
.invalid {
  border-color: #d92d20 !important;
}
.actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
