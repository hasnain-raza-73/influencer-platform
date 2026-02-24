'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { payoutsService, AvailableBalanceResponse, PayoutStatsResponse } from '@/services/payouts-service'
import { Payout } from '@/types'

export default function PayoutsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [payouts, setPayouts] = useState<Payout[]>([])
  const [balance, setBalance] = useState<AvailableBalanceResponse | null>(null)
  const [stats, setStats] = useState<PayoutStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadData()
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [payoutsRes, balanceRes, statsRes] = await Promise.all([
        payoutsService.getAll().catch(() => []),
        payoutsService.getAvailableBalance().catch(() => null),
        payoutsService.getStatistics().catch(() => null),
      ])

      setPayouts(payoutsRes || [])
      setBalance(balanceRes)
      setStats(statsRes)
    } catch (err: any) {
      console.error('Error loading payouts:', err)
      setError(err.message || 'Failed to load payouts')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700'
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payouts & Earnings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your earnings and request payouts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => router.push('/influencer/payouts/new')}
                disabled={!balance || balance.available_balance === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            {balance && (
              <Card variant="elevated" className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Available Balance</p>
                      <p className="text-5xl font-bold text-gray-900 mb-4">
                        ${typeof balance.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Approved:</span> ${typeof balance.total_approved === 'number' ? balance.total_approved.toFixed(2) : '0.00'}
                        </div>
                        <div>
                          <span className="font-medium">Pending:</span> ${typeof balance.pending_conversions_total === 'number' ? balance.pending_conversions_total.toFixed(2) : '0.00'}
                        </div>
                        <div>
                          <span className="font-medium">Paid:</span> ${typeof balance.paid_total === 'number' ? balance.paid_total.toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push('/influencer/payouts/new')}
                      disabled={balance.available_balance === 0}
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Request Payout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Paid</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          ${typeof stats.total_paid === 'number' ? stats.total_paid.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          ${typeof stats.total_pending === 'number' ? stats.total_pending.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {stats.total_payouts || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Payout</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          ${typeof stats.average_payout === 'number' ? stats.average_payout.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payouts History */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No payout requests yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Request your first payout when you have available balance
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(payout.status)}
                          <div>
                            <p className="font-semibold text-gray-900">
                              ${typeof payout.amount === 'number' ? payout.amount.toFixed(2) : '0.00'}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(payout.created_at)}
                              </span>
                              <span>• {payout.method?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {payout.completed_at && (
                            <div className="text-right text-sm">
                              <p className="text-gray-500">Completed</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(payout.completed_at)}
                              </p>
                            </div>
                          )}
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
