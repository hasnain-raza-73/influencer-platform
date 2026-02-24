import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'

/**
 * API Response structure
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

/**
 * API Error structure
 */
export interface ApiError {
  success: false
  error: string
  message: string
  statusCode: number
}

/**
 * Create axios instance with default config
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  })

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors globally
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response
    },
    (error: AxiosError<ApiError>) => {
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear localStorage
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')

          // Clear Zustand auth store
          const authStore = useAuthStore.getState()
          authStore.clearAuth()

          // Don't redirect if on public pages - just reject the promise
          const publicRoutes = ['/', '/auth/login', '/auth/register']
          const currentPath = window.location.pathname

          if (!publicRoutes.includes(currentPath)) {
            // Only redirect from protected pages
            window.location.href = '/auth/login'
          }
        }
      }

      // Handle network errors
      if (!error.response) {
        return Promise.reject({
          success: false,
          error: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          statusCode: 0,
        })
      }

      // Return formatted error
      return Promise.reject({
        success: false,
        error: error.response.data?.error || 'Unknown Error',
        message: error.response.data?.message || error.message,
        statusCode: error.response.status,
      })
    }
  )

  return instance
}

export const apiClient = createApiClient()

/**
 * Generic API request wrapper
 */
async function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

/**
 * HTTP Methods
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  postForm: <T = any>(url: string, formData: FormData) =>
    request<T>({ method: 'POST', url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}

/**
 * Set auth token
 */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token)
  }
}

/**
 * Clear auth token
 */
export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    // Also clear Zustand auth store
    useAuthStore.getState().clearAuth()
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}
