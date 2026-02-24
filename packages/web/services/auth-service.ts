import { api, setAuthToken, clearAuthToken } from '@/lib/api-client'
import { AuthResponse, UserRole } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  role: UserRole
  // Brand specific
  company_name?: string
  website?: string
  description?: string
  // Influencer specific
  display_name?: string
  bio?: string
  social_instagram?: string
  social_tiktok?: string
  social_youtube?: string
  social_twitter?: string
  niche?: string[]
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    if (response.success && response.data.access_token) {
      setAuthToken(response.data.access_token)
    }

    return response.data
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)

    if (response.success && response.data.access_token) {
      setAuthToken(response.data.access_token)
    }

    return response.data
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    clearAuthToken()
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me')
    return response.data
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, new_password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, new_password })
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  },
}
