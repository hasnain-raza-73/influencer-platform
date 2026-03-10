'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { analyticsService, BrandDashboardResponse } from '@/services/analytics-service'
import { campaignsService } from '@/services/campaigns-service'
import { productsService } from '@/services/products-service'
import { Campaign, Product } from '@/types'

export default function BrandDashboard() {
  const router = useRouter()
  const { user, brand, isAuthenticated } = useAuthStore()

  const [dashboardData, setDashboardData] = useState<BrandDashboardResponse | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }

    loadDashboardData()
  }, [isAuthenticated, user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [dashboardRes, campaignsRes, productsRes] = await Promise.all([
        analyticsService.getBrandDashboard().catch(() => null),
        campaignsService.getAll({ limit: 5 }).catch(() => []),
        brand?.id
          ? productsService.getBrandProducts(brand.id, { limit: 5 }).catch(() => ({ products: [] }))
          : Promise.resolve({ products: [] }),
      ])

      if (dashboardRes) {
        setDashboardData(dashboardRes)
      }
      setCampaigns(campaignsRes)
      setProducts(productsRes.products || [])
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const activeCampaignsCount = campaigns.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length
  const totalReach = dashboardData?.stats?.total_clicks || 0
  const avgEngagement = dashboardData?.stats?.conversion_rate || 0
  const totalSpend = dashboardData?.stats?.total_commission || 0

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 h-16 flex items-center justify-between">
        <div className="w-full max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            placeholder="Search campaigns, influencers..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="size-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-primary/20"
            onClick={() => router.push('/brand/campaigns/new')}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Create Campaign
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Active Campaigns</span>
              <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined text-lg">
                rocket_launch
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{activeCampaignsCount}</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {campaigns.length} total campaigns
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Total Reach</span>
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 material-symbols-outlined text-lg">
                group
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {totalReach >= 1000000
                ? `${(totalReach / 1000000).toFixed(1)}M`
                : totalReach >= 1000
                ? `${(totalReach / 1000).toFixed(1)}K`
                : totalReach}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Total clicks
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Avg. Engagement</span>
              <span className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 material-symbols-outlined text-lg">
                favorite
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{avgEngagement.toFixed(1)}%</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500">
              Conversion rate
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Total Spend</span>
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 material-symbols-outlined text-lg">
                payments
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ${totalSpend >= 1000 ? `${(totalSpend / 1000).toFixed(1)}k` : totalSpend.toFixed(0)}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Commission paid
            </div>
          </div>
        </div>

        {/* Middle Row: Chart & Top Influencers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Area */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Campaign Performance</h3>
                <p className="text-sm text-slate-500">Overview of recent activity</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded shadow-sm">
                  30d
                </button>
                <button className="px-3 py-1 text-xs font-semibold text-slate-500">90d</button>
                <button className="px-3 py-1 text-xs font-semibold text-slate-500">12m</button>
              </div>
            </div>
            <div className="flex-1 h-64 w-full relative">
              {dashboardData?.performance_chart && dashboardData.performance_chart.length > 0 ? (
                <>
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                    <defs>
                      <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#2463eb" stopOpacity="0.2"></stop>
                        <stop offset="100%" stopColor="#2463eb" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    {(() => {
                      const data = dashboardData.performance_chart
                      const maxValue = Math.max(...data.map((d: any) => d.clicks || 0), 1)
                      const points = data
                        .map((d: any, i: number) => {
                          const x = (i / Math.max(data.length - 1, 1)) * 1000
                          const y = 300 - (((d.clicks || 0) / maxValue) * 250)
                          return `${x},${y}`
                        })
                        .join(' ')
                      const pathData = `M ${points} L 1000,300 L 0,300 Z`
                      const lineData = `M ${points}`

                      // Also create conversion line
                      const maxConversions = Math.max(...data.map((d: any) => d.conversions || 0), 1)
                      const convPoints = data
                        .map((d: any, i: number) => {
                          const x = (i / Math.max(data.length - 1, 1)) * 1000
                          const y = 300 - (((d.conversions || 0) / maxConversions) * 200)
                          return `${x},${y}`
                        })
                        .join(' ')

                      return (
                        <>
                          <path d={pathData} fill="url(#gradient)"></path>
                          <path d={lineData} fill="none" stroke="#2463eb" strokeLinecap="round" strokeWidth="4"></path>
                          <path d={`M ${convPoints}`} fill="none" stroke="#94a3b8" strokeDasharray="8,8" strokeWidth="2"></path>
                        </>
                      )
                    })()}
                  </svg>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    {dashboardData.performance_chart
                      .filter((_: any, i: number) => i % Math.ceil(dashboardData.performance_chart.length / 5) === 0)
                      .slice(0, 5)
                      .map((d: any, i: number) => (
                        <span key={i}>{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2">insights</span>
                    <p className="text-sm">No data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Products</h3>
              <button
                className="text-primary text-xs font-bold hover:underline"
                onClick={() => router.push('/brand/products')}
              >
                View All
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inventory_2</span>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">No products yet</p>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                  onClick={() => router.push('/brand/products/new')}
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/brand/products/${product.id}`)}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="size-10 rounded-lg object-cover" />
                    ) : (
                      <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{product.name}</p>
                      <p className="text-xs text-slate-500">${product.price?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.status?.toUpperCase() === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Recent Campaigns</h3>
            <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all">
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filter
            </button>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">campaign</span>
              <p className="text-slate-600 dark:text-slate-400 mb-4">No campaigns yet</p>
              <button
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                onClick={() => router.push('/brand/campaigns/new')}
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Conversions</th>
                      <th className="px-6 py-4">Revenue</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {campaigns.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {campaign.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              campaign.status?.toUpperCase() === 'ACTIVE'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                : campaign.status?.toUpperCase() === 'PAUSED'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : campaign.status?.toUpperCase() === 'ENDED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {campaign.total_conversions || 0}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          ${campaign.total_sales?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="material-symbols-outlined text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            more_horiz
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {campaigns.length > 4 && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Showing {campaigns.length} campaigns</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
