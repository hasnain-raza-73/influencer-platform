import { api } from '@/lib/api-client'
import { Campaign, PaginationParams } from '@/types'

export interface CreateCampaignData {
  name: string
  description?: string
  commission_rate: number
  budget?: number
  start_date?: string
  end_date?: string
  target_product_ids?: string[]
  target_influencer_ids?: string[]
  max_conversions?: number
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {}

export interface CampaignStats {
  total_clicks: number
  total_conversions: number
  total_sales: number
  total_commission_paid: number
  conversion_rate: number
  roi: number
  average_order_value: number
}

/**
 * Campaigns Service
 */
export const campaignsService = {
  /**
   * Get all campaigns (brand's campaigns)
   */
  async getAll(params?: PaginationParams): Promise<Campaign[]> {
    const response = await api.get<Campaign[]>('/campaigns', { params })
    return response.data
  },

  /**
   * Get active campaigns (for influencers)
   */
  async getActiveCampaigns(params?: PaginationParams): Promise<Campaign[]> {
    const response = await api.get<Campaign[]>('/campaigns/active', { params })
    return response.data
  },

  /**
   * Get single campaign
   */
  async getById(id: string): Promise<Campaign> {
    const response = await api.get<Campaign>(`/campaigns/${id}`)
    return response.data
  },

  /**
   * Create campaign
   */
  async create(data: CreateCampaignData): Promise<Campaign> {
    const response = await api.post<Campaign>('/campaigns', data)
    return response.data
  },

  /**
   * Update campaign
   */
  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const response = await api.put<Campaign>(`/campaigns/${id}`, data)
    return response.data
  },

  /**
   * Activate campaign
   */
  async activate(id: string): Promise<Campaign> {
    const response = await api.post<Campaign>(`/campaigns/${id}/activate`)
    return response.data
  },

  /**
   * Pause campaign
   */
  async pause(id: string): Promise<Campaign> {
    const response = await api.post<Campaign>(`/campaigns/${id}/pause`)
    return response.data
  },

  /**
   * End campaign
   */
  async end(id: string): Promise<Campaign> {
    const response = await api.post<Campaign>(`/campaigns/${id}/end`)
    return response.data
  },

  /**
   * Get campaign statistics
   */
  async getStatistics(id: string): Promise<CampaignStats> {
    const response = await api.get<CampaignStats>(`/campaigns/${id}/statistics`)
    return response.data
  },

  /**
   * Delete campaign
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`)
  },
}
