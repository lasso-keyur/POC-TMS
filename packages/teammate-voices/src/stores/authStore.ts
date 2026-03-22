import { create } from 'zustand'

interface User {
  id: number
  email: string
  displayName: string
  role: 'ADMIN' | 'MANAGER' | 'RESPONDENT'
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  setUser: (user: User) => void
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('tv_access_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('tv_access_token'),

  setToken: (token) => {
    localStorage.setItem('tv_access_token', token)
    set({ token, isAuthenticated: true })
  },

  setUser: (user) => set({ user }),

  login: (token, user) => {
    localStorage.setItem('tv_access_token', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('tv_access_token')
    localStorage.removeItem('tv_refresh_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
