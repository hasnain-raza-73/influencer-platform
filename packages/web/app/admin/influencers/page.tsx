'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminInfluencer } from '@/services/admin-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, CheckCircle, XCircle, User, Eye } from 'lucide-react'

type InfluencerStatus = 'ALL' | 'ACTIVE' | 'SUSPENDED'

export default function AdminInfluencersPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<AdminInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InfluencerStatus>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'ACTIVE' | 'SUSPENDED' | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getInfluencers({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      })
      setInfluencers(res.data || [])
    } catch {
      setInfluencers([])
    } finally {
      setIsLoading(false)
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(id)
    try {
      await adminService.updateInfluencerStatus(id, newStatus)
      setInfluencers((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i))
    } catch {}
    setActionLoading(null)
    setConfirmId(null)
    setConfirmAction(null)
  }

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return 'bg-green-100 text-green-700'
    if (s === 'SUSPENDED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Influencers</h1>
        <p className="text-sm text-gray-600 mt-1">Manage influencer accounts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search influencers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as InfluencerStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No influencers found</div>
      ) : (
        <div className="space-y-3">
          {influencers.map((inf) => (
            <Card key={inf.id} variant="elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {inf.profile_image_url ? (
                      <img src={inf.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{inf.display_name || 'Unnamed'}</p>
                      <p className="text-sm text-gray-500 truncate">{inf.user?.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {inf.follower_count && (
                          <span className="text-xs text-gray-500">{inf.follower_count.toLocaleString()} followers</span>
                        )}
                        {inf.niches && inf.niches.length > 0 && (
                          <span className="text-xs text-gray-400">{inf.niches.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/influencers/${inf.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(inf.status)}`}>
                      {inf.status}
                    </span>
                    {inf.status !== 'SUSPENDED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        isLoading={actionLoading === inf.id}
                        onClick={() => { setConfirmId(inf.id); setConfirmAction('SUSPENDED') }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        isLoading={actionLoading === inf.id}
                        onClick={() => { setConfirmId(inf.id); setConfirmAction('ACTIVE') }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {confirmId && confirmAction && (
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
              <Button variant="outline" className="flex-1" onClick={() => { setConfirmId(null); setConfirmAction(null) }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className={`flex-1 ${confirmAction === 'SUSPENDED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                isLoading={actionLoading === confirmId}
                onClick={() => handleStatusChange(confirmId, confirmAction)}
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
