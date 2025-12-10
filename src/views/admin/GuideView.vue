<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

// multiple이 true일 때는 배열이어야 함
const activeIndex = ref([0])
</script>

<template>
  <div class="guide-view">
    <div class="guide-header">
      <h1 class="guide-title">
        <i class="pi pi-book"></i>
        QueueIn 관리자 가이드
      </h1>
      <p class="guide-subtitle">QueueIn 관리자 시스템을 효율적으로 사용하는 방법을 안내합니다.</p>
    </div>

    <Card class="guide-card">
      <template #content>
        <Accordion v-model:activeIndex="activeIndex" multiple>
          <!-- 사용자 관리 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-users"></i>
                <span>사용자 관리</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>1. 사용자 목록 조회</h3>
              <p>좌측 사이드바의 <strong>"사용자 관리"</strong> 메뉴를 클릭하면 전체 사용자 목록을 확인할 수 있습니다.</p>
              
              <h3>2. 사용자 생성</h3>
              <ul>
                <li>사용자 목록 페이지에서 <strong>"사용자 등록"</strong> 버튼을 클릭합니다.</li>
                <li>필수 정보를 입력합니다: 이름, 이메일, 전화번호, 역할 등</li>
                <li>생성된 사용자는 임시 비밀번호로 로그인할 수 있습니다.</li>
              </ul>
              
              <h3>3. 사용자 수정</h3>
              <ul>
                <li>사용자 목록에서 수정하고 싶은 사용자를 선택합니다.</li>
                <li><strong>"수정"</strong> 버튼을 클릭하여 정보를 변경합니다.</li>
                <li>사용자의 역할을 변경할 수 있습니다.</li>
              </ul>
              
              <h3>4. 사용자 삭제</h3>
              <p>사용자 목록에서 삭제하고 싶은 사용자를 선택하고 <strong>"삭제"</strong> 버튼을 클릭합니다. (주의: 삭제된 사용자는 복구할 수 없습니다.)</p>
            </div>
          </AccordionTab>

          <!-- 역할 & 권한 관리 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-shield"></i>
                <span>역할 & 권한 관리</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>1. 역할 관리</h3>
              <ul>
                <li><strong>역할 목록 조회</strong>: 좌측 사이드바의 <strong>"역할 관리"</strong> 메뉴를 클릭합니다.</li>
                <li><strong>역할 생성</strong>: <strong>"역할 추가"</strong> 버튼을 클릭하여 새로운 역할을 생성합니다.</li>
                <li><strong>역할 수정</strong>: 역할 카드의 <strong>"⋯"</strong> 메뉴에서 수정/삭제를 선택합니다.</li>
              </ul>
              
              <h3>2. 권한 관리</h3>
              <ul>
                <li>좌측 사이드바의 <strong>"권한 관리"</strong> → <strong>"역할-권한 매핑"</strong> 메뉴를 클릭합니다.</li>
                <li>각 역할에 대해 권한을 체크박스로 할당/해제할 수 있습니다.</li>
                <li>변경사항은 <strong>"저장"</strong> 버튼을 클릭하여 적용합니다.</li>
              </ul>
              
              <h3>3. 권한 종류</h3>
              <ul>
                <li><strong>IAM_USER_*</strong>: 사용자 관리 권한 (생성, 조회, 수정, 삭제)</li>
                <li><strong>IAM_ROLE_*</strong>: 역할 관리 권한</li>
                <li><strong>IAM_PERMISSION_*</strong>: 권한 관리 권한</li>
                <li>기타 도메인별 권한들</li>
              </ul>
              
              <div class="tip-box">
                <i class="pi pi-info-circle"></i>
                <strong>팁:</strong> 권한은 역할 단위로 관리되며, 사용자는 역할을 통해 권한을 상속받습니다.
              </div>
            </div>
          </AccordionTab>

          <!-- 자원 관리 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-box"></i>
                <span>자원 관리</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>1. 자원 목록 조회</h3>
              <p>좌측 사이드바의 <strong>"자원 관리"</strong> 메뉴를 클릭하면 계층 구조로 자원 목록을 확인할 수 있습니다.</p>
              
              <h3>2. 자원 생성</h3>
              <ul>
                <li><strong>"자원 등록"</strong> 버튼을 클릭합니다.</li>
                <li>자원 정보를 입력합니다: 이름, 타입, 카테고리, 위치 등</li>
                <li>부모 자원을 선택하여 계층 구조를 설정할 수 있습니다.</li>
              </ul>
              
              <h3>3. 자원 수정/삭제</h3>
              <ul>
                <li>자원 목록에서 수정/삭제하고 싶은 자원을 선택합니다.</li>
                <li>자원 상세 페이지에서 <strong>"수정"</strong> 또는 <strong>"삭제"</strong> 버튼을 클릭합니다.</li>
              </ul>
              
              <h3>4. 카테고리 관리</h3>
              <p>자원 관리 페이지에서 <strong>"카테고리 관리"</strong> 메뉴를 통해 자원 카테고리를 관리할 수 있습니다.</p>
            </div>
          </AccordionTab>

          <!-- 예약 관리 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-calendar-check"></i>
                <span>예약 관리</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>1. 신청 예약 조회</h3>
              <p>좌측 사이드바의 <strong>"신청 예약 관리"</strong> 메뉴를 클릭하면 승인 대기 중인 예약 목록을 확인할 수 있습니다.</p>
              
              <h3>2. 예약 승인/거부</h3>
              <ul>
                <li>예약 목록에서 승인/거부하고 싶은 예약을 선택합니다.</li>
                <li><strong>"승인"</strong> 또는 <strong>"거부"</strong> 버튼을 클릭합니다.</li>
                <li>거부 시 사유를 입력할 수 있습니다.</li>
              </ul>
              
              <h3>3. 예약 필터링</h3>
              <p>날짜, 자원명, 상태 등으로 예약을 필터링하여 조회할 수 있습니다.</p>
              
              <div class="warning-box">
                <i class="pi pi-exclamation-triangle"></i>
                <strong>주의:</strong> 예약을 거부할 경우 사용자에게 알림이 전송됩니다. 신중하게 결정하세요.
              </div>
            </div>
          </AccordionTab>

          <!-- 정산 관리 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-chart-line"></i>
                <span>정산 관리</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>1. 자원 사용 기록</h3>
              <p>정산 메뉴의 <strong>"자원 사용 기록"</strong>에서 모든 자원 사용 내역을 조회할 수 있습니다.</p>
              
              <h3>2. 사용 추이 분석</h3>
              <p><strong>"사용 추이"</strong> 메뉴에서 시간대별, 기간별 자원 사용 추이를 그래프로 확인할 수 있습니다.</p>
              
              <h3>3. 운영 성과 분석</h3>
              <ul>
                <li><strong>"운영 성과 분석"</strong> 메뉴에서 연도별, 자원별 성과를 비교 분석할 수 있습니다.</li>
                <li>절감액, 사용률 등 다양한 지표를 확인할 수 있습니다.</li>
              </ul>
              
              <h3>4. 분기 정산</h3>
              <p><strong>"분기 정산"</strong> 메뉴에서 분기별 정산 내역을 조회하고 엑셀로 다운로드할 수 있습니다.</p>
            </div>
          </AccordionTab>

          <!-- 자주 묻는 질문 -->
          <AccordionTab>
            <template #header>
              <div class="tab-header">
                <i class="pi pi-question-circle"></i>
                <span>자주 묻는 질문 (FAQ)</span>
              </div>
            </template>
            <div class="tab-content">
              <h3>Q1. 사용자에게 권한을 부여하려면 어떻게 하나요?</h3>
              <p>A: 사용자의 역할을 변경하면 됩니다. 역할은 권한 관리에서 관리되며, 역할에 할당된 권한이 사용자에게 자동으로 적용됩니다.</p>
              
              <h3>Q2. 예약 승인 기준은 무엇인가요?</h3>
              <p>A: 예약 승인은 관리자의 판단에 따라 결정됩니다. 자원의 가용성, 사용 목적 등을 고려하여 승인하세요.</p>
              
              <h3>Q3. 자원을 삭제하면 예약도 함께 삭제되나요?</h3>
              <p>A: 자원을 삭제하면 해당 자원과 관련된 예약도 함께 삭제됩니다. 신중하게 삭제하세요.</p>
              
              <h3>Q4. 통계 데이터는 언제 업데이트되나요?</h3>
              <p>A: 통계 데이터는 실시간으로 업데이트됩니다. 예약이 생성/완료되면 즉시 반영됩니다.</p>
              
              <h3>Q5. 사용자가 비밀번호를 잊어버렸을 때는?</h3>
              <p>A: 사용자 관리 페이지에서 해당 사용자의 비밀번호를 재설정할 수 있습니다. 또는 사용자에게 임시 비밀번호를 발급할 수 있습니다.</p>
            </div>
          </AccordionTab>
        </Accordion>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.guide-view {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.guide-header {
  margin-bottom: 32px;
  text-align: center;
}

.guide-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.guide-title i {
  font-size: 36px;
  color: #3b82f6;
}

.guide-subtitle {
  font-size: 16px;
  color: #6b7280;
}

.guide-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
}

