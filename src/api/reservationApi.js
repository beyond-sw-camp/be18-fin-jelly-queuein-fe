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
    getUserReservations: ({ page, size, date }) =>
    api.get('/reservations/me', {
        params: { page, size, date }
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

  getMonthlyReservations: (yearMonth) =>
  api.get('/reservations/monthly', { params: { yearMonth } }),

    getWeeklyReservations: (date) =>
  api.get('/reservations/weekly', { params: { date } }),

  getAvailableTimes: (id, dateStr) =>
  api.get(`/reservations/${id}/available-times`, {
    params: { date: dateStr }
  })


}
