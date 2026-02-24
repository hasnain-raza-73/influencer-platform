'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminService } from '@/services/admin-service'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  User,
  Mail,
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Package,
  Globe,
} from 'lucide-react'

export default function AdminInfluencerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'ACTIVE' | 'SUSPENDED' | null>(null)

  useEffect(() => {
    adminService.getInfluencerDetail(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(true)
    try {
      await adminService.updateInfluencerStatus(id, newStatus)
      setDetail((prev: any) => ({
        ...prev,
        influencer: { ...prev.influencer, status: newStatus },
      }))
    } catch {}
    setActionLoading(false)
    setConfirmAction(null)
  }

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return 'bg-green-100 text-green-700'
    if (s === 'SUSPENDED') return 'bg-red-100 text-red-700'
    if (s === 'APPROVED') return 'bg-green-100 text-green-700'
    if (s === 'VALIDATED') return 'bg-green-100 text-green-700'
    if (s === 'PENDING') return 'bg-yellow-100 text-yellow-700'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700'
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
        <p className="text-gray-500">Influencer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const { influencer, tracking_links, conversions, stats } = detail

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{influencer.display_name || 'Unnamed Influencer'}</h1>
          <p className="text-sm text-gray-500">{influencer.user?.email}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor(influencer.status)}`}>
          {influencer.status}
        </span>
        {influencer.status !== 'SUSPENDED' ? (
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

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          {influencer.profile_image_url ? (
            <img src={influencer.profile_image_url} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {influencer.user?.email}
                </p>
              </div>
              {influencer.follower_count && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Followers</p>
                  <p className="text-sm font-medium text-gray-900">{Number(influencer.follower_count).toLocaleString()}</p>
                </div>
              )}
              {influencer.niches && influencer.niches.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Niches</p>
                  <div className="flex flex-wrap gap-1">
                    {influencer.niches.map((n: string) => (
                      <span key={n} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                </div>
              )}
              {influencer.social_links?.instagram && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Instagram</p>
                  <a href={influencer.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {influencer.social_links.instagram}
                  </a>
                </div>
              )}
              {influencer.rating && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Rating</p>
                  <p className="text-sm font-medium text-gray-900">{Number(influencer.rating).toFixed(1)} / 5.0</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Joined</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(influencer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {influencer.bio && (
              <p className="text-sm text-gray-600 mt-4">{influencer.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clicks', value: Number(stats.total_clicks || 0).toLocaleString(), icon: MousePointerClick, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Conversions', value: Number(stats.total_conversions || 0).toLocaleString(), icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Earnings', value: `$${Number(stats.total_earnings || 0).toFixed(2)}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Active Links', value: stats.active_links || 0, icon: LinkIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
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
        {/* Tracking Links / Campaigns They Promote */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary-600" />
              Promoting ({tracking_links.length} products)
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {tracking_links.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No active tracking links</p>
            ) : tracking_links.map((link: any) => (
              <div key={link.id} className="px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {link.product?.image_url ? (
                    <img src={link.product.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.product?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{link.product?.brand?.company_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{link.clicks || 0} clicks</p>
                    <p className="text-xs text-green-600">{link.conversions || 0} conv</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Recent Conversions ({conversions.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {conversions.length === 0 ? (
              <p className="text-sm text-gray-500 p-5 text-center">No conversions yet</p>
            ) : conversions.map((c: any) => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.brand?.company_name || 'Unknown brand'}</p>
                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600">${Number(c.commission_amount || 0).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
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
              {confirmAction === 'SUSPENDED' ? 'Suspend Influencer?' : 'Enable Influencer?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction === 'SUSPENDED'
                ? 'This will prevent the influencer from accessing the platform.'
                : "This will restore the influencer's access to the platform."}
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
