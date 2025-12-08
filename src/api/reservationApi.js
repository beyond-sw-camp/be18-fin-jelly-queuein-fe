import api from './axios'

export const reservationApi = {
  // 생성
  create: (data) => api.post('/assets', data),

  getAssetDetail: (id) => api.get(`/assets/${id}`),

  // 수정
  update: (id, data) => api.patch(`/assets/${id}`, data),

  // 위치(1 depth)
  getOneDepth: (rootId) => api.get(`/assets/${rootId}/one-depth`),

  // 자원 목록 조회 (descendants)
  getDescendants: (params) => api.get('/assets/descendants', { params }),


  // 자원 상세 조회
  getReservationDetail: (id) => api.get(`/reservations/${id}`),

  // 사용자 예약 조회
  getUserReservations: ({ page, size, date, assetType, assetName, assetStatus, categoryId, layerZero, layerOne }) =>
    api.get('/reservations/me', {
      params: {
        page,
        size,
        date,          // 필수, "YYYY-MM-DD"
        assetType,
        assetName,
        assetStatus,
        categoryId,
        layerZero,
        layerOne
      }
    }),
      getAppliedReservations: ({ page, size, date, assetName, assetType, assetStatus, categoryId, layerZero, layerOne }) =>
    api.get('/reservations/pending', {
      params: {
        page,
        size,
        date,          // 필수, "YYYY-MM-DD"
        assetName,
        assetType,
        assetStatus,
        categoryId,
        layerZero,
        layerOne
      }
    }),
          getReservableAssets: ({ page, size, date, assetType, assetName, assetStatus, categoryName, layerZero, layerOne }) =>
    api.get('/reservations/reservable-assets', {
      params: {
        page,
        size,
        date,          // 필수, "YYYY-MM-DD"
        assetType,
        assetStatus,
        categoryName,
        layerZero,
        layerOne,
        assetName
      }
    }),


  startUsing(id) {
  return api.patch(`/reservations/${id}/check-in`)
  },

  endUsing(id) {
    return api.patch(`/reservations/${id}/check-out`)
  },

  cancel(id) {
    return api.patch(`/reservations/${id}/cancel`)
  },

  approve(id) {
    return api.patch(`/reservations/${id}/approve`)
  },

  reject(id) {
    return api.patch(`/reservations/${id}/reject`)
  },

  getMonthlyReservations: (yearMonth) =>
  api.get('/reservations/monthly', { params: { yearMonth } }),

    getWeeklyReservations: (date) =>
  api.get('/reservations/weekly', { params: { date } }),

  getAvailableTimes: (id, dateStr) =>
  api.get(`/reservations/${id}/available-times`, {
    params: { date: dateStr }
  }),
  //신청 
  applyReservation: (assetId, data) =>
    api.post(`/reservations/${assetId}/apply`, data),

  // 즉시 승인 예약 생성
  instantConfirmReservation: (assetId, data) =>
    api.post(`/reservations/${assetId}/instant-confirm`, data),


}
