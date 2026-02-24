import { api } from '@/lib/api-client'
import { TrackingLink, PaginationParams } from '@/types'

export interface CreateTrackingLinkData {
  product_id: string
  campaign_id?: string
  custom_code?: string
}

/**
 * Tracking Links Service
 */
export const trackingService = {
  /**
   * Get all tracking links (influencer's links)
   */
  async getAll(params?: PaginationParams): Promise<TrackingLink[]> {
    const response = await api.get<TrackingLink[]>('/tracking/links', { params })
    return response.data
  },

  /**
   * Get single tracking link
   */
  async getById(id: string): Promise<TrackingLink> {
    const response = await api.get<TrackingLink>(`/tracking/links/${id}`)
    return response.data
  },

  /**
   * Create tracking link
   */
  async create(data: CreateTrackingLinkData): Promise<TrackingLink> {
    const response = await api.post<TrackingLink>('/tracking/links', data)
    return response.data
  },

  /**
   * Delete tracking link
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/tracking/links/${id}`)
  },

  /**
   * Get tracking link statistics
   */
  async getStatistics(id: string): Promise<any> {
    const response = await api.get(`/tracking/links/${id}/statistics`)
    return response.data
  },

  /**
   * Record a click on a tracking link (public endpoint)
   */
  async recordClick(code: string): Promise<{ redirect_url: string }> {
    const response = await api.post<{ redirect_url: string }>(`/tracking/${code}/click`, {})
    return response.data
  },
}
