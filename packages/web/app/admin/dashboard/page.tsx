'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminOverview } from '@/services/admin-service'
import { Users, Package, Target, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getOverview()
      .then(setOverview)
      .catch((e) => setError(e.message || 'Failed to load overview'))
      .finally(() => setIsLoading(false))
  }, [])

  const stats = overview ? [
    { label: 'Total Brands', value: overview.total_brands, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/brands' },
    { label: 'Total Influencers', value: overview.total_influencers, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/influencers' },
    { label: 'Pending Reviews', value: overview.pending_reviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/products' },
    { label: 'Active Campaigns', value: overview.active_campaigns, icon: Target, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/campaigns' },
    { label: 'Pending Payouts', value: `$${overview.pending_payout_amount.toFixed(2)}`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50', href: '/admin/payouts' },
    { label: 'Platform Revenue', value: `$${overview.total_platform_revenue.toFixed(2)}`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/admin/conversions' },
  ] : []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Platform-wide statistics and management</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <button
                  key={stat.label}
                  onClick={() => router.push(stat.href)}
                  className="text-left w-full"
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {overview && overview.needs_revision > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {overview.needs_revision} product{overview.needs_revision > 1 ? 's' : ''} need revision
                </p>
                <button
                  onClick={() => router.push('/admin/products')}
                  className="text-xs text-amber-700 underline mt-0.5"
                >
                  Review now →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
