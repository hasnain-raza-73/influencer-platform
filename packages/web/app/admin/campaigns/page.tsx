'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminService } from '@/services/admin-service'
import { Campaign } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, XCircle } from 'lucide-react'

type CampaignStatusFilter = 'ALL' | 'active' | 'paused' | 'draft' | 'ended'

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<CampaignStatusFilter>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getCampaigns({
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      })
      setCampaigns(res.data || [])
    } catch {
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const handleClose = async (id: string) => {
    setActionLoading(id)
    try {
      await adminService.closeCampaign(id)
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: 'ended' } : c))
    } catch {}
    setActionLoading(null)
    setConfirmId(null)
  }

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'paused') return 'bg-amber-100 text-amber-700'
    if (s === 'ended') return 'bg-gray-100 text-gray-600'
    return 'bg-blue-100 text-blue-700'
  }

  const filters: CampaignStatusFilter[] = ['ALL', 'active', 'paused', 'draft', 'ended']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage all campaigns</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No campaigns found</div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} variant="elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{campaign.name}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>Commission: {campaign.commission_rate}%</span>
                      {campaign.budget && <span>Budget: ${campaign.budget}</span>}
                      {campaign.start_date && <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>}
                      {campaign.end_date && <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>}
                    </div>
                    {campaign.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{campaign.description}</p>
                    )}
                  </div>
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                      onClick={() => setConfirmId(campaign.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Close Campaign?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will end the campaign immediately. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                isLoading={actionLoading === confirmId}
                onClick={() => handleClose(confirmId)}
              >
                Close Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
