'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  MousePointerClick,
  ShoppingCart,
  Users,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Pause,
  StopCircle,
} from 'lucide-react'
import { campaignsService } from '@/services/campaigns-service'
import { Campaign } from '@/types'

interface CampaignStats {
  total_clicks: number
  total_conversions: number
  total_sales: number
  conversion_rate: number
  average_order_value: number
  total_commission_paid: number
  active_influencers: number
  total_tracking_links: number
}

export default function BrandCampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStatusChanging, setIsStatusChanging] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }

    loadCampaignData()
  }, [isAuthenticated, user, router, campaignId])

  const loadCampaignData = async () => {
    try {
      setIsLoading(true)
      setError('')
      const [campaignData, statsData] = await Promise.all([
        campaignsService.getById(campaignId),
        campaignsService.getStatistics(campaignId).catch(() => null),
      ])
      setCampaign(campaignData)
      setStats(statsData)
    } catch (err: any) {
      console.error('Error loading campaign data:', err)
      setError(err.message || 'Failed to load campaign data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!campaign) return
    try {
      setIsStatusChanging(true)
      const updated = await campaignsService.activate(campaign.id)
      setCampaign(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to activate campaign')
    } finally {
      setIsStatusChanging(false)
    }
  }

  const handlePause = async () => {
    if (!campaign) return
    try {
      setIsStatusChanging(true)
      const updated = await campaignsService.pause(campaign.id)
      setCampaign(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to pause campaign')
    } finally {
      setIsStatusChanging(false)
    }
  }

  const handleEnd = async () => {
    if (!campaign || !confirm('Are you sure you want to end this campaign? This cannot be undone.')) return
    try {
      setIsStatusChanging(true)
      const updated = await campaignsService.end(campaign.id)
      setCampaign(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to end campaign')
    } finally {
      setIsStatusChanging(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-700', iconColor: 'text-green-600' }
      case 'PAUSED':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' }
      case 'ENDED':
        return { icon: XCircle, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' }
      case 'DRAFT':
        return { icon: Clock, color: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-600' }
      default:
        return { icon: Clock, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/brand/campaigns')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </div>
            {campaign && (
              <div className="flex items-center gap-2">
                {campaign.status?.toUpperCase() === 'DRAFT' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleActivate}
                    disabled={isStatusChanging}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isStatusChanging ? 'Activating...' : 'Activate Campaign'}
                  </Button>
                )}
                {campaign.status?.toUpperCase() === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePause}
                    disabled={isStatusChanging}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    {isStatusChanging ? 'Pausing...' : 'Pause Campaign'}
                  </Button>
                )}
                {campaign.status?.toUpperCase() === 'PAUSED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleActivate}
                    disabled={isStatusChanging}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isStatusChanging ? 'Resuming...' : 'Resume Campaign'}
                  </Button>
                )}
                {(['ACTIVE', 'PAUSED'].includes(campaign.status?.toUpperCase())) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnd}
                    disabled={isStatusChanging}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Campaign
                  </Button>
                )}
              </div>
            )}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : campaign ? (
          <>
            {/* Campaign Header */}
            <Card variant="elevated" className="mb-6">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Target className="w-8 h-8 text-primary-600" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {campaign.name}
                        </h1>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const statusBadge = getStatusBadge(campaign.status)
                            const StatusIcon = statusBadge.icon
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusBadge.color}`}>
                                <StatusIcon className={`w-4 h-4 ${statusBadge.iconColor}`} />
                                {campaign.status}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                    {campaign.description && (
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campaign Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Commission Rate */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-green-700 font-medium">Commission Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {campaign.commission_rate}%
                    </p>
                  </div>

                  {/* Budget */}
                  {campaign.budget && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700 font-medium">Budget</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        ${campaign.budget?.toLocaleString() || '0'}
                      </p>
                    </div>
                  )}

                  {/* Start Date */}
                  {campaign.start_date && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Started</p>
                      </div>
                      <p className="text-sm font-bold text-purple-700">
                        {formatDate(campaign.start_date)}
                      </p>
                    </div>
                  )}

                  {/* End Date */}
                  {campaign.end_date && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-700 font-medium">Ends</p>
                      </div>
                      <p className="text-sm font-bold text-orange-700">
                        {formatDate(campaign.end_date)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Clicks */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.total_clicks?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MousePointerClick className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Conversions */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversions</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.total_conversions?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {typeof stats.conversion_rate === 'number' ? stats.conversion_rate.toFixed(2) : '0.00'}% conversion rate
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Sales */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          ${stats.total_sales?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ${typeof stats.average_order_value === 'number' ? stats.average_order_value.toFixed(2) : '0.00'} avg order
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Commission Paid */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          ${stats.total_commission_paid?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Influencer Engagement */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Influencer Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Active Influencers</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.active_influencers || 0}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Tracking Links Created</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.total_tracking_links || 0}
                          </p>
                        </div>
                        <LinkIcon className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      ROI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-xl font-bold text-green-600">
                            ${stats.total_sales?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Commission Spent</p>
                          <p className="text-xl font-bold text-orange-600">
                            ${stats.total_commission_paid?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Net Profit</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ${((stats.total_sales || 0) - (stats.total_commission_paid || 0)).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            ROI: {(stats.total_commission_paid || 0) > 0 && typeof stats.total_sales === 'number' && typeof stats.total_commission_paid === 'number'
                              ? ((stats.total_sales / stats.total_commission_paid) * 100).toFixed(1)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance Summary */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Key Insights:</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Your campaign has generated <strong>${campaign.total_sales?.toLocaleString() || '0'}</strong> in total sales
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{campaign.total_conversions || 0}</strong> successful conversions from influencer promotions
                      </span>
                    </li>
                    {stats && (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>{stats.active_influencers || 0}</strong> influencers actively promoting your campaign
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            Average conversion rate of <strong>{typeof stats.conversion_rate === 'number' ? stats.conversion_rate.toFixed(2) : '0.00'}%</strong> across all tracking links
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign not found</h3>
              <p className="text-gray-600 mb-6">
                The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button variant="primary" onClick={() => router.push('/brand/campaigns')}>
                Back to Campaigns
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
