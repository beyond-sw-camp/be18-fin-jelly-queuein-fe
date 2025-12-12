<template>
  <div class="s3-image-uploader">
    <!-- 이미지 미리보기 영역 -->
    <div v-if="imageUrl || previewUrl" class="image-preview" :class="{ 'has-error': errorMessage }">
      <img :src="previewUrl || imageUrl" alt="Preview" />
      <button class="remove-btn" @click="removeImage" type="button">
        <i class="pi pi-times"></i>
      </button>
      <!-- 기존 이미지가 있을 때 이미지 변경 버튼 -->
      <div v-if="imageUrl && !previewUrl && !isUploading" class="change-overlay">
        <button class="change-btn" @click="triggerFileInput" type="button">
          <i class="pi pi-pencil"></i>
          이미지 변경
        </button>
      </div>
      <!-- 업로드 실패 시 재시도 버튼 -->
      <div v-if="errorMessage && previewUrl && !imageUrl" class="retry-overlay">
        <button class="retry-btn" @click="retryUpload" type="button">
          <i class="pi pi-refresh"></i>
          다시 시도
        </button>
      </div>
    </div>

    <!-- 업로드 영역 -->
    <div
      v-if="!imageUrl && !previewUrl"
      class="upload-area"
      :class="{ 'drag-over': isDragOver, uploading: isUploading }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-content">
        <i class="pi pi-cloud-upload upload-icon"></i>
        <p class="upload-text">
          <span class="highlight">클릭하거나 드래그 앤 드롭</span>하여 이미지를 업로드하세요
        </p>
        <p class="upload-hint">PNG, JPG, GIF 파일 (최대 10MB)</p>
      </div>
    </div>

    <!-- 업로드 진행 중 -->
    <div v-if="isUploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="progress-text">업로드 중... {{ uploadProgress }}%</p>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="errorMessage" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/axios'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const previewUrl = ref('')
const imageUrl = ref(props.modelValue)
const currentFile = ref(null) // 현재 선택된 파일 저장 (재시도용)

// modelValue 변경 감지
watch(
  () => props.modelValue,
  (newValue) => {
    imageUrl.value = newValue
    if (!newValue) {
      previewUrl.value = ''
    }
  },
)

// 파일 선택 트리거
function triggerFileInput() {
  fileInput.value?.click()
}

// 드래그 오버
function handleDragOver(e) {
  e.preventDefault()
  isDragOver.value = true
}

// 드래그 리브
function handleDragLeave(e) {
  e.preventDefault()
  isDragOver.value = false
}

