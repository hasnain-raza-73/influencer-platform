'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Target,
  Plus,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { campaignsService } from '@/services/campaigns-service'
import { Campaign } from '@/types'

export default function BrandCampaignsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'ENDED'>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }

    loadCampaigns()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterCampaigns()
  }, [searchQuery, statusFilter, campaigns])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await campaignsService.getAll()
      setCampaigns(response || [])
    } catch (err: any) {
      console.error('Error loading campaigns:', err)
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCampaigns = () => {
    let filtered = [...campaigns]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.status?.toUpperCase() === statusFilter.toUpperCase())
    }

    setFilteredCampaigns(filtered)
  }

  const handlePause = async (id: string) => {
    if (!confirm('Are you sure you want to pause this campaign?')) return

    try {
      await campaignsService.pause(id)
      await loadCampaigns()
    } catch (err: any) {
      alert(err.message || 'Failed to pause campaign')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await campaignsService.activate(id)
      await loadCampaigns()
    } catch (err: any) {
      alert(err.message || 'Failed to activate campaign')
    }
  }

  const handleEnd = async (id: string) => {
    if (!confirm('Are you sure you want to end this campaign? This action cannot be undone.')) return

    try {
      await campaignsService.end(id)
      await loadCampaigns()
    } catch (err: any) {
      alert(err.message || 'Failed to end campaign')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return

    try {
      await campaignsService.delete(id)
      setCampaigns(campaigns.filter((c) => c.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete campaign')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-700'
      case 'ENDED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your marketing campaigns and track performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => router.push('/brand/campaigns/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
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

        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <Input
                placeholder="Search campaigns..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {campaigns.length === 0
                  ? 'Create your first campaign to start working with influencers'
                  : 'Try adjusting your search or filters'}
              </p>
              {campaigns.length === 0 && (
                <Button variant="primary" onClick={() => router.push('/brand/campaigns/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} variant="elevated" className="hover:shadow-large transition-shadow">
                <CardContent className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {campaign.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-gray-600 mb-4">{campaign.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Commission Rate */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Commission</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {campaign.commission_rate}%
                      </p>
                    </div>

                    {/* Budget */}
                    {campaign.budget && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700 font-medium">Budget</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          ${campaign.budget?.toLocaleString() || '0'}
                        </p>
                      </div>
                    )}

                    {/* Total Sales */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Total Sales</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        ${campaign.total_sales?.toLocaleString() || '0'}
                      </p>
                    </div>

                    {/* Conversions */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-700 font-medium">Conversions</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        {campaign.total_conversions || 0}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Details & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {campaign.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Started {formatDate(campaign.start_date)}</span>
                        </div>
                      )}
                      {campaign.end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Ends {formatDate(campaign.end_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Stats
                      </Button>
                      {campaign.status?.toUpperCase() === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(campaign.id)}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {campaign.status?.toUpperCase() === 'PAUSED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(campaign.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      {campaign.status?.toUpperCase() !== 'ENDED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnd(campaign.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          End
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {campaigns.length > 0 && (
          <Card variant="elevated" className="mt-6">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{campaigns.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {campaigns.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${campaigns.reduce((sum, c) => sum + (typeof c.total_sales === 'number' ? c.total_sales : 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {campaigns.reduce((sum, c) => sum + (typeof c.total_conversions === 'number' ? c.total_conversions : 0), 0)}
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
