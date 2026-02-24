import { api } from '@/lib/api-client'
import { Brand, Influencer, Campaign, Product, Payout, Conversion } from '@/types'

export interface AdminOverview {
  total_brands: number
  total_influencers: number
  pending_reviews: number
  needs_revision: number
  active_campaigns: number
  total_campaigns: number
  total_conversions: number
  pending_payout_amount: number
  total_platform_revenue: number
}

export interface AdminBrand extends Brand {
  user: { id: string; email: string }
}

export interface AdminInfluencer extends Influencer {
  user: { id: string; email: string }
}

// The backend returns { success, data: T[], meta: {...} } at the top level.
// api.get() returns the full response body, so r.data = the array and r.meta = pagination.
// We construct { data, meta } explicitly to match what the pages expect.

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const r: any = await api.get('/admin/overview')
    return r.data
  },

  async getBrands(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ data: AdminBrand[]; meta: any }> {
    const r: any = await api.get('/admin/brands', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async updateBrandStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    await api.patch(`/admin/brands/${id}/status`, { status })
  },

  async getInfluencers(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ data: AdminInfluencer[]; meta: any }> {
    const r: any = await api.get('/admin/influencers', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async updateInfluencerStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    await api.patch(`/admin/influencers/${id}/status`, { status })
  },

  async getCampaigns(params?: { status?: string; brand_id?: string; page?: number; limit?: number }): Promise<{ data: Campaign[]; meta: any }> {
    const r: any = await api.get('/admin/campaigns', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async closeCampaign(id: string): Promise<void> {
    await api.patch(`/admin/campaigns/${id}/close`, {})
  },

  async getProducts(params?: { review_status?: string; brand_id?: string; page?: number; limit?: number }): Promise<{ data: Product[]; meta: any }> {
    const r: any = await api.get('/admin/products', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async reviewProduct(id: string, data: { review_status: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED'; review_notes?: string }): Promise<Product> {
    const r: any = await api.patch(`/admin/products/${id}/review`, data)
    return r.data
  },

  async getPayouts(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Payout[]; meta: any }> {
    const r: any = await api.get('/admin/payouts', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async getConversions(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Conversion[]; meta: any }> {
    const r: any = await api.get('/admin/conversions', { params })
    return { data: r.data || [], meta: r.meta }
  },

  async getBrandDetail(id: string): Promise<any> {
    const r: any = await api.get(`/admin/brands/${id}`)
    return r.data
  },

  async getInfluencerDetail(id: string): Promise<any> {
    const r: any = await api.get(`/admin/influencers/${id}`)
    return r.data
  },
}
