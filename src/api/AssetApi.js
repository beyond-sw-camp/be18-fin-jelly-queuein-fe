import api from './axios'

export const assetApi = {
  // 사옥(루트 레벨)
  getRoots: () => api.get('/assets/roots'),

  // 위치(1 depth)
  getOneDepth: (rootId) => api.get(`/assets/${rootId}/one-depth`),

  // 자원 목록 조회 (descendants)
  getDescendants: (params) => api.get('/assets/descendants', { params }),
}
