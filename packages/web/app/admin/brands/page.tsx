'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminService, AdminBrand } from '@/services/admin-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, XCircle, Globe, Eye } from 'lucide-react'

type BrandStatus = 'ALL' | 'ACTIVE' | 'SUSPENDED'

export default function AdminBrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BrandStatus>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'ACTIVE' | 'SUSPENDED' | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getBrands({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      })
      setBrands(res.data || [])
    } catch {
      setBrands([])
    } finally {
      setIsLoading(false)
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(id)
    try {
      await adminService.updateBrandStatus(id, newStatus)
      setBrands((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b))
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
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <p className="text-sm text-gray-600 mt-1">Manage brand accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as BrandStatus[]).map((s) => (
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
      ) : brands.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No brands found</div>
      ) : (
        <div className="space-y-3">
          {brands.map((brand) => (
            <Card key={brand.id} variant="elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{brand.company_name}</p>
                      <p className="text-sm text-gray-500 truncate">{brand.user?.email}</p>
                      {brand.website && (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline truncate block">{brand.website}</a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/brands/${brand.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(brand.status)}`}>
                      {brand.status}
                    </span>
                    {brand.status !== 'SUSPENDED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        isLoading={actionLoading === brand.id}
                        onClick={() => { setConfirmId(brand.id); setConfirmAction('SUSPENDED') }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        isLoading={actionLoading === brand.id}
                        onClick={() => { setConfirmId(brand.id); setConfirmAction('ACTIVE') }}
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

      {/* Confirm Dialog */}
      {confirmId && confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">
              {confirmAction === 'SUSPENDED' ? 'Suspend Brand?' : 'Enable Brand?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction === 'SUSPENDED'
                ? 'This will prevent the brand and its users from accessing the platform.'
                : 'This will restore the brand\'s access to the platform.'}
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
