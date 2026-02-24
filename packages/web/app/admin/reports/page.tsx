'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminOverview } from '@/services/admin-service'
import {
  BarChart3,
  TrendingUp,
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
} from 'lucide-react'

export default function AdminReportsPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [brands, setBrands] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getOverview(),
      adminService.getBrands({ limit: 100 }),
      adminService.getInfluencers({ limit: 100 }),
      adminService.getCampaigns({ limit: 100 }),
      adminService.getConversions({ limit: 50 }),
    ])
      .then(([ov, br, inf, camp, conv]) => {
        setOverview(ov)
        setBrands(br.data || [])
        setInfluencers(inf.data || [])
        setCampaigns(camp.data || [])
        setConversions(conv.data || [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  // Computed metrics
  const totalRevenue = overview?.total_platform_revenue || 0
  const activeBrands = brands.filter((b) => b.status === 'ACTIVE').length
  const suspendedBrands = brands.filter((b) => b.status === 'SUSPENDED').length
  const activeInfluencers = influencers.filter((i) => i.status === 'ACTIVE').length
  const suspendedInfluencers = influencers.filter((i) => i.status === 'SUSPENDED').length
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const endedCampaigns = campaigns.filter((c) => c.status === 'ended').length

  // Top brands by total_revenue (from campaigns)
  const brandRevenueMap: Record<string, { name: string; revenue: number; campaigns: number }> = {}
  campaigns.forEach((c) => {
    if (!c.brand) return
    const bId = c.brand.id || c.brand_id
    const bName = c.brand.company_name || 'Unknown'
    if (!brandRevenueMap[bId]) brandRevenueMap[bId] = { name: bName, revenue: 0, campaigns: 0 }
    brandRevenueMap[bId].revenue += Number(c.total_sales || 0)
    brandRevenueMap[bId].campaigns += 1
  })
  const topBrands = Object.values(brandRevenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top influencers by total_earnings
  const topInfluencers = [...influencers]
    .sort((a, b) => Number(b.total_earnings || 0) - Number(a.total_earnings || 0))
    .slice(0, 5)

  // Top campaigns by total_sales
  const topCampaigns = [...campaigns]
    .sort((a, b) => Number(b.total_sales || 0) - Number(a.total_sales || 0))
    .slice(0, 5)

  const statusColor = (s: string) => {
    if (s === 'ACTIVE' || s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'SUSPENDED') return 'bg-red-100 text-red-700'
    if (s === 'ended') return 'bg-gray-100 text-gray-600'
    if (s === 'paused') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          Platform Reports
        </h1>
        <p className="text-sm text-gray-600 mt-1">Full overview of platform performance and activity</p>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${Number(totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Conversions', value: Number(overview?.total_conversions || 0).toLocaleString(), icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Payouts', value: `$${Number(overview?.pending_payout_amount || 0).toLocaleString()}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Reviews', value: overview?.pending_reviews || 0, icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Brands Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-600" />
            Brands ({brands.length})
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-green-100 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-green-500 rounded-full" style={{ width: brands.length ? `${(activeBrands / brands.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{activeBrands}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" /> Suspended
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-red-100 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-red-500 rounded-full" style={{ width: brands.length ? `${(suspendedBrands / brands.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{suspendedBrands}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/brands')}
            className="mt-4 text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View all brands
          </button>
        </div>

        {/* Influencers Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Influencers ({influencers.length})
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-green-100 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-green-500 rounded-full" style={{ width: influencers.length ? `${(activeInfluencers / influencers.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{activeInfluencers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" /> Suspended
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-red-100 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-red-500 rounded-full" style={{ width: influencers.length ? `${(suspendedInfluencers / influencers.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{suspendedInfluencers}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/influencers')}
            className="mt-4 text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View all influencers
          </button>
        </div>

        {/* Campaigns Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600" />
            Campaigns ({campaigns.length})
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-green-100 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-green-500 rounded-full" style={{ width: campaigns.length ? `${(activeCampaigns / campaigns.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{activeCampaigns}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ended</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden" style={{ width: 80 }}>
                  <div className="h-full bg-gray-500 rounded-full" style={{ width: campaigns.length ? `${(endedCampaigns / campaigns.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{endedCampaigns}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="mt-4 text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View all campaigns
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Brands by Revenue */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Top Brands by Revenue
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topBrands.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No data yet</p>
            ) : topBrands.map((b, i) => (
              <div key={b.name} className="px-5 py-3 flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.campaigns} campaign{b.campaigns !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">${b.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Influencers by Earnings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
              Top Influencers by Earnings
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topInfluencers.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No data yet</p>
            ) : topInfluencers.map((inf, i) => (
              <div key={inf.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{inf.display_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500">{Number(inf.total_conversions || 0)} conversions</p>
                </div>
                <span className="text-sm font-semibold text-orange-600">${Number(inf.total_earnings || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-600" />
            Top Performing Campaigns
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Commission</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Conversions</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-500">No campaign data yet</td>
                </tr>
              ) : topCampaigns.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 font-bold">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-gray-600">{c.brand?.company_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-900">{c.commission_rate}%</td>
                  <td className="px-5 py-3 text-right text-gray-900">{Number(c.total_conversions || 0)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-600">${Number(c.total_sales || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            Recent Conversions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Influencer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Commission</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conversions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">No conversions yet</td>
                </tr>
              ) : conversions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{c.brand?.company_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{c.influencer?.display_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">${Number(c.amount || 0).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-green-600">${Number(c.commission_amount || 0).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
