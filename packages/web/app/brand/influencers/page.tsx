'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  Star,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react'
import { influencersService } from '@/services/influencers-service'
import { Influencer } from '@/types'

const NICHES = ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming', 'Lifestyle']

export default function BrandInfluencersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [nicheFilter, setNicheFilter] = useState('')
  const [minFollowers, setMinFollowers] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }
    loadInfluencers()
  }, [isAuthenticated, user, router])

  const loadInfluencers = async (params?: {
    search?: string
    niche?: string
    min_followers?: number
  }) => {
    try {
      setIsLoading(true)
      setError('')
      const response = await influencersService.getAll({
        search: params?.search || searchQuery || undefined,
        niche: params?.niche !== undefined ? params.niche : nicheFilter || undefined,
        min_followers: params?.min_followers !== undefined
          ? params.min_followers
          : minFollowers ? parseInt(minFollowers) : undefined,
        limit: 50,
      })
      setInfluencers(response.influencers || [])
      setTotal(response.total || 0)
    } catch (err: any) {
      console.error('Error loading influencers:', err)
      setError(err.message || 'Failed to load influencers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadInfluencers({
      search: searchQuery,
      niche: nicheFilter,
      min_followers: minFollowers ? parseInt(minFollowers) : undefined,
    })
  }

  const handleNicheChange = (niche: string) => {
    setNicheFilter(niche)
    loadInfluencers({
      search: searchQuery,
      niche,
      min_followers: minFollowers ? parseInt(minFollowers) : undefined,
    })
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Influencers</h1>
            <p className="text-sm text-gray-600 mt-1">
              Discover influencers to promote your products
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <Input
                placeholder="Search by name or bio..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />

              {/* Niche Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={nicheFilter}
                  onChange={(e) => handleNicheChange(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Niches</option>
                  {NICHES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Min Followers + Search Button */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min followers (e.g. 1000)"
                  type="number"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="primary" onClick={handleSearch} className="flex-shrink-0">
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${total} influencer${total !== 1 ? 's' : ''} found`}
            </div>
          </CardContent>
        </Card>

        {/* Influencers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : influencers.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No influencers found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <Card key={influencer.id} variant="elevated" className="hover:shadow-large transition-shadow">
                <CardContent className="p-6">
                  {/* Influencer Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {influencer.avatar_url ? (
                      <img
                        src={influencer.avatar_url}
                        alt={influencer.display_name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl">
                          {influencer.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {influencer.display_name}
                      </h3>
                      {influencer.niche && influencer.niche.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {influencer.niche.slice(0, 3).map((n) => (
                            <span key={n} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {influencer.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">{Number(influencer.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {influencer.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{influencer.bio}</p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Followers</p>
                      <p className="text-sm font-bold text-blue-700 mt-0.5">
                        {formatFollowers(influencer.follower_count || 0)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">Conversions</p>
                      <p className="text-sm font-bold text-purple-700 mt-0.5">
                        {influencer.total_conversions || 0}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">Sales</p>
                      <p className="text-sm font-bold text-green-700 mt-0.5">
                        ${Number(influencer.total_sales || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  {(influencer.social_instagram || influencer.social_youtube || influencer.social_twitter) && (
                    <div className="flex items-center gap-3 mb-4 text-gray-400">
                      {influencer.social_instagram && (
                        <span className="flex items-center gap-1 text-xs">
                          <Instagram className="w-3.5 h-3.5" />
                          {influencer.social_instagram.replace('@', '')}
                        </span>
                      )}
                      {influencer.social_youtube && (
                        <span className="flex items-center gap-1 text-xs">
                          <Youtube className="w-3.5 h-3.5" />
                          {influencer.social_youtube.replace('@', '')}
                        </span>
                      )}
                      {influencer.social_twitter && (
                        <span className="flex items-center gap-1 text-xs">
                          <Twitter className="w-3.5 h-3.5" />
                          {influencer.social_twitter.replace('@', '')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/brand/campaigns/new?influencer_id=${influencer.id}`)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
