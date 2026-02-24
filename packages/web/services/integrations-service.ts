import { api } from '@/lib/api-client'

export interface BrandIntegration {
  id?: string
  brand_id?: string
  meta_pixel_id?: string
  meta_access_token?: string    // always masked on GET (e.g. ••••abcd)
  meta_test_event_code?: string
  is_meta_enabled: boolean
  ga4_measurement_id?: string
  ga4_api_secret?: string       // always masked on GET
  is_ga4_enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface TestConnectionResult {
  success: boolean
  message: string
}

export const integrationsService = {
  /** Get current integration config (tokens are masked) */
  async get(): Promise<BrandIntegration> {
    const response = await api.get<BrandIntegration>('/brand/integrations')
    return response.data
  },

  /** Save/update Meta + GA4 credentials */
  async update(data: Partial<BrandIntegration>): Promise<BrandIntegration> {
    const response = await api.put<BrandIntegration>('/brand/integrations', data)
    return response.data
  },

  /** Get personalized JS pixel snippet for this brand */
  async getPixelSnippet(): Promise<string> {
    const response = await api.get<{ snippet: string }>('/brand/integrations/pixel')
    return response.data.snippet
  },

  /** Fire a test event to Meta CAPI to verify credentials */
  async testMeta(): Promise<TestConnectionResult> {
    const response = await api.post<{ message: string }>('/brand/integrations/test-meta')
    return {
      success: response.success,
      message: response.data?.message || '',
    }
  },

  /** Fire a test event to GA4 Measurement Protocol to verify credentials */
  async testGA4(): Promise<TestConnectionResult> {
    const response = await api.post<{ message: string }>('/brand/integrations/test-ga4')
    return {
      success: response.success,
      message: response.data?.message || '',
    }
  },
}
