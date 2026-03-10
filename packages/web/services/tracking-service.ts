import { api } from '@/lib/api-client'
import { TrackingLink, PaginationParams } from '@/types'

export interface CreateTrackingLinkData {
  product_id: string
  campaign_id?: string
  custom_code?: string
}

export interface ProductOrder {
  product_id: string
  display_order: number
}

export interface LandingPageConfig {
  title?: string
  description?: string
  theme?: string
  primary_color?: string
}

export interface CreateAdvancedLinkData {
  product_ids: string[]
  campaign_id?: string
  custom_slug?: string
  is_bio_link?: boolean
  landing_page_config?: LandingPageConfig
  product_order?: ProductOrder[]
}

export interface SlugCheckResponse {
  available: boolean
  suggestions?: string[]
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

  /**
   * Create advanced tracking link
   */
  async createAdvanced(data: CreateAdvancedLinkData): Promise<TrackingLink> {
    const response = await api.post<TrackingLink>('/tracking/links/advanced', data)
    return response.data
  },

  /**
   * Check if a custom slug is available
   */
  async checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
    const response = await api.get<SlugCheckResponse>('/tracking/slugs/check', {
      params: { slug },
    })
    return response.data
  },

  /**
   * Generate QR code for a tracking link
   */
  async generateQRCode(linkId: string, options?: { size?: number; format?: string }): Promise<{ qr_code_url: string }> {
    const response = await api.post<{ qr_code_url: string }>(
      `/tracking/links/${linkId}/qr-code`,
      options || {}
    )
    return response.data
  },
}
