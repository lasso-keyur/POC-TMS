import { api } from './client'

export const surveyApi = {
  list:    (params?: Record<string, unknown>) => api.get('/surveys', { params }).then(r => r.data),
  get:     (id: number)        => api.get(`/surveys/${id}`).then(r => r.data),
  create:  (data: unknown)     => api.post('/surveys', data).then(r => r.data),
  update:  (id: number, data: unknown) => api.put(`/surveys/${id}`, data).then(r => r.data),
  delete:  (id: number)        => api.delete(`/surveys/${id}`).then(r => r.data),
}
