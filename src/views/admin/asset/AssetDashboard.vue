<template>
  <div class="asset-dashboard">
    <h2 class="page-title">자원 대시보드</h2>

    <!-- 차트 타입 선택 -->
    <div class="chart-type-selector">
      <button
        v-for="type in chartTypes"
        :key="type.value"
        :class="['chart-type-btn', { active: selectedChartType === type.value }]"
        @click="selectChartType(type.value)"
      >
        <i :class="type.icon"></i>
        {{ type.label }}
      </button>
    </div>

    <!-- 차트 컨테이너 -->
    <div class="chart-wrapper">
      <div ref="chartContainerRef" class="chart-container"></div>

      <!-- 로딩 오버레이 -->
      <div v-if="isLoading" class="loading-overlay">
        <i class="ri-loader-4-line spinning"></i>
        <p>데이터를 불러오는 중...</p>
      </div>
    </div>

    <!-- 새로고침 버튼 -->
    <div class="dashboard-actions">
      <button class="refresh-btn" @click="loadData" :disabled="isLoading">
        <i class="ri-refresh-line" :class="{ spinning: isLoading }"></i>
        새로고침
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { assetApi } from '@/api/assetApi'
import * as echarts from 'echarts'

// 차트 타입 정의
const chartTypes = [
  { value: 'tree', label: '트리', icon: 'ri-file-tree-line' },
  { value: 'floorplan', label: '평면도', icon: 'ri-building-line' }
]

const selectedChartType = ref('tree')
const chartContainerRef = ref(null)
let chartInstance = null
const isLoading = ref(false)
const treeData = ref([])

// 차트 타입 선택
function selectChartType(type) {
  if (selectedChartType.value === type) return
  selectedChartType.value = type
  updateChart()
}