.tab-header i {
  font-size: 20px;
  color: #3b82f6;
}

.tab-content {
  padding: 16px 0;
}

.tab-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-top: 24px;
  margin-bottom: 12px;
}

.tab-content h3:first-child {
  margin-top: 0;
}

.tab-content p {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 12px;
}

.tab-content ul {
  color: #4b5563;
  line-height: 1.8;
  margin-left: 20px;
  margin-bottom: 16px;
}

.tab-content li {
  margin-bottom: 8px;
}

.tip-box,
.warning-box {
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tip-box {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.tip-box i {
  color: #3b82f6;
  font-size: 20px;
  flex-shrink: 0;
}

.warning-box {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.warning-box i {
  color: #f59e0b;
  font-size: 20px;
  flex-shrink: 0;
}

/* PrimeVue Accordion 커스터마이징 */
:deep(.p-accordion-header) {
  border-radius: 8px;
  margin-bottom: 8px;
}

:deep(.p-accordion-header-link) {
  padding: 16px 20px;
  border-radius: 8px;
}

:deep(.p-accordion-content) {
  padding: 0 20px 20px 20px;
}

@media (max-width: 768px) {
  .guide-view {
    padding: 16px;
  }

  .guide-title {
    font-size: 24px;
    flex-direction: column;
  }
}
</style>

