'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { campaignsService } from '@/services/campaigns-service'
import { Campaign } from '@/types'

interface CampaignStats {
  campaign_id: string
  campaign_name: string
  status: string
  total_clicks: number
  total_conversions: number
  total_revenue: number
  total_commission_paid: number
  conversion_rate: number
  average_order_value: number
  roi: number
  budget?: number
  budget_spent: number
  budget_remaining?: number
  budget_used_percentage: number
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex h-screen bg-background-light dark:bg-background-dark items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">campaign</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Campaign not found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The campaign you're looking for doesn't exist.</p>
          <button
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
            onClick={() => router.push('/brand/campaigns')}
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-3">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 text-sm mb-4">
            <button
              className="text-slate-500 hover:text-primary transition-colors"
              onClick={() => router.push('/brand/campaigns')}
            >
              Campaigns
            </button>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            <span className="text-slate-900 dark:text-slate-100 font-medium">{campaign.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-slate-100">
                {campaign.name}
              </h1>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  campaign.status?.toUpperCase() === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : campaign.status?.toUpperCase() === 'PAUSED'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : campaign.status?.toUpperCase() === 'ENDED'
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}
              >
                {campaign.status}
              </span>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined mr-2 text-xl">share</span>
                Share Report
              </button>
              {campaign.status?.toUpperCase() === 'DRAFT' && (
                <button
                  className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                  onClick={handleActivate}
                  disabled={isStatusChanging}
                >
                  <span className="material-symbols-outlined mr-2 text-xl">play_arrow</span>
                  {isStatusChanging ? 'Activating...' : 'Activate Campaign'}
                </button>
              )}
              {campaign.status?.toUpperCase() === 'ACTIVE' && (
                <button
                  className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                  onClick={handlePause}
                  disabled={isStatusChanging}
                >
                  <span className="material-symbols-outlined mr-2 text-xl">pause</span>
                  {isStatusChanging ? 'Pausing...' : 'Pause Campaign'}
                </button>
              )}
              {campaign.status?.toUpperCase() === 'PAUSED' && (
                <button
                  className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                  onClick={handleActivate}
                  disabled={isStatusChanging}
                >
                  <span className="material-symbols-outlined mr-2 text-xl">play_arrow</span>
                  {isStatusChanging ? 'Resuming...' : 'Resume Campaign'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Performance Breakdown */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            {/* Stat Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Reach</p>
                <p className="text-slate-900 dark:text-slate-100 text-2xl font-black">
                  {stats?.total_clicks
                    ? stats.total_clicks >= 1000000
                      ? `${(stats.total_clicks / 1000000).toFixed(1)}M`
                      : stats.total_clicks >= 1000
                      ? `${(stats.total_clicks / 1000).toFixed(1)}K`
                      : stats.total_clicks
                    : '0'}
                </p>
                <p className="text-green-600 text-xs font-medium mt-1 flex items-center">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  Total clicks
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Engagements</p>
                <p className="text-slate-900 dark:text-slate-100 text-2xl font-black">
                  {stats?.total_conversions?.toLocaleString() || '0'}
                </p>
                <p className="text-green-600 text-xs font-medium mt-1 flex items-center">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  Conversions
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Conversion Rate</p>
                <p className="text-slate-900 dark:text-slate-100 text-2xl font-black">
                  {stats?.conversion_rate?.toFixed(1) || '0.0'}%
                </p>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Goal: {(stats?.conversion_rate || 0) + 0.5}%
                </p>
              </div>
            </div>

            {/* Charts Section - Demographics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Performance Metrics</h3>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ${stats?.total_revenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-green-600">attach_money</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Average Order Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ${stats?.average_order_value?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-purple-600">shopping_bag</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Commission Paid</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ${stats?.total_commission_paid?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-orange-600">payments</span>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">ROI Analysis</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-400 font-bold uppercase tracking-wider mb-2">
                    Net Profit
                  </p>
                  <p className="text-3xl font-black text-green-700 dark:text-green-400">
                    ${((stats?.total_revenue || 0) - (stats?.total_commission_paid || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider mb-2">
                    ROI
                  </p>
                  <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
                    {stats?.roi?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Device Distribution</h3>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="flex items-end justify-between h-48 gap-4 px-4 pt-4 border-b border-slate-100 dark:border-slate-800">
                {stats?.device_distribution && stats.device_distribution.length > 0 ? (
                  stats.device_distribution.map((device: any, index: number) => {
                    const maxPercentage = Math.max(...stats.device_distribution.map((d: any) => d.percentage))
                    const heightPercentage = maxPercentage > 0 ? (device.percentage / maxPercentage) * 100 : 0
                    const colors = ['bg-primary', 'bg-primary/70', 'bg-primary/50', 'bg-primary/30', 'bg-primary/20']
                    return (
                      <div key={device.device_type} className="flex flex-col items-center flex-1 gap-4 h-full justify-end">
                        <div
                          className={`${colors[index % colors.length]} w-full rounded-t-lg transition-all hover:opacity-90`}
                          style={{ height: `${heightPercentage}%` }}
                          title={`${device.clicks} clicks (${device.percentage.toFixed(1)}%)`}
                        ></div>
                        <span className="text-xs font-bold text-slate-500 pb-2 capitalize">{device.device_type}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="w-full flex items-center justify-center text-slate-400 py-8">
                    <p className="text-sm">No device data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Traffic by Device</h3>
              </div>
              <div className="grid grid-cols-4 gap-8 h-48 px-4 items-end">
                {stats?.device_distribution && stats.device_distribution.length > 0 ? (
                  stats.device_distribution.slice(0, 4).map((device: any, index: number) => {
                    const maxClicks = Math.max(...stats.device_distribution.map((d: any) => d.clicks))
                    const heightPercentage = maxClicks > 0 ? (device.clicks / maxClicks) * 100 : 0
                    const colors = ['bg-primary', 'bg-primary/70', 'bg-primary/50', 'bg-primary/30']
                    return (
                      <div key={device.device_type} className="flex flex-col items-center gap-4 h-full justify-end">
                        <div
                          className={`${colors[index % colors.length]} w-full rounded-t-lg transition-all hover:opacity-90`}
                          style={{ height: `${heightPercentage}%` }}
                          title={`${device.clicks} clicks`}
                        ></div>
                        <span className="text-xs font-bold text-slate-500 capitalize">{device.device_type}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-4 flex items-center justify-center text-slate-400">
                    <p className="text-sm">No traffic data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Actions and Milestones */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                  onClick={() => router.push(`/brand/campaigns/${campaign.id}/invitations`)}
                >
                  <span className="material-symbols-outlined text-primary">mail</span>
                  <span className="text-sm font-semibold">Manage Invitations</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <span className="material-symbols-outlined text-primary">download</span>
                  <span className="text-sm font-semibold">Export Detailed Report</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <span className="text-sm font-semibold">Edit Campaign Budget</span>
                </button>
              </div>
            </div>

            {/* Campaign Milestones Timeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-6">Campaign Milestones</h3>
              <div className="relative space-y-0">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

                {/* Milestone 1 - Created */}
                <div className="relative flex gap-4 pb-8">
                  <div className="mt-1 size-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">Campaign Created</p>
                    <p className="text-slate-500 text-xs">{formatDate(campaign.created_at)}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      Campaign was set up with {campaign.commission_rate}% commission rate.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 - Launched */}
                {campaign.start_date && (
                  <div className="relative flex gap-4 pb-8">
                    <div className="mt-1 size-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">Campaign Launched</p>
                      <p className="text-slate-500 text-xs">{formatDate(campaign.start_date)}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Campaign went live and started accepting tracking links.
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestone 3 - First conversion */}
                {(stats?.total_conversions || 0) > 0 && (
                  <div className="relative flex gap-4 pb-8">
                    <div className="mt-1 size-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">First Conversion</p>
                      <p className="text-slate-500 text-xs">Campaign milestone reached</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Generated {stats?.total_conversions} total conversions worth $
                        {stats?.total_revenue?.toLocaleString() || '0'}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestone 4 - Current/Future */}
                {campaign.status?.toUpperCase() === 'ACTIVE' && (
                  <div className="relative flex gap-4 pb-8">
                    <div className="mt-1 size-6 rounded-full bg-primary border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-primary text-sm font-bold">Campaign Running</p>
                      <p className="text-slate-500 text-xs">Currently active</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Monitor performance and adjust strategy as needed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestone 5 - End date */}
                {campaign.end_date && (
                  <div className="relative flex gap-4">
                    <div
                      className={`mt-1 size-6 rounded-full border-4 border-white dark:border-slate-900 z-10 ${
                        campaign.status?.toUpperCase() === 'ENDED'
                          ? 'bg-slate-500'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p
                        className={
                          campaign.status?.toUpperCase() === 'ENDED'
                            ? 'text-slate-900 dark:text-slate-100 text-sm font-bold'
                            : 'text-slate-400 text-sm font-bold'
                        }
                      >
                        Campaign {campaign.status?.toUpperCase() === 'ENDED' ? 'Ended' : 'End Date'}
                      </p>
                      <p className="text-slate-400 text-xs">{formatDate(campaign.end_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
