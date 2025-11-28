import api from './axios'

export const reservationApi = {
  // 생성
  create: (data) => api.post('/assets', data),

  // 수정
  update: (id, data) => api.patch(`/assets/${id}`, data),

  // 자원 상세 조회
  getDetail: (id) => api.get(`/assets/${id}`),

  // 사용자 예약 조회
    getUserReservations: ({ page, size, date }) =>
    api.get('/reservations/me', {
        params: { page, size, date }
    }),


  // 위치(1 depth)
  getOneDepth: (rootId) => api.get(`/assets/${rootId}/one-depth`),

  // 자원 목록 조회 (descendants)
  getDescendants: (params) => api.get('/assets/descendants', { params }),
}