// 드롭
function handleDrop(e) {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

// 파일 선택
function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

// 파일 처리
async function processFile(file) {
  try {
    // 파일 존재 확인
    if (!file) {
      errorMessage.value = '파일을 선택해주세요.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }

    // 파일 이름 확인
    if (!file.name || file.name.trim() === '') {
      errorMessage.value = '파일 이름을 확인할 수 없습니다.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }

    // 파일 유효성 검사
    if (!file.type || !file.type.startsWith('image/')) {
      // 확장자 기반 재확인
      const extension = file.name.split('.').pop()?.toLowerCase()
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

      if (!extension || !imageExtensions.includes(extension)) {
        errorMessage.value = '이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WEBP, BMP, SVG)'
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
        return
      }
    }

    // 파일 크기 검사 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      errorMessage.value = `파일 크기는 10MB를 초과할 수 없습니다. (현재: ${fileSizeMB}MB)`
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }

    // 파일 크기가 0인지 확인
    if (file.size === 0) {
      errorMessage.value = '빈 파일은 업로드할 수 없습니다.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }

    // 현재 파일 저장 (재시도용)
    currentFile.value = file

    // 미리보기 생성
    try {
      const reader = new FileReader()
      reader.onerror = () => {
        errorMessage.value = '파일을 읽는 중 오류가 발생했습니다.'
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      }
      reader.onload = (e) => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (readError) {
      console.error('파일 읽기 실패:', readError)
      errorMessage.value = '파일을 읽는 중 오류가 발생했습니다.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }

    // 업로드 시작
    await uploadToS3(file)
  } catch (error) {
    console.error('파일 처리 실패:', error)
    errorMessage.value = error.message || '파일 처리 중 오류가 발생했습니다.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
}

// S3 업로드
async function uploadToS3(file) {
  try {
    isUploading.value = true
    uploadProgress.value = 0
    errorMessage.value = ''

    // 파일 확장자 추출
    const extension = file.name.split('.').pop().toLowerCase()

    // Content-Type이 없으면 확장자 기반으로 추정
    let contentType = file.type
    if (!contentType || contentType === '') {
      // 확장자 기반 Content-Type 매핑
      const extensionToType = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        bmp: 'image/bmp',
        svg: 'image/svg+xml',
      }
      contentType = extensionToType[extension] || 'application/octet-stream'
    }

    // 이미지 타입 정규화 (일부 브라우저에서 다른 형식으로 반환할 수 있음)
    if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
      contentType = 'image/jpeg'
    } else if (contentType === 'image/png') {
      contentType = 'image/png'
    } else if (contentType === 'image/gif') {
      contentType = 'image/gif'
    } else if (contentType === 'image/webp') {
      contentType = 'image/webp'
    }

    // 파라미터 검증
    if (!extension || extension === '') {
      throw new Error('파일 확장자를 확인할 수 없습니다.')
    }
    if (!contentType || contentType === '') {
      throw new Error('파일 타입을 확인할 수 없습니다.')
    }

    console.log('📤 업로드 파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type,
      contentType,
      extension,
    })

    // 1. Pre-signed URL 요청
    uploadProgress.value = 20

    try {
      const urlResponse = await api.post('/assets/images/upload-url', null, {
        params: {
          extension,
          contentType,
        },
        headers: {
          'Content-Type': 'application/json', // 명시적으로 JSON 요청임을 표시
        },
      })

      const { uploadUrl, fileUrl, contentType: serverContentType } = urlResponse.data
      console.log('📋 Presigned URL 받음:', { uploadUrl, fileUrl, serverContentType })

      // 백엔드에서 반환한 Content-Type이 있으면 그것을 사용 (더 정확함)
      const finalContentType = serverContentType || contentType
      console.log('✅ 최종 사용할 Content-Type:', finalContentType)

      // Presigned URL에서 SignedHeaders 파싱
      const urlObj = new URL(uploadUrl)
      const signedHeaders = urlObj.searchParams.get('X-Amz-SignedHeaders')
      console.log('🔍 SignedHeaders:', signedHeaders)
      console.log('🔍 Presigned URL 전체:', uploadUrl)

      // 2. S3에 직접 업로드
      uploadProgress.value = 50

      // 헤더 구성 - SignedHeaders에 포함된 헤더만 정확히 일치시켜야 함
      // Content-Type은 SignedHeaders에 포함되어 있으므로 반드시 포함해야 함
      // 백엔드에서 반환한 Content-Type을 우선 사용
      const headers = {
        'Content-Type': finalContentType,
      }

      console.log('📤 업로드 헤더:', headers)
      console.log('📤 사용할 Content-Type:', finalContentType)
      console.log('📤 원본 파일 타입:', file.type)
      console.log('📤 프론트엔드에서 보낸 Content-Type:', contentType)

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: headers,
      })

      console.log('📡 S3 업로드 응답:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        ok: uploadResponse.ok,
      })

      if (!uploadResponse.ok) {
        // 에러 응답 본문 읽기
        let errorText = ''
        let s3ErrorCode = ''
        let s3ErrorMessage = ''

        try {
          errorText = await uploadResponse.text()
          console.error('❌ S3 업로드 에러 응답:', errorText)

          // XML 파싱 시도 (S3는 XML 형식으로 에러 반환)
          if (errorText.includes('<Error>')) {
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(errorText, 'text/xml')
            s3ErrorCode = xmlDoc.querySelector('Code')?.textContent || ''
            s3ErrorMessage = xmlDoc.querySelector('Message')?.textContent || ''
            const requestId = xmlDoc.querySelector('RequestId')?.textContent || ''
            const resource = xmlDoc.querySelector('Resource')?.textContent || ''

            console.error('❌ S3 에러 코드:', s3ErrorCode)
            console.error('❌ S3 에러 메시지:', s3ErrorMessage)
            console.error('❌ S3 RequestId:', requestId)
            console.error('❌ S3 Resource:', resource)

            errorText = s3ErrorMessage || errorText
          }
        } catch (e) {
          console.error('❌ 에러 응답 읽기 실패:', e)
        }

        // 상세 디버깅 정보
        console.error('❌ 업로드 실패 상세:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          s3ErrorCode,
          s3ErrorMessage,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          errorText,
          uploadUrl: uploadUrl.substring(0, 100) + '...', // URL 일부만 표시
          contentType: finalContentType,
        })

        // S3 에러 코드 기반 상세 에러 메시지 생성
        let detailedError = `S3 업로드 실패 (${uploadResponse.status})`
        if (s3ErrorCode) {
          detailedError += ` [${s3ErrorCode}]`
        }
        if (s3ErrorMessage) {
          detailedError += `: ${s3ErrorMessage}`
        } else if (errorText) {
          detailedError += `: ${errorText}`
        } else {
          detailedError += ': 알 수 없는 오류'
        }

        throw new Error(detailedError)
      }

      uploadProgress.value = 100

      // 3. 성공 시 fileUrl을 부모 컴포넌트에 전달
      imageUrl.value = fileUrl
      emit('update:modelValue', fileUrl)

      // 성공 시 에러 메시지 및 현재 파일 초기화
      errorMessage.value = ''
      currentFile.value = null

      ElMessage.success('이미지가 업로드되었습니다.')
    } catch (apiError) {
      // Presigned URL 요청 실패 처리
      console.error('❌ Presigned URL 요청 실패:', apiError)

      if (apiError.response) {
        // HTTP 응답이 있는 경우
        const status = apiError.response.status
        const data = apiError.response.data
        console.error('❌ 응답 상태:', status)
        console.error('❌ 응답 데이터:', data)

        let errorMessage = `Presigned URL 요청 실패 (${status})`
        if (data?.message) {
          errorMessage += `: ${data.message}`
        } else if (data?.error) {
          errorMessage += `: ${data.error}`
        } else if (typeof data === 'string') {
          errorMessage += `: ${data}`
        } else if (apiError.message) {
          errorMessage += `: ${apiError.message}`
        }

        throw new Error(errorMessage)
      } else if (apiError.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러)
        console.error('❌ 네트워크 에러: 응답을 받지 못했습니다.')
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.')
      } else if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
        // 타임아웃 에러
        console.error('❌ 타임아웃 에러')
        throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.')
      } else {
        // 기타 에러
        throw apiError
      }
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error)

    // 더 자세한 에러 메시지 표시
    let errorMsg = '이미지 업로드에 실패했습니다. 다시 시도해주세요.'

    if (error.message) {
      // Presigned URL 요청 실패 (백엔드 권한 문제 가능)
      if (error.message.includes('Presigned URL 요청 실패')) {
        const statusMatch = error.message.match(/Presigned URL 요청 실패 \((\d+)\)/)
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : null

        if (statusCode === 401) {
          errorMsg = '로그인이 필요합니다. 다시 로그인해주세요.'
        } else if (statusCode === 403) {
          errorMsg = '업로드 URL 생성 권한이 없습니다. 관리자에게 문의해주세요.'
        } else if (statusCode === 404) {
          errorMsg = '업로드 URL 생성 API를 찾을 수 없습니다. 관리자에게 문의해주세요.'
        } else if (statusCode === 500 || statusCode === 503) {
          errorMsg = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message.includes('네트워크 연결에 실패')) {
          errorMsg = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
        } else if (error.message.includes('요청 시간이 초과')) {
          errorMsg = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
        } else {
          // 에러 메시지에서 실제 메시지 추출
          const messageMatch = error.message.match(/Presigned URL 요청 실패 \([\d]+\): (.+)/)
          if (messageMatch && messageMatch[1]) {
            errorMsg = messageMatch[1]
          } else {
            errorMsg = error.message.replace('Presigned URL 요청 실패: ', '')
          }
        }
      }
      // 네트워크 에러
      else if (error.message.includes('네트워크') || error.message.includes('Network')) {
        errorMsg = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
      }
      // 타임아웃 에러
      else if (error.message.includes('timeout') || error.message.includes('타임아웃')) {
        errorMsg = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
      }
      // S3 업로드 실패 (Presigned URL 문제 또는 Content-Type 불일치)
      else if (error.message.includes('S3 업로드 실패')) {
        const statusMatch = error.message.match(/S3 업로드 실패 \((\d+)/)
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : null

        // S3 에러 코드 추출
        const s3CodeMatch = error.message.match(/\[([^\]]+)\]/)
        const s3ErrorCode = s3CodeMatch ? s3CodeMatch[1] : null

        // S3 에러 메시지 추출
        const messageMatch = error.message.match(/: (.+)$/)
        const s3Message = messageMatch ? messageMatch[1] : null

        // S3 에러 코드별 처리
        if (s3ErrorCode) {
          switch (s3ErrorCode) {
            case 'SignatureDoesNotMatch':
              errorMsg = '업로드 링크가 만료되었거나 잘못되었습니다. 다시 시도해주세요.'
              break
            case 'AccessDenied':
              // IAM 권한 문제인지 확인
              if (s3Message) {
                // IAM 사용자 정보 추출
                const userMatch = s3Message.match(/User: ([^\s]+)/)
                const iamUser = userMatch ? userMatch[1] : null

                // 권한 액션 추출
                const actionMatch = s3Message.match(/perform: ([^\s]+)/)
                const action = actionMatch ? actionMatch[1] : null

                // 리소스 추출
                const resourceMatch = s3Message.match(/resource: "([^"]+)"/)
                const resource = resourceMatch ? resourceMatch[1] : null

                if (s3Message.includes('not authorized to perform')) {
                  if (action === 's3:PutObject') {
                    errorMsg =
                      '이미지 업로드 권한이 없습니다. 서버 설정 문제로 업로드할 수 없습니다. 관리자에게 문의해주세요.'
                  } else if (action === 's3:GetObject') {
                    errorMsg =
                      '이미지 조회 권한이 없습니다. 서버 설정 문제로 이미지를 불러올 수 없습니다. 관리자에게 문의해주세요.'
                  } else if (action) {
                    errorMsg =
                      '이미지 서비스 접근 권한이 없습니다. 서버 설정 문제입니다. 관리자에게 문의해주세요.'
                  } else {
                    errorMsg =
                      '이미지 서비스 접근 권한이 없습니다. 서버 설정 문제입니다. 관리자에게 문의해주세요.'
                  }

                  // 디버깅 정보 추가
                  if (iamUser) {
                    console.error('❌ IAM 사용자:', iamUser)
                  }
                  if (action) {
                    console.error('❌ 필요한 권한:', action)
                  }
                  if (resource) {
                    console.error('❌ 리소스:', resource)
                  }
                } else if (s3Message.includes('bucket policy')) {
                  errorMsg =
                    '이미지 저장소 접근이 거부되었습니다. 서버 설정 문제입니다. 관리자에게 문의해주세요.'
                } else if (s3Message.includes('CORS')) {
                  errorMsg =
                    '이미지 업로드가 차단되었습니다. 서버 설정 문제입니다. 관리자에게 문의해주세요.'
                } else if (s3Message.includes('identity-based policy')) {
                  errorMsg =
                    '이미지 업로드 권한이 없습니다. 서버 설정 문제입니다. 관리자에게 문의해주세요.'
                } else {
                  errorMsg = '이미지 업로드가 거부되었습니다. 관리자에게 문의해주세요.'
                }
              } else {
                errorMsg = '이미지 업로드가 거부되었습니다. 관리자에게 문의해주세요.'
              }
              break
            case 'ExpiredToken':
              errorMsg = '업로드 링크가 만료되었습니다. 다시 시도해주세요.'
              break
            case 'InvalidRequest':
              errorMsg = '잘못된 요청입니다. 파일 형식이나 요청 내용을 확인해주세요.'
              break
            case 'InvalidArgument':
              errorMsg = '잘못된 파일 형식입니다. 이미지 파일인지 확인해주세요.'
              break
            case 'EntityTooLarge':
              errorMsg = '파일 크기가 너무 큽니다. (최대 10MB)'
              break
            case 'InvalidAccessKeyId':
              errorMsg = '이미지 저장소 접근 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
              break
            case 'InvalidSecurity':
              errorMsg = '보안 인증에 실패했습니다. 관리자에게 문의해주세요.'
              break
            case 'RequestTimeout':
              errorMsg = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
              break
            case 'ServiceUnavailable':
              errorMsg = '이미지 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
              break
            case 'SlowDown':
              errorMsg = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
              break
            default:
              errorMsg = s3Message || `이미지 업로드 실패 (${s3ErrorCode}). 다시 시도해주세요.`
          }
        }
        // HTTP 상태 코드별 처리 (S3 에러 코드가 없는 경우)
        else if (statusCode) {
          switch (statusCode) {
            case 400:
              errorMsg = '잘못된 요청입니다. 파일 형식이나 요청 내용을 확인해주세요.'
              break
            case 403:
              // S3 403은 권한 문제가 아니라 서명/Content-Type 불일치일 가능성이 높음
              if (s3Message && s3Message.includes('signature')) {
                errorMsg = '업로드 링크가 만료되었거나 잘못되었습니다. 다시 시도해주세요.'
              } else if (s3Message && s3Message.includes('expired')) {
                errorMsg = '업로드 링크가 만료되었습니다. 다시 시도해주세요.'
              } else {
                errorMsg =
                  '이미지 업로드에 실패했습니다. 파일 형식이나 업로드 링크 문제일 수 있습니다. 다시 시도해주세요.'
              }
              break
            case 404:
              errorMsg = '업로드 경로를 찾을 수 없습니다. 관리자에게 문의해주세요.'
              break
            case 413:
            case 416:
              errorMsg = '파일 크기가 너무 큽니다. (최대 10MB)'
              break
            case 500:
            case 503:
              errorMsg = '이미지 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
              break
            case 504:
              errorMsg = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
              break
            default:
              errorMsg = s3Message || `이미지 업로드 실패 (HTTP ${statusCode}). 다시 시도해주세요.`
          }
        }
        // 에러 메시지가 있는 경우
        else if (s3Message && s3Message !== '알 수 없는 오류') {
          errorMsg = `이미지 업로드 실패: ${s3Message}`
        } else {
          errorMsg = '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
        }
      }
      // 기타 에러
      else {
        errorMsg = error.message
      }
    }

    errorMessage.value = errorMsg
    // 업로드 실패해도 미리보기는 유지 (previewUrl.value = '' 제거)
    ElMessage.error(errorMsg)
  } finally {
    isUploading.value = false
    setTimeout(() => {
      uploadProgress.value = 0
    }, 500)
  }
}

