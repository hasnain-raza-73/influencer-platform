/**
 * User roles
 */
export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
  ADMIN = 'ADMIN',
}

/**
 * Product review status
 */
export enum ProductReviewStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  NEEDS_REVISION = 'NEEDS_REVISION',
  REJECTED = 'REJECTED',
}

/**
 * User type
 */
export interface User {
  id: string
  email: string
  role: UserRole
  status: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

/**
 * Brand type
 */
export interface Brand {
  id: string
  user_id: string
  company_name: string
  website?: string
  logo_url?: string
  description?: string
  default_commission_rate: number
  api_key: string
  pixel_id: string
  integration_type: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * Brand Integration type (Meta CAPI + GA4)
 */
export interface BrandIntegration {
  id?: string
  brand_id?: string
  meta_pixel_id?: string
  meta_access_token?: string    // masked on GET (e.g. ••••abcd)
  meta_test_event_code?: string
  is_meta_enabled: boolean
  ga4_measurement_id?: string
  ga4_api_secret?: string       // masked on GET
  is_ga4_enabled: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Influencer type
 */
export interface Influencer {
  id: string
  user_id: string
  display_name: string
  bio?: string
  avatar_url?: string
  social_instagram?: string
  social_tiktok?: string
  social_youtube?: string
  social_twitter?: string
  follower_count: number
  niche?: string[]
  rating: number
  total_sales: number
  total_earnings: number
  total_clicks: number
  total_conversions: number
  status: string
  created_at: string
  updated_at: string
}

/**
 * Auth response
 */
export interface AuthResponse {
  access_token: string
  user: User
  brand?: Brand
  influencer?: Influencer
}

/**
 * Product type
 */
export interface Product {
  id: string
  brand_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  image_urls: string[]
  category?: string
  commission_rate?: number
  product_url: string
  sku?: string
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  review_status: ProductReviewStatus
  review_notes?: string
  created_at: string
  updated_at: string
  brand?: {
    id: string
    company_name: string
    logo_url?: string
  }
}

/**
 * Campaign type
 */
export interface Campaign {
  id: string
  brand_id: string
  name: string
  description?: string
  commission_rate: number
  budget?: number
  start_date?: string
  end_date?: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  target_product_ids?: string[]
  total_clicks: number
  total_conversions: number
  total_sales: number
  total_commission_paid: number
  created_at: string
  updated_at: string
}

/**
 * Tracking Link type
 */
export interface TrackingLink {
  id: string
  influencer_id: string
  product_id: string
  campaign_id?: string
  unique_code: string
  clicks: number
  conversions: number
  total_sales: number
  last_clicked_at?: string
  created_at: string
  updated_at: string
}

/**
 * Conversion type
 */
export interface Conversion {
  id: string
  tracking_link_id: string
  order_id: string
  order_value: number
  commission_amount: number
  commission_rate: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  conversion_date: string
  created_at: string
  updated_at: string
}

/**
 * Payout type
 */
export interface Payout {
  id: string
  influencer_id: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'WISE' | 'OTHER'
  payment_details?: any
  conversion_ids?: string[]
  transaction_id?: string
  processed_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  total_clicks: number
  total_conversions: number
  total_revenue: number
  total_commission: number
  conversion_rate: number
  average_order_value: number
}

/**
 * Analytics Data Point
 */
export interface AnalyticsDataPoint {
  date: string
  clicks: number
  conversions: number
  revenue: number
  commission: number
}

/**
 * Pagination
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  order?: 'ASC' | 'DESC'
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}
