import { api } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  tokens: AuthTokens
  user: {
    id: number
    email: string
    displayName: string
    role: 'ADMIN' | 'MANAGER' | 'RESPONDENT'
  }
}

export const authApi = {
  login: (data: LoginPayload): Promise<LoginResponse> =>
    api.post('/auth/login', data).then(r => r.data),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),
}
