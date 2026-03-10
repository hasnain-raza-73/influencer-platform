'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/admin-service'
import Link from 'next/link'

interface OverviewData {
  total_brands: number
  active_brands?: number
  total_influencers: number
  active_influencers?: number
  total_campaigns: number
  active_campaigns: number
  total_products?: number
  pending_reviews: number
  total_conversions: number
  total_platform_revenue: number
  pending_payouts?: number
  pending_payout_amount: number
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      const data = await adminService.getOverview()
      setOverview(data)
    } catch (error) {
      console.error('Failed to fetch overview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Brands',
      value: overview?.total_brands || 0,
      subtitle: `${overview?.active_brands || 0} active`,
      icon: 'business',
      color: 'bg-blue-500',
      link: '/admin/brands',
    },
    {
      title: 'Total Influencers',
      value: overview?.total_influencers || 0,
      subtitle: `${overview?.active_influencers || 0} active`,
      icon: 'people',
      color: 'bg-purple-500',
      link: '/admin/influencers',
    },
    {
      title: 'Active Campaigns',
      value: overview?.active_campaigns || 0,
      subtitle: `${overview?.total_campaigns || 0} total`,
      icon: 'campaign',
      color: 'bg-green-500',
      link: '/admin/campaigns',
    },
    {
      title: 'Pending Products',
      value: overview?.pending_reviews || 0,
      subtitle: `${overview?.total_products || 0} total`,
      icon: 'inventory',
      color: 'bg-orange-500',
      link: '/admin/products',
    },
    {
      title: 'Total Conversions',
      value: overview?.total_conversions || 0,
      subtitle: `$${((overview?.total_platform_revenue || 0) / 100).toFixed(2)} revenue`,
      icon: 'shopping_cart',
      color: 'bg-teal-500',
      link: '/admin/conversions',
    },
    {
      title: 'Pending Payouts',
      value: overview?.pending_payouts || 0,
      subtitle: `$${((overview?.pending_payout_amount || 0) / 100).toFixed(2)} amount`,
      icon: 'payments',
      color: 'bg-red-500',
      link: '/admin/payouts',
    },
  ]

  const quickActions = [
    {
      title: 'Review Products',
      description: 'Approve or reject pending products',
      icon: 'inventory',
      link: '/admin/products?status=PENDING',
      color: 'bg-orange-500',
    },
    {
      title: 'Manage Brands',
      description: 'View and manage all brands',
      icon: 'business',
      link: '/admin/brands',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Influencers',
      description: 'View and manage all influencers',
      icon: 'people',
      link: '/admin/influencers',
      color: 'bg-purple-500',
    },
    {
      title: 'Process Payouts',
      description: 'Review and process pending payouts',
      icon: 'payments',
      link: '/admin/payouts?status=PENDING',
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.link}
            className="bg-card rounded-lg border p-6 hover:shadow-lg transition-all hover:border-primary/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold mb-2">{stat.value.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
              </div>
              <div className={`size-12 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.link}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-all hover:border-primary/50 group"
            >
              <div className={`size-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/campaigns"
            className="bg-card rounded-lg border p-6 hover:shadow-lg transition-all hover:border-primary/50 flex items-center gap-4"
          >
            <div className="size-12 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
              <span className="material-symbols-outlined">campaign</span>
            </div>
            <div>
              <h3 className="font-semibold">Campaigns</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage all campaigns</p>
            </div>
          </Link>

          <Link
            href="/admin/conversions"
            className="bg-card rounded-lg border p-6 hover:shadow-lg transition-all hover:border-primary/50 flex items-center gap-4"
          >
            <div className="size-12 rounded-lg bg-teal-500 flex items-center justify-center text-white flex-shrink-0">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h3 className="font-semibold">Conversions</h3>
              <p className="text-sm text-muted-foreground">Track all platform conversions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
