import { create } from 'zustand'
import { User } from '../types'
import api from '../services/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  verifyEmail: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
  googleLogin: (token: string) => Promise<void>
  logout: () => void
  fetchCurrentUser: () => Promise<void>
  setUser: (user: User | null) => void
  updateUser: (fields: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res: any = await api.post('/auth/login', { email, password })
      if (res.success && res.data) {
        const { user, tokens } = res.data
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)
        set({
          user: {
            id: user.id || user._id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true })
    try {
      const res: any = await api.post('/auth/register', { full_name: fullName, email, password })
      if (!res.success) throw new Error('Registration failed')
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  verifyEmail: async (email, otp) => {
    set({ isLoading: true })
    try {
      const res: any = await api.post('/auth/verify-email', { email, otp })
      if (res.success && res.data) {
        const { user, tokens } = res.data
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)
        set({
          user: {
            id: user.id || user._id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  resendOTP: async (email) => {
    set({ isLoading: true })
    try {
      await api.post('/auth/resend-verification', { email })
    } finally {
      set({ isLoading: false })
    }
  },

  googleLogin: async (token) => {
    set({ isLoading: true })
    try {
      const res: any = await api.post('/auth/google', { token })
      if (res.success && res.data) {
        const { user, tokens } = res.data
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)
        set({
          user: {
            id: user.id || user._id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  fetchCurrentUser: async () => {
    if (!localStorage.getItem('access_token')) return
    set({ isLoading: true })
    try {
      const res: any = await api.get('/auth/me')
      if (res.success && res.data) {
        const user = res.data
        set({
          user: {
            id: user.id || user._id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          isAuthenticated: true,
        })
      }
    } catch {
      get().logout()
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => set({ user }),
  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
}))
