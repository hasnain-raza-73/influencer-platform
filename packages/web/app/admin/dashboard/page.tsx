'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminOverview } from '@/services/admin-service'
import {
  Users,
  Package,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  BarChart3,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminService.getOverview(),
      adminService.getPlatformAnalytics({ preset: 'last_7_days' }),
    ])
      .then(([ov, analytics]) => {
        setOverview(ov)
        setPlatformAnalytics(analytics)
      })
      .catch((e) => setError(e.message || 'Failed to load overview'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = overview
    ? [
        {
          label: 'Total Revenue',
          value: `$${platformAnalytics?.total_revenue?.toLocaleString() || '0'}`,
          change: platformAnalytics?.revenue_growth || 0,
          icon: DollarSign,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          href: '/admin/reports',
        },
        {
          label: 'Total Brands',
          value: overview.total_brands,
          change: 0,
          icon: ShoppingBag,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          href: '/admin/brands',
        },
        {
          label: 'Total Influencers',
          value: overview.total_influencers,
          change: 0,
          icon: Users,
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          href: '/admin/influencers',
        },
        {
          label: 'Active Campaigns',
          value: overview.active_campaigns,
          subtitle: `of ${overview.total_campaigns} total`,
          icon: Target,
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          href: '/admin/campaigns',
        },
        {
          label: 'Total Conversions',
          value: platformAnalytics?.total_conversions?.toLocaleString() || '0',
          change: platformAnalytics?.conversion_growth || 0,
          icon: Activity,
          color: 'text-cyan-600 dark:text-cyan-400',
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          href: '/admin/conversions',
        },
        {
          label: 'Pending Payouts',
          value: `$${overview.pending_payout_amount.toFixed(2)}`,
          change: 0,
          icon: Wallet,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20',
          href: '/admin/payouts',
        },
      ]
    : []

  // Quick actions that need attention
  const alerts = []
  if (overview?.pending_reviews > 0) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      title: 'Products Pending Review',
      message: `${overview.pending_reviews} product${overview.pending_reviews > 1 ? 's' : ''} need review`,
      action: 'Review Products',
      href: '/admin/products',
    })
  }
  if (overview?.needs_revision > 0) {
    alerts.push({
      type: 'error',
      icon: XCircle,
      title: 'Products Need Revision',
      message: `${overview.needs_revision} product${overview.needs_revision > 1 ? 's' : ''} need revision`,
      action: 'View Products',
      href: '/admin/products',
    })
  }

  const revenueChartData = platformAnalytics?.revenue_chart || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Platform-wide statistics and real-time insights
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-4">
            {alerts.map((alert, idx) => (
              <Card
                key={idx}
                className={`border-l-4 ${
                  alert.type === 'warning'
                    ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <alert.icon
                        className={`w-5 h-5 ${
                          alert.type === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(alert.href)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        alert.type === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {alert.action}
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                onClick={() => router.push(stat.href)}
                className="cursor-pointer hover:shadow-xl transition-all duration-200 border-0 shadow-lg bg-white dark:bg-slate-800"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.bg} rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {stat.change !== 0 && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          stat.change > 0
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {stat.change > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(stat.change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Revenue Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversions Trend Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Conversions Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="conversions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'View All Brands', href: '/admin/brands', icon: ShoppingBag, color: 'blue' },
                {
                  label: 'View All Influencers',
                  href: '/admin/influencers',
                  icon: Users,
                  color: 'purple',
                },
                { label: 'Manage Campaigns', href: '/admin/campaigns', icon: Target, color: 'orange' },
                {
                  label: 'View Reports',
                  href: '/admin/reports',
                  icon: BarChart3,
                  color: 'green',
                },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => router.push(link.href)}
                  className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors text-left group"
                >
                  <link.icon
                    className={`w-6 h-6 mb-2 text-${link.color}-600 dark:text-${link.color}-400 group-hover:scale-110 transition-transform`}
                  />
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {link.label}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
