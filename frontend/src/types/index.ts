export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt?: string
}

export interface APIError {
  code: string
  message: string
  details?: any
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  meta?: Record<string, any>
}

export interface ServiceStatus {
  backend: 'healthy' | 'degraded' | 'unhealthy' | 'offline'
  database: 'connected' | 'disconnected'
  ai_engine: 'ready' | 'degraded' | 'unavailable'
  storage: 'ready' | 'degraded' | 'unconfigured'
}

export interface SystemHealth {
  status: string
  appName?: string
  environment?: string
  services?: ServiceStatus
  database_connected?: boolean
  ai_provider?: string
}

export type ThemeMode = 'dark' | 'light'
