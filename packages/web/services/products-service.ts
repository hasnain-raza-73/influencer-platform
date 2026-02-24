import { api } from '@/lib/api-client'
import { Product, PaginatedResponse, PaginationParams } from '@/types'

export interface CreateProductData {
  name: string
  description?: string
  price: number
  image_url?: string
  image_urls?: string[]
  category?: string
  commission_rate?: number
  product_url: string
  sku?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
}

export interface UpdateProductData extends Partial<CreateProductData> {}

/**
 * Products Service
 */
export const productsService = {
  /**
   * Get all products
   */
  async getAll(params?: PaginationParams): Promise<{ products: Product[] }> {
    const response = await api.get<{ products: Product[] }>('/products', { params })
    return response.data
  },

  /**
   * Get single product
   */
  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },

  /**
   * Create product
   */
  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>('/products', data)
    return response.data
  },

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data)
    return response.data
  },

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  /**
   * Get products for a specific brand (filtered by brand_id)
   */
  async getBrandProducts(brandId: string, params?: PaginationParams): Promise<{ products: Product[] }> {
    const response = await api.get<{ products: Product[] }>('/products', { params: { ...params, brand_id: brandId } })
    return response.data
  },

  /**
   * Get products by IDs (for campaign product filtering)
   */
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return []
    const response = await api.get<{ products: Product[] }>('/products', { params: { limit: 100 } })
    const all = response.data?.products || []
    return all.filter((p) => ids.includes(p.id))
  },
}
