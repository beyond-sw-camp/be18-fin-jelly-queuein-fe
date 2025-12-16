import { categoryApi } from '@/api/categoryApi'
import { assetApi } from '@/api/assetApi'

// ===============================
// Intent Types
// ===============================
const INTENT = {
  LIST_ALL_CATEGORIES: 'LIST_ALL_CATEGORIES',
  LIST_ASSETS_BY_BUILDING: 'LIST_ASSETS_BY_BUILDING',
  LIST_ASSETS_BY_CATEGORY: 'LIST_ASSETS_BY_CATEGORY',
  GET_ASSET_DETAIL: 'GET_ASSET_DETAIL',
  GET_ASSET_LOCATION: 'GET_ASSET_LOCATION',
  GET_ASSET_STATUS: 'GET_ASSET_STATUS',
  UNKNOWN: 'UNKNOWN',
}

// 지원되는 질문 형식 목록 (고정)
const SUPPORTED_QUESTIONS = `- 전체 카테고리 목록 보여줘
- 신이빌딩 자원 목록 보여줘
- 카테고리 10번 자원 목록 보여줘
- 자원 286번 상세 알려줘
- 신이빌딩 회의실 2-3 어디 있어?
- 자원 279번 상태 알려줘`

// 초기 인사 메시지 (고정)
export const INITIAL_GREETING = `안녕하세요. QueueIn 자원 관리 챗봇입니다.
아래에서 원하는 항목을 선택하거나, 예시 문장을 그대로 입력해 주세요.

${SUPPORTED_QUESTIONS}`

// Fallback 메시지 (고정)
export const FALLBACK_MESSAGE = `지원하지 않는 질문입니다.

아래와 같은 형식으로 질문해 주세요.

${SUPPORTED_QUESTIONS}`

// ===============================
// Intent Parser
// ===============================
function parseIntent(userInput) {
  const input = userInput.trim().toLowerCase()

  // 1. LIST_ALL_CATEGORIES
  if (
    /(전체\s*)?카테고리\s*(목록|리스트|보여|알려|뭐\s*있)/.test(input) ||
    /카테고리\s*뭐\s*있/.test(input)
  ) {
    return { intent: INTENT.LIST_ALL_CATEGORIES }
  }

  // 2. LIST_ASSETS_BY_BUILDING
  const buildingMatch = input.match(/(.+?)\s*자원\s*목록\s*보여줘/)
  if (buildingMatch) {
    const buildingName = buildingMatch[1].trim()
    // 숫자만 있는 경우는 제외
    if (!/^\d+$/.test(buildingName) && buildingName.length > 0) {
      return {
        intent: INTENT.LIST_ASSETS_BY_BUILDING,
        params: { buildingName },
      }
    }
  }

  // 3. LIST_ASSETS_BY_CATEGORY
  const categoryMatch = input.match(/카테고리\s*(\d+)\s*번?\s*자원\s*목록\s*보여줘/)
  if (categoryMatch) {
    return {
      intent: INTENT.LIST_ASSETS_BY_CATEGORY,
      params: { categoryId: parseInt(categoryMatch[1]) },
    }
  }

  // 4. GET_ASSET_DETAIL
  const assetDetailMatch = input.match(/자원\s*(\d+)\s*번?\s*상세\s*알려줘/)
  if (assetDetailMatch) {
    return {
      intent: INTENT.GET_ASSET_DETAIL,
      params: { assetId: parseInt(assetDetailMatch[1]) },
    }
  }

  // 5. GET_ASSET_LOCATION
  const locationMatch = input.match(/(.+?)\s*어디\s*있어\?/)
  if (locationMatch) {
    const assetName = locationMatch[1].trim()
    // 숫자만 있는 경우는 제외
    if (!/^\d+$/.test(assetName) && assetName.length > 0) {
      return {
        intent: INTENT.GET_ASSET_LOCATION,
        params: { assetName },
      }
    }
  }

  // 6. GET_ASSET_STATUS
  const statusMatch = input.match(/자원\s*(\d+)\s*번?\s*상태\s*알려줘/)
  if (statusMatch) {
    return {
      intent: INTENT.GET_ASSET_STATUS,
      params: { assetId: parseInt(statusMatch[1]) },
    }
  }

  // 7. UNKNOWN (지원하지 않는 형식)
  return { intent: INTENT.UNKNOWN }
}

// ===============================
// Intent Handlers
// ===============================

