import { api } from '@/lib/api-client'
import { Influencer } from '@/types'

export interface InfluencersResponse {
  influencers: Influencer[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

export interface AdvancedSearchParams {
  search?: string
  niches?: string[]
  country?: string
  city?: string
  languages?: string[]
  minFollowers?: number
  maxFollowers?: number
  minEngagementRate?: number
  maxEngagementRate?: number
  minRating?: number
  minTotalSales?: number
  maxTotalSales?: number
  availableForCampaigns?: boolean
  campaignTypesInterested?: string[]
  isFeatured?: boolean
  hasInstagram?: boolean
  hasTikTok?: boolean
  hasYouTube?: boolean
  hasTwitter?: boolean
  page?: number
  limit?: number
  sortBy?: 'follower_count' | 'engagement_rate' | 'rating' | 'total_sales' | 'created_at'
  sortOrder?: 'ASC' | 'DESC'
}

export const influencersService = {
  async getAll(params?: {
    search?: string
    niche?: string
    min_followers?: number
    social_platform?: string
    min_social_followers?: number
    verified_only?: boolean
    limit?: number
    page?: number
  }): Promise<InfluencersResponse> {
    const response = await api.get<InfluencersResponse>(
      '/influencers',
      { params }
    )
    return response.data
  },

  async getOne(id: string): Promise<Influencer> {
    const response = await api.get<Influencer>(`/influencers/${id}`)
    return response.data
  },

  async advancedSearch(params: AdvancedSearchParams): Promise<InfluencersResponse> {
    const response = await api.post<{ success: boolean; data: InfluencersResponse }>(
      '/influencers/search',
      params
    )
    return response.data.data
  },
}
