'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { influencersService } from '@/services/influencers-service'
import { Influencer } from '@/types'

const NICHES = ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming', 'Lifestyle']
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan', 'Brazil']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Arabic']
const REACH_OPTIONS = [
  { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
  { label: 'Micro (10K-100K)', min: 10000, max: 100000 },
  { label: 'Mid (100K-500K)', min: 100000, max: 500000 },
  { label: 'Macro (500K-1M)', min: 500000, max: 1000000 },
  { label: 'Mega (1M+)', min: 1000000, max: null },
]

export default function BrandInfluencersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [nicheFilter, setNicheFilter] = useState<string[]>([])
  const [countryFilter, setCountryFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [languagesFilter, setLanguagesFilter] = useState<string[]>([])
  const [reachFilter, setReachFilter] = useState<{ min: number; max: number | null } | null>(null)
  const [minEngagement, setMinEngagement] = useState('')
  const [maxEngagement, setMaxEngagement] = useState('')
  const [minRating, setMinRating] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [hasInstagram, setHasInstagram] = useState(false)
  const [hasTikTok, setHasTikTok] = useState(false)
  const [hasYouTube, setHasYouTube] = useState(false)
  const [hasTwitter, setHasTwitter] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<'follower_count' | 'engagement_rate' | 'rating' | 'total_sales' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [savedInfluencers, setSavedInfluencers] = useState<string[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }
    loadInfluencers()
  }, [isAuthenticated, user, router])

  const loadInfluencers = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await influencersService.advancedSearch({
        search: searchQuery || undefined,
        niches: nicheFilter.length > 0 ? nicheFilter : undefined,
        country: countryFilter || undefined,
        city: cityFilter || undefined,
        languages: languagesFilter.length > 0 ? languagesFilter : undefined,
        minFollowers: reachFilter?.min || undefined,
        maxFollowers: reachFilter?.max || undefined,
        minEngagementRate: minEngagement ? parseFloat(minEngagement) : undefined,
        maxEngagementRate: maxEngagement ? parseFloat(maxEngagement) : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        availableForCampaigns: availableOnly || undefined,
        isFeatured: featuredOnly || undefined,
        hasInstagram: hasInstagram || undefined,
        hasTikTok: hasTikTok || undefined,
        hasYouTube: hasYouTube || undefined,
        hasTwitter: hasTwitter || undefined,
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      })
      setInfluencers(response.influencers || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err: any) {
      console.error('Error loading influencers:', err)
      setError(err.message || 'Failed to load influencers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === 'BRAND') {
        setCurrentPage(1) // Reset to page 1 when filters change
        loadInfluencers()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, nicheFilter, countryFilter, cityFilter, languagesFilter, reachFilter, minEngagement, maxEngagement, minRating, availableOnly, featuredOnly, hasInstagram, hasTikTok, hasYouTube, hasTwitter, sortBy, sortOrder])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'BRAND') {
      loadInfluencers()
    }
  }, [currentPage])

  const toggleSaved = (influencerId: string) => {
    setSavedInfluencers((prev) =>
      prev.includes(influencerId) ? prev.filter((id) => id !== influencerId) : [...prev, influencerId]
    )
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const getEngagementRate = (influencer: Influencer) => {
    // Use the engagement_rate field from the entity if available
    if (influencer.engagement_rate !== undefined && influencer.engagement_rate !== null) {
      return Number(influencer.engagement_rate).toFixed(2)
    }
    // Fallback to calculation from clicks if engagement_rate is not set
    if (!influencer.total_clicks || !influencer.follower_count) return 0
    return ((influencer.total_clicks / influencer.follower_count) * 100).toFixed(2)
  }

  if (isLoading && influencers.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 h-16 flex items-center justify-between">
        <div className="w-full max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            placeholder="Search influencers by name..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {total} {total === 1 ? 'Creator' : 'Creators'} Found
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="created_at">Newest</option>
              <option value="follower_count">Followers</option>
              <option value="engagement_rate">Engagement Rate</option>
              <option value="rating">Rating</option>
              <option value="total_sales">Total Sales</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
            >
              <span className="material-symbols-outlined text-sm text-slate-700 dark:text-slate-300">
                {sortOrder === 'ASC' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-2">
              {NICHES.map((niche) => (
                <label
                  key={niche}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={nicheFilter.includes(niche)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNicheFilter([...nicheFilter, niche])
                      } else {
                        setNicheFilter(nicheFilter.filter(n => n !== niche))
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{niche}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Country
            </h3>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              City
            </h3>
            <input
              type="text"
              placeholder="e.g., New York, London"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Languages
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {LANGUAGES.map((language) => (
                <label
                  key={language}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={languagesFilter.includes(language)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLanguagesFilter([...languagesFilter, language])
                      } else {
                        setLanguagesFilter(languagesFilter.filter(l => l !== language))
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{language}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Reach (Followers)
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="reach"
                  checked={reachFilter === null}
                  onChange={() => setReachFilter(null)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Any Size</span>
              </label>
              {REACH_OPTIONS.map((option) => (
                <label
                  key={option.label}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="reach"
                    checked={reachFilter?.min === option.min}
                    onChange={() => setReachFilter({ min: option.min, max: option.max })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Engagement Rate (%)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Minimum</label>
                <input
                  type="number"
                  placeholder="e.g., 3.5"
                  step="0.1"
                  min="0"
                  max="100"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Maximum</label>
                <input
                  type="number"
                  placeholder="e.g., 10.0"
                  step="0.1"
                  min="0"
                  max="100"
                  value={maxEngagement}
                  onChange={(e) => setMaxEngagement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Minimum Rating
            </h3>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Platform Presence
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasInstagram}
                  onChange={(e) => setHasInstagram(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Has Instagram</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasTikTok}
                  onChange={(e) => setHasTikTok(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Has TikTok</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasYouTube}
                  onChange={(e) => setHasYouTube(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Has YouTube</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasTwitter}
                  onChange={(e) => setHasTwitter(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Has Twitter</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Availability & Status
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Available for Campaigns</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Featured Only</span>
                  <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                </div>
              </label>
            </div>
          </div>

          {(nicheFilter.length > 0 || countryFilter || cityFilter || languagesFilter.length > 0 || reachFilter || minEngagement || maxEngagement || minRating || availableOnly || featuredOnly || hasInstagram || hasTikTok || hasYouTube || hasTwitter) && (
            <button
              className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => {
                setNicheFilter([])
                setCountryFilter('')
                setCityFilter('')
                setLanguagesFilter([])
                setReachFilter(null)
                setMinEngagement('')
                setMaxEngagement('')
                setMinRating('')
                setAvailableOnly(false)
                setFeaturedOnly(false)
                setHasInstagram(false)
                setHasTikTok(false)
                setHasYouTube(false)
                setHasTwitter(false)
              }}
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">person_search</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No influencers found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {influencers.map((influencer) => (
                  <div
                    key={influencer.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  >
                    {/* Card Header with Avatar */}
                    <div className="relative bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/30 h-24">
                      <button
                        className="absolute top-3 right-3 size-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSaved(influencer.id)
                        }}
                      >
                        <span className={`material-symbols-outlined text-lg ${savedInfluencers.includes(influencer.id) ? 'text-red-500' : 'text-slate-400'}`}>
                          {savedInfluencers.includes(influencer.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                      {influencer.avatar_url ? (
                        <img
                          src={influencer.avatar_url}
                          alt={influencer.display_name}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-20 rounded-full border-4 border-white dark:border-slate-900 object-cover"
                        />
                      ) : (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-20 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {influencer.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="pt-12 px-6 pb-6">
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                          {influencer.display_name}
                        </h3>
                        {influencer.niche && influencer.niche.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center mb-2">
                            {influencer.niche.slice(0, 2).map((n) => (
                              <span
                                key={n}
                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                        {influencer.bio && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{influencer.bio}</p>}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="material-symbols-outlined text-primary text-lg mb-1">group</span>
                          <p className="text-xs text-slate-500 font-medium">Followers</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                            {formatFollowers(influencer.follower_count || 0)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="material-symbols-outlined text-purple-600 text-lg mb-1">
                            trending_up
                          </span>
                          <p className="text-xs text-slate-500 font-medium">Engagement</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                            {getEngagementRate(influencer)}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="material-symbols-outlined text-emerald-600 text-lg mb-1">
                            shopping_cart
                          </span>
                          <p className="text-xs text-slate-500 font-medium">Sales</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                            ${Number(influencer.total_sales || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Social Media Presence */}
                      {influencer.social_accounts && influencer.social_accounts.length > 0 && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Social Presence</p>
                            {influencer.social_accounts.some(acc => acc.is_verified) && (
                              <span className="material-symbols-outlined text-primary text-sm">verified</span>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {influencer.social_accounts.map((account) => {
                              const metrics = account.metrics?.[0]
                              const platformColors = {
                                INSTAGRAM: 'bg-gradient-to-br from-purple-600 to-pink-500',
                                FACEBOOK: 'bg-blue-600',
                                TIKTOK: 'bg-black'
                              }
                              return (
                                <div key={account.id} className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                                  <div className={`size-5 ${platformColors[account.platform as keyof typeof platformColors] || 'bg-gray-600'} rounded flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-white text-xs">
                                      {account.platform === 'INSTAGRAM' ? 'photo_camera' : account.platform === 'FACEBOOK' ? 'facebook' : 'music_note'}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                                    {metrics ? formatFollowers(metrics.followers_count) : '-'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        onClick={() => router.push(`/brand/campaigns/new?influencer_id=${influencer.id}`)}
                      >
                        <span className="material-symbols-outlined text-lg">send</span>
                        Invite to Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