// 재시도 업로드
async function retryUpload() {
  if (currentFile.value) {
    errorMessage.value = ''
    await uploadToS3(currentFile.value)
  }
}

// 이미지 제거
function removeImage() {
  imageUrl.value = ''
  previewUrl.value = ''
  currentFile.value = null
  errorMessage.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.s3-image-uploader {
  width: 100%;
}

/* 이미지 미리보기 */
.image-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
}

.image-preview.has-error {
  border-color: #fecaca;
  border-width: 2px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* 업로드 영역 */
.upload-area {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #00a950;
  background: #f0fdf4;
}

.upload-area.drag-over {
  border-color: #00a950;
  background: #dcfce7;
  transform: scale(1.02);
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
}

.upload-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
  display: block;
}

.upload-area:hover .upload-icon,
.upload-area.drag-over .upload-icon {
  color: #00a950;
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.upload-text {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 8px;
}

.highlight {
  color: #00a950;
  font-weight: 600;
}

.upload-hint {
  font-size: 14px;
  color: #9ca3af;
}

/* 업로드 진행 바 */
.upload-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a950, #10b981);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

/* 에러 메시지 */
.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message i {
  font-size: 16px;
}

/* 재시도 오버레이 */
.retry-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.retry-btn {
  padding: 12px 24px;
  background: #00a950;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #008a42;
  transform: scale(1.05);
}

.retry-btn i {
  font-size: 16px;
}

/* 이미지 변경 오버레이 */
.change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .change-overlay {
  opacity: 1;
}

.change-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.change-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.change-btn i {
  font-size: 16px;
}
</style>