// 트리 데이터 로드
async function loadData() {
  if (isLoading.value) return

  isLoading.value = true
  try {
    const res = await assetApi.getTree()
    treeData.value = res?.data || []
    await nextTick()
    updateChart()
  } catch (error) {
    console.error('트리 데이터 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 차트 초기화
function initChart() {
  if (!chartContainerRef.value) return false

  if (chartInstance) {
    chartInstance.dispose()
  }

  try {
    chartInstance = echarts.init(chartContainerRef.value)
    return true
  } catch (error) {
    console.error('차트 초기화 실패:', error)
    return false
  }
}

// 차트 업데이트
async function updateChart() {
  if (!chartInstance) {
    if (!initChart()) return
  }

  if (!treeData.value || treeData.value.length === 0) {
    chartInstance.setOption({
      title: {
        text: '자원 데이터가 없습니다',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    })
    return
  }

  chartInstance.showLoading()

  try {
    let option = {}

    switch (selectedChartType.value) {
      case 'tree':
        option = getTreeOption()
        break
      case 'floorplan':
        option = await getFloorplanOption()
        break
      default:
        option = getTreeOption()
    }

    chartInstance.setOption(option, true)
    chartInstance.hideLoading()
  } catch (error) {
    console.error('차트 업데이트 에러:', error)
    if (chartInstance) {
      chartInstance.hideLoading()
    }
  }
}


// 트리 옵션
function getTreeOption() {
  const data = convertToTreeData(treeData.value)

  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [{
      type: 'tree',
      data: data,
      top: '5%',
      left: '7%',
      bottom: '5%',
      right: '20%',
      symbolSize: 7,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 12
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      emphasis: {
        focus: 'descendant'
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750
    }]
  }
}

// 평면도 옵션 (SVG 사용)
async function getFloorplanOption() {
  try {
    let svg = null

    // 방법 1: public 폴더에서 로드 시도 (권장)
    try {
      const publicResponse = await fetch('/MacOdrum-LV5-floorplan-web.svg')
      if (publicResponse.ok) {
        svg = await publicResponse.text()
      }
    } catch (e) {
      console.warn('public 폴더에서 SVG 로드 실패:', e)
    }

    // 방법 2: assets 폴더에서 ?raw로 로드 시도
    if (!svg) {
      try {
        const svgModule = await import('@/assets/img/MacOdrum-LV5-floorplan-web.svg?raw')
        svg = svgModule.default || svgModule
      } catch (importError) {
        console.warn('assets 폴더에서 SVG import 실패:', importError)
      }
    }

    if (!svg || typeof svg !== 'string') {
      throw new Error('SVG 파일을 로드할 수 없습니다. public 폴더에 MacOdrum-LV5-floorplan-web.svg 파일을 넣어주세요.')
    }

    // SVG가 유효한지 확인
    const svgTrimmed = svg.trim()
    if (!svgTrimmed.startsWith('<?xml') && !svgTrimmed.startsWith('<svg')) {
      throw new Error('유효하지 않은 SVG 형식입니다')
    }

    echarts.registerMap('floorplan', { svg: svg })

    // 최상위 부모 자원 추출 (신이빌딩 5층의 최상위 자원들)
    const topLevelAssets = treeData.value || []

    // regions 생성: SVG의 name 속성과 자원 이름 매핑
    const regions = topLevelAssets.map(asset => {
      // 자원 이름을 SVG name 형식으로 변환 (공백을 언더스코어로, 소문자로)
      // 예: "세미나실" -> "seminar_room" 또는 자원 이름 그대로 사용
      const svgName = asset.name.toLowerCase().replace(/\s+/g, '_')

      return {
        name: svgName, // SVG의 name 속성과 매칭
        tooltip: {
          formatter: [
            `<div style="font-weight: bold; margin-bottom: 4px;">${asset.name}</div>`,
            `<div>자원 ID: ${asset.assetId}</div>`,
            asset.children && asset.children.length > 0
              ? `<div>하위 자원: ${asset.children.length}개</div>`
              : ''
          ].filter(Boolean).join('')
        },
        itemStyle: {
          color: '#e3f2fd',
          borderColor: '#2196f3',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            color: '#bbdefb',
            borderColor: '#00A950',
            borderWidth: 3
          },
          label: {
            show: true,
            formatter: asset.name,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        },
        select: {
          itemStyle: {
            color: '#90caf9',
            borderColor: '#00A950',
            borderWidth: 3
          },
          label: {
            show: true,
            formatter: asset.name,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        }
      }
    })

    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.name) {
            // 매핑된 자원 정보 표시
            const asset = topLevelAssets.find(a =>
              a.name.toLowerCase().replace(/\s+/g, '_') === params.name
            )
            if (asset) {
              return [
                `<div style="font-weight: bold; margin-bottom: 4px;">${asset.name}</div>`,
                `<div>자원 ID: ${asset.assetId}</div>`,
                asset.children && asset.children.length > 0
                  ? `<div>하위 자원: ${asset.children.length}개</div>`
                  : ''
              ].filter(Boolean).join('')
            }
            return params.name
          }
          return '평면도'
        }
      },
      geo: {
        map: 'floorplan',
        roam: true,
        selectedMode: 'multiple',
        layoutCenter: ['50%', '50%'],
        layoutSize: '95%',
        tooltip: {
          show: true
        },
        itemStyle: {
          color: '#f5f5f5',
          borderColor: '#999',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            color: null,
            borderColor: '#00A950',
            borderWidth: 3
          },
          label: {
            show: true,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        },
        select: {
          itemStyle: {
            color: '#00A950',
            borderColor: '#00A950',
            borderWidth: 2
          },
          label: {
            show: true,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        },
        regions: regions
      }
    }
  } catch (error) {
    console.error('평면도 로드 실패:', error)
    return {
      title: {
        text: '평면도를 불러올 수 없습니다',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }
}


// 데이터 변환 함수들

function convertToTreeData(treeNodes) {
  if (!treeNodes || treeNodes.length === 0) return []
  return treeNodes.map(node => ({
    name: node.name,
    value: countChildren(node),
    children: node.children ? convertToTreeData(node.children) : undefined
  }))
}



function countChildren(node) {
  if (!node.children || node.children.length === 0) return 1
  return node.children.reduce((sum, child) => sum + countChildren(child), 0)
}

// 리사이즈 핸들러
function resizeChart() {
  chartInstance?.resize()
}

// 차트 클릭 이벤트
function setupChartEvents() {
  if (!chartInstance) return

  chartInstance.off('click')
  chartInstance.on('click', function(params) {
    // 트리 차트의 경우
    if (params.data && params.data.assetId) {
      setTimeout(() => {
        window.location.href = `/admin/assets/${params.data.assetId}`
      }, 0)
    }
    // 평면도 차트의 경우
    if (params.componentType === 'geo' && params.name) {
      const topLevelAssets = treeData.value || []
      const asset = topLevelAssets.find(a =>
        a.name.toLowerCase().replace(/\s+/g, '_') === params.name
      )
      if (asset && asset.assetId) {
        setTimeout(() => {
          window.location.href = `/admin/assets/${asset.assetId}`
        }, 0)
      }
    }
  })
}

watch(selectedChartType, () => {
  updateChart()
  setupChartEvents()
})

onMounted(async () => {
  await nextTick()
  if (initChart()) {
    await loadData()
    setupChartEvents()
  }
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<style scoped>
.asset-dashboard {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
}

.chart-type-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.chart-type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.chart-type-btn:hover {
  border-color: #00A950;
  color: #00A950;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 169, 80, 0.2);
}

.chart-type-btn.active {
  background: #00A950;
  border-color: #00A950;
  color: white;
}

.chart-type-btn i {
  font-size: 18px;
}

.chart-wrapper {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.chart-container {
  width: 100%;
  height: 600px;
  min-height: 600px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  z-index: 10;
}

.loading-overlay i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #00A950;
}

.loading-overlay p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #c7dbcc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #b5cbb8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn i.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
