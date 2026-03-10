'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminOverview } from '@/services/admin-service'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Target,
  DollarSign,
  ArrowLeftRight,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
}

const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminReportsPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null)
  const [brands, setBrands] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<string>('last_30_days')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [ov, analytics, br, inf, camp, conv] = await Promise.all([
        adminService.getOverview(),
        adminService.getPlatformAnalytics({ preset: dateFilter }),
        adminService.getBrands({ limit: 100 }),
        adminService.getInfluencers({ limit: 100 }),
        adminService.getCampaigns({ limit: 100 }),
        adminService.getConversions({ limit: 50 }),
      ])
      setOverview(ov)
      setPlatformAnalytics(analytics)
      setBrands(br.data || [])
      setInfluencers(inf.data || [])
      setCampaigns(camp.data || [])
      setConversions(conv.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dateFilter])

  const exportToCSV = () => {
    if (!platformAnalytics) return

    const csv = [
      ['Platform Analytics Report'],
      ['Date Range', dateFilter],
      [''],
      ['Metric', 'Value'],
      ['Total Revenue', `$${platformAnalytics.total_revenue?.toFixed(2) || 0}`],
      ['Total Conversions', platformAnalytics.total_conversions || 0],
      ['Total Commission', `$${platformAnalytics.total_commission?.toFixed(2) || 0}`],
      ['Conversion Rate', `${platformAnalytics.conversion_rate?.toFixed(2) || 0}%`],
      ['Revenue Growth', `${platformAnalytics.revenue_growth?.toFixed(2) || 0}%`],
      [''],
      ['Top Brands'],
      ['Brand', 'Revenue', 'Conversions'],
      ...(platformAnalytics.top_brands || []).map((b: any) => [
        b.brand_name,
        `$${b.revenue.toFixed(2)}`,
        b.conversions,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platform-report-${new Date().toISOString()}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Computed metrics
  const totalRevenue = platformAnalytics?.total_revenue || 0
  const activeBrands = brands.filter((b) => b.status === 'ACTIVE').length
  const suspendedBrands = brands.filter((b) => b.status === 'SUSPENDED').length
  const activeInfluencers = influencers.filter((i) => i.status === 'ACTIVE').length
  const suspendedInfluencers = influencers.filter((i) => i.status === 'SUSPENDED').length
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const endedCampaigns = campaigns.filter((c) => c.status === 'ended').length

  // Prepare chart data
  const revenueChartData = platformAnalytics?.revenue_chart || []
  const topBrandsChartData = (platformAnalytics?.top_brands || []).slice(0, 5)
  const topInfluencersChartData = (platformAnalytics?.top_influencers || []).slice(0, 5)

  const statusPieData = [
    { name: 'Pending', value: platformAnalytics?.conversions_by_status?.pending || 0 },
    { name: 'Approved', value: platformAnalytics?.conversions_by_status?.approved || 0 },
    { name: 'Rejected', value: platformAnalytics?.conversions_by_status?.rejected || 0 },
    { name: 'Paid', value: platformAnalytics?.conversions_by_status?.paid || 0 },
  ].filter(item => item.value > 0)

  const platformDistribution = [
    { name: 'Brands', value: brands.length, color: COLORS.primary },
    { name: 'Influencers', value: influencers.length, color: COLORS.purple },
    { name: 'Campaigns', value: campaigns.length, color: COLORS.warning },
  ]

  const statusColor = (s: string) => {
    if (s === 'ACTIVE' || s === 'active') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (s === 'SUSPENDED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (s === 'ended') return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    if (s === 'paused') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                Platform Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Comprehensive insights into platform performance and growth
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            {['today', 'last_7_days', 'last_30_days', 'this_month'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === filter
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {filter.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Top-level KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Revenue',
              value: `$${Number(totalRevenue).toLocaleString()}`,
              change: platformAnalytics?.revenue_growth || 0,
              icon: DollarSign,
              color: 'from-green-500 to-green-600',
              bg: 'bg-green-50 dark:bg-green-900/20',
              textColor: 'text-green-600 dark:text-green-400',
            },
            {
              label: 'Total Conversions',
              value: Number(platformAnalytics?.total_conversions || 0).toLocaleString(),
              change: platformAnalytics?.conversion_growth || 0,
              icon: ArrowLeftRight,
              color: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
              textColor: 'text-blue-600 dark:text-blue-400',
            },
            {
              label: 'Conversion Rate',
              value: `${Number(platformAnalytics?.conversion_rate || 0).toFixed(2)}%`,
              change: 0,
              icon: Target,
              color: 'from-purple-500 to-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
              textColor: 'text-purple-600 dark:text-purple-400',
            },
            {
              label: 'Total Commission',
              value: `$${Number(platformAnalytics?.total_commission || 0).toLocaleString()}`,
              change: 0,
              icon: Package,
              color: 'from-orange-500 to-orange-600',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              textColor: 'text-orange-600 dark:text-orange-400',
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bg} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
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
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Over Time Chart */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              Revenue & Conversions Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) =>
                    typeof value === 'number' && value > 100
                      ? `$${value.toFixed(2)}`
                      : value
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue ($)"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Brands Bar Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Top Brands by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBrandsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="brand_name"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={80}
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
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Influencers Bar Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Top Influencers by Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topInfluencersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="influencer_name"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={80}
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
                  <Bar dataKey="earnings" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Status Pie Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Conversion Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution Pie Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                Platform Entity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                  onClick={() => router.push('/admin/brands')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View all
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Brands ({brands.length})
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Active
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeBrands}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Suspended
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {suspendedBrands}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <button
                  onClick={() => router.push('/admin/influencers')}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View all
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Influencers ({influencers.length})
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Active
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeInfluencers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Suspended
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {suspendedInfluencers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <button
                  onClick={() => router.push('/admin/campaigns')}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View all
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Campaigns ({campaigns.length})
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Active
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeCampaigns}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-500" /> Ended
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {endedCampaigns}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversions Table */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Influencer
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                      Commission
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {conversions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        No conversions yet
                      </td>
                    </tr>
                  ) : (
                    conversions.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                          {c.brand?.company_name || '—'}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                          {c.influencer?.display_name || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                              c.status
                            )}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                          ${Number(c.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                          ${Number(c.commission_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
