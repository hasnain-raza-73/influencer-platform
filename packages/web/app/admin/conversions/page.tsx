'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminService } from '@/services/admin-service'
import { Conversion } from '@/types'

type ConversionStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'PAID' | 'REJECTED'

export default function AdminConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<ConversionStatus>('ALL')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getConversions({
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      })
      setConversions(res.data || [])
    } catch {
      setConversions([])
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const statusColor = (s: string) => {
    if (s === 'CONFIRMED' || s === 'PAID') return 'bg-green-100 text-green-700'
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const filters: ConversionStatus[] = ['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'REJECTED']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversions</h1>
        <p className="text-sm text-gray-600 mt-1">All conversion records across the platform</p>
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
      ) : conversions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No conversions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-medium text-gray-500">Order / Product</th>
                <th className="pb-3 font-medium text-gray-500">Brand</th>
                <th className="pb-3 font-medium text-gray-500">Influencer</th>
                <th className="pb-3 font-medium text-gray-500">Sale</th>
                <th className="pb-3 font-medium text-gray-500">Commission</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
                <th className="pb-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conversions.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 truncate max-w-[120px]">{conv.order_id || '—'}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{(conv as any).brand?.company_name || '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">{(conv as any).influencer?.display_name || '—'}</td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-gray-900">${Number(conv.order_value).toFixed(2)}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">${Number(conv.commission_amount).toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(conv.status)}`}>
                      {conv.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(conv.created_at).toLocaleDateString()}
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
