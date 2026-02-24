'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminService } from '@/services/admin-service'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Globe,
  Mail,
  Package,
  Target,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
} from 'lucide-react'

export default function AdminBrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'ACTIVE' | 'SUSPENDED' | null>(null)

  useEffect(() => {
    adminService.getBrandDetail(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(true)
    try {
      await adminService.updateBrandStatus(id, newStatus)
      setDetail((prev: any) => ({
        ...prev,
        brand: { ...prev.brand, status: newStatus },
      }))
    } catch {}
    setActionLoading(false)
    setConfirmAction(null)
  }

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return 'bg-green-100 text-green-700'
    if (s === 'SUSPENDED') return 'bg-red-100 text-red-700'
    if (s === 'APPROVED') return 'bg-green-100 text-green-700'
    if (s === 'PENDING_REVIEW') return 'bg-yellow-100 text-yellow-700'
    if (s === 'NEEDS_REVISION') return 'bg-orange-100 text-orange-700'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700'
    if (s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'ended') return 'bg-gray-100 text-gray-600'
    if (s === 'paused') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Brand not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const { brand, campaigns, products, stats } = detail

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{brand.company_name}</h1>
          <p className="text-sm text-gray-500">{brand.user?.email}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor(brand.status)}`}>
          {brand.status}
        </span>
        {brand.status !== 'SUSPENDED' ? (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setConfirmAction('SUSPENDED')}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Suspend
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => setConfirmAction('ACTIVE')}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Enable
          </Button>
        )}
      </div>

      {/* Brand Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Globe className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Company</p>
                <p className="text-sm font-medium text-gray-900">{brand.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {brand.user?.email}
                </p>
              </div>
              {brand.website && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Website</p>
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {brand.website}
                  </a>
                </div>
              )}
              {brand.industry && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Industry</p>
                  <p className="text-sm font-medium text-gray-900">{brand.industry}</p>
                </div>
              )}
              {brand.default_commission_rate && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Default Commission</p>
                  <p className="text-sm font-medium text-gray-900">{brand.default_commission_rate}%</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Joined</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {brand.description && (
              <p className="text-sm text-gray-600 mt-4">{brand.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Campaigns', value: stats.total_campaigns, icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Active Campaigns', value: stats.active_campaigns, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Products', value: stats.total_products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: `$${Number(stats.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              Campaigns ({campaigns.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No campaigns yet</p>
            ) : campaigns.map((c: any) => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">{c.commission_rate}% commission</span>
                      {c.total_conversions > 0 && (
                        <span className="text-xs text-gray-500">{c.total_conversions} conversions</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Products ({products.length})
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {stats.approved_products} approved
              </span>
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                {stats.pending_products} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No products yet</p>
            ) : products.map((p: any) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">${Number(p.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColor(p.review_status)}`}>
                    {p.review_status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">
              {confirmAction === 'SUSPENDED' ? 'Suspend Brand?' : 'Enable Brand?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction === 'SUSPENDED'
                ? 'This will prevent the brand and its users from accessing the platform.'
                : "This will restore the brand's access to the platform."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className={`flex-1 ${confirmAction === 'SUSPENDED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                isLoading={actionLoading}
                onClick={() => handleStatusChange(confirmAction)}
              >
                {confirmAction === 'SUSPENDED' ? 'Suspend' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
