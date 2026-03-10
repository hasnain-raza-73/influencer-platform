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
  campaign_type?: 'OPEN' | 'SPECIFIC'
}

export interface CampaignInvitation {
  id: string
  campaign_id: string
  influencer_id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  invited_at: string
  responded_at?: string
  influencer?: {
    id: string
    display_name: string
    email?: string
    total_clicks?: number
    total_conversions?: number
  }
  campaign?: {
    id: string
    name: string
    commission_rate: number
  }
}

export interface InvitationsGrouped {
  pending: CampaignInvitation[]
  accepted: CampaignInvitation[]
  declined: CampaignInvitation[]
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
    try {
      const response = await api.get<Campaign[]>('/campaigns', { params })
      console.log('Get All Campaigns Response:', response)
      return response.data
    } catch (error) {
      console.error('Get All Campaigns Error:', error)
      throw error
    }
  },

  /**
   * Get active campaigns (for influencers)
   */
  async getActiveCampaigns(params?: PaginationParams): Promise<Campaign[]> {
    try {
      const response = await api.get<Campaign[]>('/campaigns/available', { params })
      console.log('Get Active Campaigns Response:', response)
      return response.data
    } catch (error) {
      console.error('Get Active Campaigns Error:', error)
      throw error
    }
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

  /**
   * Invite influencers to a SPECIFIC campaign
   */
  async inviteInfluencers(campaignId: string, influencerIds: string[]): Promise<CampaignInvitation[]> {
    const response = await api.post<CampaignInvitation[]>(`/campaigns/${campaignId}/invite`, {
      influencer_ids: influencerIds,
    })
    return response.data
  },

  /**
   * Get campaign invitations (grouped by status)
   */
  async getInvitations(campaignId: string): Promise<InvitationsGrouped> {
    const response = await api.get<InvitationsGrouped>(`/campaigns/${campaignId}/invitations`)
    return response.data
  },

  /**
   * Remove an invitation
   */
  async removeInvitation(campaignId: string, influencerId: string): Promise<void> {
    await api.delete(`/campaigns/${campaignId}/invitations/${influencerId}`)
  },

  /**
   * Get my invitations (influencer)
   */
  async getMyInvitations(status?: 'PENDING' | 'ACCEPTED' | 'DECLINED'): Promise<CampaignInvitation[]> {
    const params = status ? { status } : {}
    const response = await api.get<CampaignInvitation[]>('/campaigns/invitations/me', { params })
    return response.data
  },

  /**
   * Respond to invitation (influencer)
   */
  async respondToInvitation(invitationId: string, action: 'ACCEPT' | 'DECLINE'): Promise<CampaignInvitation> {
    const response = await api.post<CampaignInvitation>(`/campaigns/invitations/${invitationId}/respond`, {
      action,
    })
    return response.data
  },
}
