import API from './api'

export function getDashboardStats(params = {}) {
  return API.get('/v1/admin/dashboard-stats', { params })
}
