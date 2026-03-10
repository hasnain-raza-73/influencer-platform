import { api } from '@/lib/api-client'

export interface SocialAccount {
  id: string
  influencer_id: string
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
  platform_user_id: string
  platform_username?: string
  is_verified: boolean
  verification_level?: 'BASIC' | 'VERIFIED' | 'FEATURED'
  last_synced_at?: string
  created_at: string
  updated_at: string
  metrics?: SocialMetrics[]
  audience_insights?: SocialAudienceInsights[]
  influencer?: {
    id: string
    display_name: string
    avatar_url?: string
    user_id: string
  }
}

export interface SocialMetrics {
  id: string
  social_account_id: string
  followers_count: number
  following_count: number
  posts_count: number
  engagement_rate?: number
  avg_likes: number
  avg_comments: number
  avg_views: number
  audience_demographics?: any
  synced_at: string
  created_at: string
}

export interface SocialAudienceInsights {
  id: string
  social_account_id: string
  insight_type: 'AGE' | 'GENDER' | 'LOCATION' | 'INTERESTS'
  insight_data?: any
  synced_at: string
  created_at: string
}

export interface ConnectAccountData {
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
  platform_user_id: string
  platform_username?: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
}

export interface SyncMetricsData {
  followers_count: number
  following_count?: number
  posts_count?: number
  engagement_rate?: number
  avg_likes?: number
  avg_comments?: number
  avg_views?: number
  audience_demographics?: any
}

export const socialIntegrationsService = {
  // Connect a new social account
  async connectAccount(data: ConnectAccountData): Promise<{ success: boolean; data: SocialAccount; message: string }> {
    return api.post('/social-integrations/connect', data)
  },

  // Get all connected accounts for the logged-in influencer
  async getAccounts(): Promise<{ success: boolean; data: SocialAccount[] }> {
    return api.get('/social-integrations/accounts')
  },

  // Get a specific social account
  async getAccount(accountId: string): Promise<{ success: boolean; data: SocialAccount }> {
    return api.get(`/social-integrations/accounts/${accountId}`)
  },

  // Update a social account
  async updateAccount(
    accountId: string,
    data: Partial<ConnectAccountData>
  ): Promise<{ success: boolean; data: SocialAccount; message: string }> {
    return api.patch(`/social-integrations/accounts/${accountId}`, data)
  },

  // Delete (disconnect) a social account
  async deleteAccount(accountId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/social-integrations/accounts/${accountId}`)
  },

  // Sync metrics for an account
  async syncMetrics(
    accountId: string,
    data: SyncMetricsData
  ): Promise<{ success: boolean; data: SocialMetrics; message: string }> {
    return api.post(`/social-integrations/accounts/${accountId}/sync`, data)
  },

  // Get latest metrics for an account
  async getLatestMetrics(accountId: string): Promise<{ success: boolean; data: SocialMetrics | null }> {
    return api.get(`/social-integrations/accounts/${accountId}/metrics`)
  },

  // Get metrics history for an account
  async getMetricsHistory(accountId: string): Promise<{ success: boolean; data: SocialMetrics[] }> {
    return api.get(`/social-integrations/accounts/${accountId}/metrics/history`)
  },

  // Refresh account token
  async refreshToken(
    accountId: string,
    data: { access_token: string; refresh_token?: string; expires_at?: string }
  ): Promise<{ success: boolean; data: SocialAccount; message: string }> {
    return api.post(`/social-integrations/accounts/${accountId}/refresh-token`, data)
  },

  // Verify account
  async verifyAccount(accountId: string): Promise<{ success: boolean; data: SocialAccount; message: string }> {
    return api.post(`/social-integrations/accounts/${accountId}/verify`)
  },

  // Admin: Get all social accounts
  async getAllAccountsForAdmin(params?: {
    platform?: string
    is_verified?: boolean
    verification_level?: string
    limit?: number
    page?: number
  }): Promise<{
    success: boolean
    data: {
      accounts: SocialAccount[]
      total: number
      page: number
      limit: number
    }
  }> {
    return api.get('/social-integrations/admin/accounts', { params })
  },

  // Admin: Update verification status
  async updateVerificationStatus(
    accountId: string,
    data: {
      is_verified?: boolean
      verification_level?: 'BASIC' | 'VERIFIED' | 'FEATURED'
    }
  ): Promise<{ success: boolean; data: SocialAccount; message: string }> {
    return api.patch(`/social-integrations/admin/accounts/${accountId}/verification`, data)
  },
}
