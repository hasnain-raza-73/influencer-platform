'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminService } from '@/services/admin-service'
import { Payout } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

type PayoutStatus = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<PayoutStatus>('ALL')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getPayouts({
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      })
      setPayouts(res.data || [])
    } catch {
      setPayouts([])
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'bg-green-100 text-green-700'
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700'
    if (s === 'PROCESSING') return 'bg-blue-100 text-blue-700'
    if (s === 'FAILED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const filters: PayoutStatus[] = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-sm text-gray-600 mt-1">All influencer payout records</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No payouts found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-medium text-gray-500">Influencer</th>
                <th className="pb-3 font-medium text-gray-500">Amount</th>
                <th className="pb-3 font-medium text-gray-500">Method</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
                <th className="pb-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900">{(payout as any).influencer?.display_name || 'Unknown'}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-gray-900">${Number(payout.amount).toFixed(2)}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{payout.method || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
