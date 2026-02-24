import { api } from '@/lib/api-client'
import { Payout, PaginationParams } from '@/types'

export interface CreatePayoutData {
  amount: number
  method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'WISE' | 'OTHER'
  payment_details?: {
    account_holder?: string
    account_number?: string
    bank_name?: string
    paypal_email?: string
    [key: string]: any
  }
  notes?: string
}

export interface AvailableBalanceResponse {
  available_balance: number
  pending_conversions_total: number
  paid_total: number
  total_approved: number
}

export interface PayoutStatsResponse {
  total_paid: number
  total_pending: number
  total_requested: number
  total_payouts: number
  average_payout: number
}

/**
 * Payouts Service
 */
export const payoutsService = {
  /**
   * Get available balance
   */
  async getAvailableBalance(): Promise<AvailableBalanceResponse> {
    const response = await api.get<AvailableBalanceResponse>('/payouts/balance')
    return response.data
  },

  /**
   * Get payout statistics
   */
  async getStatistics(): Promise<PayoutStatsResponse> {
    const response = await api.get<PayoutStatsResponse>('/payouts/statistics')
    return response.data
  },

  /**
   * Get all payouts
   */
  async getAll(params?: PaginationParams): Promise<Payout[]> {
    const response = await api.get<Payout[]>('/payouts', { params })
    return response.data
  },

  /**
   * Get single payout
   */
  async getById(id: string): Promise<Payout> {
    const response = await api.get<Payout>(`/payouts/${id}`)
    return response.data
  },

  /**
   * Request payout
   */
  async create(data: CreatePayoutData): Promise<Payout> {
    const response = await api.post<Payout>('/payouts', data)
    return response.data
  },

  /**
   * Cancel payout request
   */
  async cancel(id: string): Promise<Payout> {
    const response = await api.post<Payout>(`/payouts/${id}/cancel`)
    return response.data
  },
}
