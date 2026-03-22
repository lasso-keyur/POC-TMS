import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authApi, LoginPayload } from '../api/auth'

export function useAuth() {
  const { token, user, isAuthenticated, login: storeLogin, logout: storeLogout, setUser } = useAuthStore()

  const login = useCallback(async (credentials: LoginPayload) => {
    const response = await authApi.login(credentials)
    localStorage.setItem('tv_refresh_token', response.tokens.refreshToken)
    storeLogin(response.tokens.accessToken, response.user)
    return response
  }, [storeLogin])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Logout even if the API call fails
    }
    storeLogout()
  }, [storeLogout])

  const fetchUser = useCallback(async () => {
    const userData = await authApi.me()
    setUser(userData)
    return userData
  }, [setUser])

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
}
