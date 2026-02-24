'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminService } from '@/services/admin-service'
import { Product, ProductReviewStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink, ImageIcon } from 'lucide-react'

type Tab = 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED' | 'ALL'

interface ReviewState {
  [productId: string]: {
    notes: string
    loading: boolean
    expanded: boolean
    imageIdx: number
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('PENDING_REVIEW')
  const [reviewState, setReviewState] = useState<ReviewState>({})
  const [counts, setCounts] = useState<Record<Tab, number>>({ PENDING_REVIEW: 0, NEEDS_REVISION: 0, APPROVED: 0, REJECTED: 0, ALL: 0 })

  const load = useCallback(async (activeTab: Tab) => {
    setIsLoading(true)
    try {
      const res = await adminService.getProducts({
        review_status: activeTab === 'ALL' ? undefined : activeTab,
        limit: 50,
      })
      const items = res.data || []
      setProducts(items)
      if (activeTab === 'ALL') {
        const pending = items.filter((p) => p.review_status === 'PENDING_REVIEW').length
        const revision = items.filter((p) => p.review_status === 'NEEDS_REVISION').length
        const approved = items.filter((p) => p.review_status === 'APPROVED').length
        const rejected = items.filter((p) => p.review_status === 'REJECTED').length
        setCounts({ ALL: items.length, PENDING_REVIEW: pending, NEEDS_REVISION: revision, APPROVED: approved, REJECTED: rejected })
      }
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  // Load ALL tab counts on mount
  useEffect(() => {
    adminService.getProducts({ limit: 200 }).then((res) => {
      const items = res.data || []
      setCounts({
        ALL: res.meta?.total || items.length,
        PENDING_REVIEW: items.filter((p) => p.review_status === 'PENDING_REVIEW').length,
        NEEDS_REVISION: items.filter((p) => p.review_status === 'NEEDS_REVISION').length,
        APPROVED: items.filter((p) => p.review_status === 'APPROVED').length,
        REJECTED: items.filter((p) => p.review_status === 'REJECTED').length,
      })
    }).catch(() => {})
  }, [])

  const getOrInit = (id: string) => reviewState[id] || { notes: '', loading: false, expanded: false, imageIdx: 0 }

  const setField = (id: string, patch: Partial<ReviewState[string]>) => {
    setReviewState((prev) => ({ ...prev, [id]: { ...getOrInit(id), ...patch } }))
  }

  const handleReview = async (productId: string, reviewStatus: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED') => {
    const s = getOrInit(productId)
    setField(productId, { loading: true })
    try {
      const updated = await adminService.reviewProduct(productId, {
        review_status: reviewStatus,
        review_notes: s.notes || undefined,
      })
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, ...updated } : p))
      setField(productId, { loading: false, expanded: false })
      // Refresh counts
      load(tab)
    } catch {
      setField(productId, { loading: false })
    }
  }

  const reviewStatusColor = (s: string) => {
    if (s === 'APPROVED') return 'bg-green-100 text-green-700'
    if (s === 'PENDING_REVIEW') return 'bg-amber-100 text-amber-700'
    if (s === 'NEEDS_REVISION') return 'bg-orange-100 text-orange-700'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'PENDING_REVIEW', label: 'Pending Review' },
    { key: 'NEEDS_REVISION', label: 'Needs Revision' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'ALL', label: 'All' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-sm text-gray-600 mt-1">Review and approve products submitted by brands</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                key === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                key === 'NEEDS_REVISION' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No products in this category</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const s = getOrInit(product.id)
            const imgs = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : []

            return (
              <Card key={product.id} variant="elevated">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Image gallery */}
                    <div className="flex-shrink-0">
                      {imgs.length > 0 ? (
                        <div className="relative">
                          <img
                            src={imgs[s.imageIdx] || imgs[0]}
                            alt=""
                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                          />
                          {imgs.length > 1 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {imgs.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => setField(product.id, { imageIdx: i })}
                                  className={`w-5 h-5 rounded overflow-hidden border ${s.imageIdx === i ? 'border-primary-500' : 'border-gray-200'}`}
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reviewStatusColor(product.review_status)}`}>
                              {product.review_status.replace('_', ' ')}
                            </span>
                          </div>
                          {product.brand && (
                            <p className="text-sm text-gray-500 mt-0.5">by {product.brand.company_name}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setField(product.id, { expanded: !s.expanded })}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 flex-shrink-0"
                        >
                          {s.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {s.expanded ? 'Close' : 'Review'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span>${Number(product.price).toFixed(2)}</span>
                        {product.category && <span>{product.category}</span>}
                        {product.sku && <span>SKU: {product.sku}</span>}
                        {product.commission_rate && <span>{product.commission_rate}% commission</span>}
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                      )}

                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View product
                      </a>

                      {/* Existing review notes */}
                      {product.review_notes && !s.expanded && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          <span className="font-medium">Review note: </span>{product.review_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline review panel */}
                  {s.expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (optional)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows={3}
                        placeholder="Add notes for the brand (required for Needs Revision/Reject)..."
                        value={s.notes}
                        onChange={(e) => setField(product.id, { notes: e.target.value })}
                      />
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          isLoading={s.loading}
                          onClick={() => handleReview(product.id, 'APPROVED')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          isLoading={s.loading}
                          onClick={() => handleReview(product.id, 'NEEDS_REVISION')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Needs Revision
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          isLoading={s.loading}
                          onClick={() => handleReview(product.id, 'REJECTED')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
