import { api } from '@/lib/api-client'
import { DashboardStats, AnalyticsDataPoint } from '@/types'

export interface BrandDashboardResponse {
  stats: DashboardStats
  recent_activity: any[]
  top_performers: any[]
}

export interface InfluencerDashboardResponse {
  stats: DashboardStats
  recent_conversions: any[]
  top_products: any[]
}

/**
 * Analytics Service
 */
export const analyticsService = {
  /**
   * Get brand dashboard data
   */
  async getBrandDashboard(): Promise<BrandDashboardResponse> {
    const response = await api.get<BrandDashboardResponse>('/analytics/brand/dashboard')
    return response.data
  },

  /**
   * Get influencer dashboard data
   */
  async getInfluencerDashboard(): Promise<InfluencerDashboardResponse> {
    const response = await api.get<InfluencerDashboardResponse>('/analytics/influencer/dashboard')
    return response.data
  },

  /**
   * Get brand ROI analytics
   */
  async getBrandROI(params?: { start_date?: string; end_date?: string }): Promise<any> {
    const response = await api.get('/analytics/brand/roi', { params })
    return response.data
  },

  /**
   * Get influencer earnings
   */
  async getInfluencerEarnings(params?: { start_date?: string; end_date?: string }): Promise<any> {
    const response = await api.get('/analytics/influencer/earnings', { params })
    return response.data
  },

  /**
   * Get analytics time series data
   */
  async getTimeSeriesData(params: {
    start_date: string
    end_date: string
    granularity?: 'day' | 'week' | 'month'
  }): Promise<AnalyticsDataPoint[]> {
    const response = await api.get<AnalyticsDataPoint[]>('/analytics/timeseries', { params })
    return response.data
  },
}
