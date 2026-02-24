'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
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

      // Load all dashboard data in parallel
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

  // Show loading state while checking auth or loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.stats?.total_revenue?.toLocaleString() || '0'}`,
      change: dashboardData?.stats?.total_revenue ? '+12.5%' : '0%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Clicks',
      value: dashboardData?.stats?.total_clicks?.toLocaleString() || '0',
      change: dashboardData?.stats?.total_clicks ? '+23.1%' : '0%',
      trend: 'up',
      icon: MousePointerClick,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Conversions',
      value: dashboardData?.stats?.total_conversions?.toLocaleString() || '0',
      change: `${typeof dashboardData?.stats?.conversion_rate === 'number' ? dashboardData.stats.conversion_rate.toFixed(1) : '0'}% rate`,
      trend: dashboardData?.stats?.conversion_rate ? 'up' : 'neutral',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length.toString(),
      change: `${campaigns.length} total`,
      trend: 'neutral',
      icon: Target,
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
              <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {brand?.company_name || user?.email || 'Brand User'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => router.push('/brand/campaigns/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
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
              onClick={() => router.push('/brand/products/new')}
            >
              <Package className="w-5 h-5 mr-2" />
              Add Product
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/brand/campaigns/new')}
            >
              <Target className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push('/brand/influencers')}
            >
              <Users className="w-5 h-5 mr-2" />
              Find Influencers
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Campaigns */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/brand/campaigns')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No campaigns yet</p>
                  <Button variant="primary" onClick={() => router.push('/brand/campaigns/new')}>
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {campaign.total_conversions || 0} conversions • ${campaign.total_sales?.toLocaleString() || '0'} revenue
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status?.toUpperCase() === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status?.toUpperCase() === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : campaign.status?.toUpperCase() === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Products</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/brand/products')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No products yet</p>
                  <Button variant="primary" onClick={() => router.push('/brand/products/new')}>
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/brand/products/${product.id}`)}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">${product.price?.toLocaleString() || '0'}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status?.toUpperCase() === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : product.status?.toUpperCase() === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.status}
                      </span>
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
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${typeof dashboardData.stats?.average_order_value === 'number' ? dashboardData.stats.average_order_value.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Commission</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${dashboardData.stats?.total_commission?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
