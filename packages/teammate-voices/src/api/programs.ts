import { api } from './client'

export const programApi = {
  list:    (params?: Record<string, unknown>) => api.get('/programs', { params }).then(r => r.data),
  get:     (id: number)        => api.get(`/programs/${id}`).then(r => r.data),
  create:  (data: unknown)     => api.post('/programs', data).then(r => r.data),
  update:  (id: number, data: unknown) => api.put(`/programs/${id}`, data).then(r => r.data),
  delete:  (id: number)        => api.delete(`/programs/${id}`).then(r => r.data),
}
