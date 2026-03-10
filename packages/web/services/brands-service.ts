import { api } from '@/lib/api-client'
import { Brand } from '@/types'

export interface BrandsResponse {
  brands: Brand[]
  total: number
  page: number
  limit: number
}

export const brandsService = {
  async getAll(params?: {
    search?: string
    limit?: number
    page?: number
  }): Promise<BrandsResponse> {
    try {
      // Try to use admin endpoint (requires admin access)
      const response: any = await api.get('/admin/brands', { params })
      return {
        brands: response.data || [],
        total: response.meta?.total || 0,
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 10,
      }
    } catch (error) {
      // Return empty results if unauthorized or error
      console.log('Unable to fetch brands list - may require admin access')
      return {
        brands: [],
        total: 0,
        page: 1,
        limit: 10,
      }
    }
  },

  async getOne(id: string): Promise<Brand> {
    const response = await api.get<Brand>(`/admin/brands/${id}`)
    return response.data
  },
}
