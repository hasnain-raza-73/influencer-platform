import { api } from '@/lib/api-client'
import { Influencer } from '@/types'

export interface InfluencersResponse {
  influencers: Influencer[]
  total: number
  page: number
  limit: number
}

export const influencersService = {
  async getAll(params?: {
    search?: string
    niche?: string
    min_followers?: number
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
}
