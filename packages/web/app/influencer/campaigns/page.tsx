'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Target,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { campaignsService } from '@/services/campaigns-service'
import { Campaign } from '@/types'

export default function CampaignsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'commission' | 'budget' | 'newest'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadCampaigns()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterAndSortCampaigns()
  }, [searchQuery, sortBy, campaigns])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await campaignsService.getActiveCampaigns()
      setCampaigns(response || [])
    } catch (err: any) {
      console.error('Error loading campaigns:', err)
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortCampaigns = () => {
    let filtered = [...campaigns]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'commission':
          return b.commission_rate - a.commission_rate
        case 'budget':
          return (b.budget || 0) - (a.budget || 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredCampaigns(filtered)
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
              <h1 className="text-2xl font-bold text-gray-900">Available Campaigns</h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover campaigns and start earning commissions
              </p>
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

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="commission">Highest Commission</option>
                  <option value="budget">Highest Budget</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} available
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {campaigns.length === 0 ? 'No campaigns available' : 'No campaigns found'}
              </h3>
              <p className="text-gray-600">
                {campaigns.length === 0
                  ? 'Check back later for new campaigns from brands'
                  : 'Try adjusting your search filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                variant="elevated"
                className="hover:shadow-large transition-shadow cursor-pointer"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {campaign.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ACTIVE
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

                  {/* Campaign Details */}
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

                    <Button variant="primary" size="sm">
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