// 1. LIST_ALL_CATEGORIES
async function handleListAllCategories() {
  try {
    const res = await categoryApi.getDropdown()
    const categories = res?.data || []

    if (categories.length === 0) {
      return FALLBACK_MESSAGE
    }

    let response = '전체 카테고리 목록입니다.\n아래에서 카테고리를 선택해 주세요.\n\n'
    
    categories.forEach((cat, index) => {
      // code만 표시, undefined 값 제거
      if (cat && cat.code) {
        response += `[${index + 1}] ${cat.code}\n`
      }
    })

    response += '\n예: \'카테고리 3번 자원 목록 보여줘\''

    return response.trim()
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 2. LIST_ASSETS_BY_BUILDING
async function handleListAssetsByBuilding(buildingName) {
  try {
    const res = await assetApi.getTree()
    const tree = res?.data || []

    // 건물 찾기
    const building = tree.find((node) => node.name === buildingName || node.name.includes(buildingName))

    if (!building) {
      return FALLBACK_MESSAGE
    }

    // 건물 하위의 모든 자원 수집
    function collectAssets(node, assets = []) {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          // 리프 노드(자식이 없는 노드)만 자원으로 간주
          if (!child.children || child.children.length === 0) {
            assets.push(child.name)
          } else {
            collectAssets(child, assets)
          }
        })
      }
      return assets
    }

    const assets = collectAssets(building)

    if (assets.length === 0) {
      return FALLBACK_MESSAGE
    }

    let response = `${buildingName}에 속한 자원 목록입니다.\n\n`
    
    assets.forEach((asset, index) => {
      if (asset) {
        response += `[${index + 1}] ${asset}\n`
      }
    })

    response += '\n예: \'자원 2번 상세 알려줘\''

    return response.trim()
  } catch (error) {
    console.error('건물별 자원 목록 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 3. LIST_ASSETS_BY_CATEGORY
async function handleListAssetsByCategory(categoryId) {
  try {
    // 카테고리 정보 가져오기
    const categoryRes = await categoryApi.getDropdown()
    const categories = categoryRes?.data || []
    const category = categories.find((cat) => cat.id === categoryId || cat.categoryId === categoryId)
    const categoryName = category?.name || ''
    const categoryCode = category?.code || ''

    const res = await assetApi.getDescendants({ categoryId })
    const assets = res?.data?.content || res?.data || []

    if (assets.length === 0) {
      return FALLBACK_MESSAGE
    }

    let response = `카테고리 ${categoryId}번`
    if (categoryCode) {
      response += `(${categoryCode})`
    }
    response += `에 속한 자원 목록입니다.\n\n`

    assets.forEach((asset, index) => {
      if (asset && asset.name) {
        response += `[${index + 1}] ${asset.name}\n`
      }
    })

    response += '\n예: \'자원 2번 상세 알려줘\''

    return response.trim()
  } catch (error) {
    console.error('자원 목록 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 4. GET_ASSET_DETAIL
async function handleGetAssetDetail(assetId) {
  try {
    const res = await assetApi.getDetail(assetId)
    const asset = res?.data

    if (!asset) {
      return FALLBACK_MESSAGE
    }

    let response = `- 이름: ${asset.name || '정보 없음'}\n`
    response += `- 종류: ${asset.type === 'STATIC' ? '정적' : asset.type === 'DYNAMIC' ? '동적' : asset.type || '정보 없음'}\n`
    response += `- 위치: ${asset.locationPath || asset.parentName || '정보 없음'}\n`
    response += `- 상태: ${asset.status || '정보 없음'}\n`
    response += `- 예약 가능: ${asset.reservable ? '예' : '아니오'}\n`
    if (asset.pricePerHour) {
      response += `- 시간당 비용: ${asset.pricePerHour.toLocaleString()}원\n`
    }
    if (asset.fixedCost) {
      response += `- 고정 비용: ${asset.fixedCost.toLocaleString()}원\n`
    }
    if (asset.description) {
      response += `- 설명: ${asset.description}\n`
    }

    return response.trim()
  } catch (error) {
    console.error('자원 상세 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 5. GET_ASSET_LOCATION
async function handleGetAssetLocation(assetName) {
  try {
    // 전체 트리를 가져와서 자원 이름으로 검색
    const res = await assetApi.getTree()
    const tree = res?.data || []

    // 재귀적으로 자원 찾기 및 경로 구성
    function findAssetWithPath(nodes, targetName, currentPath = []) {
      for (const node of nodes) {
        const newPath = [...currentPath, node.name]

        // 정확히 일치하거나 포함되는 경우
        if (node.name === targetName || node.name.includes(targetName)) {
          return { asset: node, path: newPath }
        }

        // 자식 노드에서 재귀 검색
        if (node.children && node.children.length > 0) {
          const found = findAssetWithPath(node.children, targetName, newPath)
          if (found) return found
        }
      }
      return null
    }

    const result = findAssetWithPath(tree, assetName)

    if (!result) {
      return FALLBACK_MESSAGE
    }

    const locationPath = result.path.join(' → ')

    return locationPath
  } catch (error) {
    console.error('자원 위치 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 6. GET_ASSET_STATUS
async function handleGetAssetStatus(assetId) {
  try {
    const res = await assetApi.getDetail(assetId)
    const asset = res?.data

    if (!asset) {
      return FALLBACK_MESSAGE
    }

    const statusText = asset.reservable ? '예약 가능' : '예약 불가능'
    const statusDetail = asset.status || '정보 없음'

    return `현재 상태: ${statusText}\n상세 상태: ${statusDetail}`
  } catch (error) {
    console.error('자원 상태 조회 실패:', error)
    return FALLBACK_MESSAGE
  }
}

// 7. UNKNOWN
function handleUnknown() {
  return FALLBACK_MESSAGE
}

// ===============================
// Main Handler
// ===============================
export async function processChatbotMessage(userInput) {
  const { intent, params } = parseIntent(userInput)

  switch (intent) {
    case INTENT.LIST_ALL_CATEGORIES:
      return await handleListAllCategories()

    case INTENT.LIST_ASSETS_BY_BUILDING:
      if (!params?.buildingName) {
        return handleUnknown()
      }
      return await handleListAssetsByBuilding(params.buildingName)

    case INTENT.LIST_ASSETS_BY_CATEGORY:
      if (!params?.categoryId) {
        return handleUnknown()
      }
      return await handleListAssetsByCategory(params.categoryId)

    case INTENT.GET_ASSET_DETAIL:
      if (!params?.assetId) {
        return handleUnknown()
      }
      return await handleGetAssetDetail(params.assetId)

    case INTENT.GET_ASSET_LOCATION:
      if (!params?.assetName) {
        return handleUnknown()
      }
      return await handleGetAssetLocation(params.assetName)

    case INTENT.GET_ASSET_STATUS:
      if (!params?.assetId) {
        return handleUnknown()
      }
      return await handleGetAssetStatus(params.assetId)

    case INTENT.UNKNOWN:
    default:
      return handleUnknown()
  }
}

