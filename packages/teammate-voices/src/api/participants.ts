import { api } from './client'

export const participantApi = {
  list:    (params?: Record<string, unknown>) => api.get('/participants', { params }).then(r => r.data),
  get:     (id: number)        => api.get(`/participants/${id}`).then(r => r.data),
  create:  (data: unknown)     => api.post('/participants', data).then(r => r.data),
  update:  (id: number, data: unknown) => api.put(`/participants/${id}`, data).then(r => r.data),
  delete:  (id: number)        => api.delete(`/participants/${id}`).then(r => r.data),
}
