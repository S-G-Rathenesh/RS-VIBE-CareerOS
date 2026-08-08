import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { APIResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  withCredentials: true,
})

// Request Interceptor: Attach Access Token & Dev Logger
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, {
        headers: config.headers,
        data: config.data,
      })
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle API envelope, status codes, & dev logging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`, response.data)
    }
    return response.data
  },
  (error: AxiosError<APIResponse | any>) => {
    if (import.meta.env.DEV) {
      console.error('[API Error Response]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
    }

    // 1. Server returned an HTTP response
    if (error.response) {
      const status = error.response.status
      const data: any = error.response.data

      let extractedMessage = ''

      if (data) {
        if (data.error && typeof data.error === 'object' && data.error.message) {
          extractedMessage = data.error.message
        } else if (typeof data.detail === 'string') {
          extractedMessage = data.detail
        } else if (Array.isArray(data.detail)) {
          extractedMessage = data.detail
            .map((err: any) => `${err.loc?.slice(1).join('.') || 'field'}: ${err.msg}`)
            .join('; ')
        } else if (typeof data.message === 'string') {
          extractedMessage = data.message
        }
      }

      let code = 'API_ERROR'
      let fallbackMessage = 'An error occurred. Please try again.'

      switch (status) {
        case 400:
          code = 'BAD_REQUEST'
          fallbackMessage = 'Bad request. Please check your input parameters.'
          break
        case 401:
          code = 'UNAUTHORIZED'
          fallbackMessage = 'Invalid email or password. Please try again.'
          break
        case 402:
          code = 'PAYMENT_REQUIRED'
          fallbackMessage = 'Insufficient AI Credits. You have reached your monthly quota limit. Please upgrade your plan in Settings to continue.'
          break
        case 403:
          code = 'FORBIDDEN'
          fallbackMessage = 'Access forbidden. You do not have permission to perform this action.'
          break
        case 404:
          code = 'NOT_FOUND'
          fallbackMessage = 'Endpoint or requested resource not found.'
          break
        case 422:
          code = 'VALIDATION_ERROR'
          fallbackMessage = 'Validation error. Please verify your input fields.'
          break
        case 500:
        default:
          code = 'SERVER_ERROR'
          fallbackMessage = 'Internal server error (500). Please try again later or contact support.'
          break
      }

      return Promise.reject({
        status,
        code,
        message: extractedMessage || fallbackMessage,
        data,
      })
    }

    // 2. Network / Connection errors (no response received)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return Promise.reject({
        status: 0,
        code: 'CONNECTION_REFUSED',
        message: 'Unable to connect to backend server. Make sure it is running on port 8000.',
        action: 'Retry'
      })
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject({
        status: 0,
        code: 'TIMEOUT',
        message: 'Request timed out. The server took too long to respond.',
      })
    }

    return Promise.reject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred. Please check your connection.',
    })
  }
)

export default api
