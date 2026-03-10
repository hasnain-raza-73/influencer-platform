'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { adminService } from '@/services/admin-service'
import { Conversion } from '@/types'
import {
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ConversionStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'PAID' | 'REJECTED'

const STATUS_COLORS = {
  CONFIRMED: '#10b981',
  PAID: '#8b5cf6',
  PENDING: '#f59e0b',
  REJECTED: '#ef4444',
}

export default function AdminConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<ConversionStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getConversions({
        status: status === 'ALL' ? undefined : status,
        limit: 100,
      })
      setConversions(res.data || [])
    } catch {
      setConversions([])
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  // Filter conversions by search query
  const filteredConversions = useMemo(() => {
    if (!searchQuery) return conversions

    return conversions.filter((conv) => {
      const brand = (conv as any).brand?.company_name?.toLowerCase() || ''
      const influencer = (conv as any).influencer?.display_name?.toLowerCase() || ''
      const orderId = conv.order_id?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()

      return brand.includes(query) || influencer.includes(query) || orderId.includes(query)
    })
  }, [conversions, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const total = conversions.length
    const totalRevenue = conversions.reduce((sum, c) => sum + Number(c.order_value || 0), 0)
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0)
    const avgOrderValue = total > 0 ? totalRevenue / total : 0

    const pending = conversions.filter((c) => c.status === 'PENDING').length
    const confirmed = conversions.filter((c) => c.status === 'CONFIRMED').length
    const paid = conversions.filter((c) => c.status === 'PAID').length
    const rejected = conversions.filter((c) => c.status === 'REJECTED').length

    return {
      total,
      totalRevenue,
      totalCommission,
      avgOrderValue,
      pending,
      confirmed,
      paid,
      rejected,
    }
  }, [conversions])

  // Prepare chart data - Group by status
  const statusChartData = [
    { name: 'Confirmed', value: stats.confirmed, color: STATUS_COLORS.CONFIRMED },
    { name: 'Paid', value: stats.paid, color: STATUS_COLORS.PAID },
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.PENDING },
    { name: 'Rejected', value: stats.rejected, color: STATUS_COLORS.REJECTED },
  ].filter((item) => item.value > 0)

  // Export to CSV
  const exportToCSV = () => {
    const csv = [
      ['Conversions Report'],
      ['Status Filter', status],
      ['Total Conversions', stats.total],
      ['Total Revenue', `$${stats.totalRevenue.toFixed(2)}`],
      ['Total Commission', `$${stats.totalCommission.toFixed(2)}`],
      [''],
      ['Order ID', 'Brand', 'Influencer', 'Sale Amount', 'Commission', 'Status', 'Date'],
      ...filteredConversions.map((conv) => [
        conv.order_id || 'N/A',
        (conv as any).brand?.company_name || 'N/A',
        (conv as any).influencer?.display_name || 'N/A',
        `$${Number(conv.order_value).toFixed(2)}`,
        `$${Number(conv.commission_amount).toFixed(2)}`,
        conv.status,
        new Date(conv.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversions-${new Date().toISOString()}.csv`
    a.click()
  }

  const statusColor = (s: string) => {
    if (s === 'CONFIRMED' || s === 'PAID')
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }

  const filters: ConversionStatus[] = ['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'REJECTED']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <ArrowLeftRight className="w-8 h-8 text-white" />
                </div>
                Conversions Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Track and analyze all conversions across the platform
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => load()}
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Conversions',
              value: stats.total.toLocaleString(),
              icon: ArrowLeftRight,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'Total Revenue',
              value: `$${stats.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              label: 'Total Commission',
              value: `$${stats.totalCommission.toLocaleString()}`,
              icon: Package,
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              label: 'Avg Order Value',
              value: `$${stats.avgOrderValue.toFixed(2)}`,
              icon: TrendingUp,
              color: 'text-orange-600 dark:text-orange-400',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bg} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution Pie Chart */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Conversion Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'green' },
                  { label: 'Paid', value: stats.paid, icon: CheckCircle, color: 'purple' },
                  { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
                  { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {item.value}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        ({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatus(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      status === f
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 lg:max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by brand, influencer, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions Table */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              Conversions List ({filteredConversions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              </div>
            ) : filteredConversions.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No conversions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Order / Product
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Brand
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Influencer
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                        Sale
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                        Commission
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Status
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredConversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                            {conv.order_id || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                          {(conv as any).brand?.company_name || '—'}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                          {(conv as any).influencer?.display_name || '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            ${Number(conv.order_value).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                          ${Number(conv.commission_amount).toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(conv.status)}`}>
                            {conv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
