'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Link as LinkIcon,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  Search,
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
} from 'lucide-react'
import { trackingService } from '@/services/tracking-service'
import { TrackingLink } from '@/types'

export default function TrackingLinksPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [links, setLinks] = useState<TrackingLink[]>([])
  const [filteredLinks, setFilteredLinks] = useState<TrackingLink[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadLinks()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterLinks()
  }, [searchQuery, links])

  const loadLinks = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await trackingService.getAll()
      setLinks(response || [])
    } catch (err: any) {
      console.error('Error loading tracking links:', err)
      setError(err.message || 'Failed to load tracking links')
    } finally {
      setIsLoading(false)
    }
  }

  const filterLinks = () => {
    let filtered = [...links]

    if (searchQuery) {
      filtered = filtered.filter((link) =>
        link.unique_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredLinks(filtered)
  }

  const handleCopyLink = async (link: TrackingLink) => {
    const trackingUrl = `${window.location.origin}/track/${link.unique_code}`

    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracking link?')) return

    try {
      await trackingService.delete(id)
      setLinks(links.filter((l) => l.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete tracking link')
    }
  }

  const getConversionRate = (link: TrackingLink) => {
    if (!link.clicks || link.clicks === 0) return 0
    return (((link.conversions || 0) / link.clicks) * 100).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tracking Links</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your tracking links and monitor performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => router.push('/influencer/tracking-links/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Search */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <Input
              placeholder="Search by tracking code..."
              leftIcon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="mt-4 text-sm text-gray-600">
              {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''} found
            </div>
          </CardContent>
        </Card>

        {/* Links List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {links.length === 0 ? 'No tracking links yet' : 'No links found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {links.length === 0
                  ? 'Create your first tracking link to start earning commissions'
                  : 'Try adjusting your search'}
              </p>
              {links.length === 0 && (
                <Button variant="primary" onClick={() => router.push('/influencer/tracking-links/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredLinks.map((link) => (
              <Card key={link.id} variant="elevated" className="hover:shadow-large transition-shadow">
                <CardContent className="p-6">
                  {/* Link Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <code className="text-sm font-mono font-semibold text-gray-900">
                          {link.unique_code}
                        </code>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(link.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(link)}
                      >
                        {copiedId === link.id ? (
                          <>
                            <span className="text-green-600">✓ Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Clicks */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MousePointerClick className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700 font-medium">Clicks</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {link.clicks?.toLocaleString() || '0'}
                      </p>
                    </div>

                    {/* Conversions */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Conversions</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        {link.conversions || 0}
                      </p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Conv. Rate</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {getConversionRate(link)}%
                      </p>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-600">$</span>
                        <p className="text-xs text-orange-700 font-medium">Total Sales</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        ${typeof link.total_sales === 'number' ? link.total_sales.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  {link.last_clicked_at && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Last clicked: {new Date(link.last_clicked_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {links.length > 0 && (
          <Card variant="elevated" className="mt-6">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Links</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{links.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {links.reduce((sum, link) => sum + (typeof link.clicks === 'number' ? link.clicks : 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${(links.reduce((sum, link) => sum + (typeof link.total_sales === 'number' ? link.total_sales : 0), 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
