'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Link as LinkIcon,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react'
import { analyticsService, InfluencerDashboardResponse } from '@/services/analytics-service'
import { campaignsService } from '@/services/campaigns-service'
import { trackingService } from '@/services/tracking-service'
import { payoutsService, AvailableBalanceResponse } from '@/services/payouts-service'
import { Campaign, TrackingLink } from '@/types'

export default function InfluencerDashboard() {
  const router = useRouter()
  const { user, influencer, isAuthenticated } = useAuthStore()

  const [dashboardData, setDashboardData] = useState<InfluencerDashboardResponse | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [trackingLinks, setTrackingLinks] = useState<TrackingLink[]>([])
  const [balance, setBalance] = useState<AvailableBalanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadDashboardData()
  }, [isAuthenticated, user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Load all dashboard data in parallel
      const [dashboardRes, campaignsRes, trackingRes, balanceRes] = await Promise.all([
        analyticsService.getInfluencerDashboard().catch(() => null),
        campaignsService.getActiveCampaigns({ limit: 5 }).catch(() => []),
        trackingService.getAll({ limit: 5 }).catch(() => []),
        payoutsService.getAvailableBalance().catch(() => null),
      ])

      if (dashboardRes) {
        setDashboardData(dashboardRes)
      }
      setCampaigns(campaignsRes)
      setTrackingLinks(trackingRes)
      if (balanceRes) {
        setBalance(balanceRes)
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth or loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Available Balance',
      value: `$${typeof balance?.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'}`,
      change: balance?.total_approved && typeof balance.total_approved === 'number' ? `$${balance.total_approved.toFixed(2)} approved` : '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Clicks',
      value: dashboardData?.stats?.total_clicks?.toLocaleString() || influencer?.total_clicks?.toLocaleString() || '0',
      change: dashboardData?.stats?.total_clicks ? '+15.3%' : '+0%',
      trend: 'up',
      icon: MousePointerClick,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Conversions',
      value: dashboardData?.stats?.total_conversions?.toLocaleString() || influencer?.total_conversions?.toLocaleString() || '0',
      change: `${typeof dashboardData?.stats?.conversion_rate === 'number' ? dashboardData.stats.conversion_rate.toFixed(1) : '0'}% rate`,
      trend: dashboardData?.stats?.conversion_rate ? 'up' : 'neutral',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Earnings',
      value: `$${dashboardData?.stats?.total_commission?.toLocaleString() || (typeof influencer?.total_earnings === 'number' ? influencer.total_earnings.toFixed(2) : '0.00')}`,
      change: `$${dashboardData?.stats?.total_revenue?.toLocaleString() || (typeof influencer?.total_sales === 'number' ? influencer.total_sales.toFixed(2) : '0')} sales`,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Influencer Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {influencer?.display_name || user?.email || 'Influencer'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => router.push('/influencer/campaigns')}
              >
                <Target className="w-4 h-4 mr-2" />
                Browse Campaigns
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} variant="elevated" className="hover:shadow-large transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.trend === 'up' && (
                          <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                        )}
                        {stat.trend === 'down' && (
                          <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <p className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-600' :
                          stat.trend === 'down' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/influencer/campaigns')}
            >
              <Target className="w-5 h-5 mr-2" />
              Browse Campaigns
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/influencer/tracking-links')}
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              My Tracking Links
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push('/influencer/payouts')}
              disabled={!balance || balance.available_balance === 0}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Request Payout
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Campaigns */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Available Campaigns</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/influencer/campaigns')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No campaigns available</p>
                  <Button variant="secondary" onClick={() => router.push('/influencer/campaigns')}>
                    Explore Campaigns
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {campaign.commission_rate}% commission
                          {campaign.budget && ` • $${campaign.budget?.toLocaleString() || '0'} budget`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tracking Links */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Tracking Links</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/influencer/tracking-links')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
                </div>
              ) : trackingLinks.length === 0 ? (
                <div className="text-center py-8">
                  <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No tracking links yet</p>
                  <Button variant="secondary" onClick={() => router.push('/influencer/tracking-links/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trackingLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-4 bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-xs font-mono text-gray-600 bg-gray-200 px-2 py-1 rounded">
                          {link.unique_code}
                        </code>
                        <button
                          title="Copy tracking URL"
                          className="hover:text-gray-600 text-gray-400 transition-colors cursor-pointer"
                          onClick={() => {
                            const url = `${window.location.origin}/track/${link.unique_code}`
                            navigator.clipboard.writeText(url)
                          }}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Clicks</p>
                          <p className="font-semibold text-gray-900">{link.clicks}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-semibold text-gray-900">{link.conversions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sales</p>
                          <p className="font-semibold text-gray-900">${typeof link.total_sales === 'number' ? link.total_sales.toFixed(2) : '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        {dashboardData?.stats?.total_clicks && dashboardData.stats.total_clicks > 0 && (
          <Card variant="elevated" className="mt-6">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {typeof dashboardData.stats?.conversion_rate === 'number' ? dashboardData.stats.conversion_rate.toFixed(2) : '0.00'}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Avg Commission</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${(typeof dashboardData.stats?.total_commission === 'number' && typeof dashboardData.stats?.total_conversions === 'number'
                      ? (dashboardData.stats.total_commission / (dashboardData.stats.total_conversions || 1)).toFixed(2)
                      : '0.00')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Revenue Generated</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${dashboardData.stats?.total_revenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Info */}
        {balance && balance.available_balance > 0 && (
          <Card variant="elevated" className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to withdraw?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You have ${typeof balance.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'} available for payout
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/influencer/payouts/new')}
                >
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
