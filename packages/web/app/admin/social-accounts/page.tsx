'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { socialIntegrationsService, SocialAccount } from '@/services/social-integrations-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  AlertCircle,
  Eye,
  Instagram,
  Facebook,
  Music2
} from 'lucide-react'
import { VerificationBadge } from '@/components/social/VerificationBadge'

type PlatformFilter = 'ALL' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
type VerificationFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED'
type VerificationLevelFilter = 'ALL' | 'BASIC' | 'VERIFIED' | 'FEATURED'

export default function AdminSocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [platform, setPlatform] = useState<PlatformFilter>('ALL')
  const [verificationStatus, setVerificationStatus] = useState<VerificationFilter>('ALL')
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevelFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const limit = 20

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await socialIntegrationsService.getAllAccountsForAdmin({
        platform: platform === 'ALL' ? undefined : platform,
        is_verified: verificationStatus === 'ALL' ? undefined : verificationStatus === 'VERIFIED',
        verification_level: verificationLevel === 'ALL' ? undefined : verificationLevel,
        limit,
        page,
      })

      if (res?.success && res?.data) {
        setAccounts(res.data.accounts || [])
        setTotal(res.data.total || 0)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Failed to load social accounts:', error)
      setError(error?.message || 'Failed to load social accounts. Please try again.')
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }, [platform, verificationStatus, verificationLevel, page])

  useEffect(() => {
    load()
  }, [load])

  const handleVerificationToggle = async (accountId: string, currentStatus: boolean) => {
    setActionLoading(accountId)
    try {
      const res = await socialIntegrationsService.updateVerificationStatus(accountId, {
        is_verified: !currentStatus,
      })
      if (res?.success) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId ? { ...acc, is_verified: !currentStatus } : acc
          )
        )
      }
    } catch (error) {
      console.error('Failed to update verification:', error)
    }
    setActionLoading(null)
  }

  const handleLevelChange = async (accountId: string, level: 'BASIC' | 'VERIFIED' | 'FEATURED') => {
    setActionLoading(accountId)
    try {
      const res = await socialIntegrationsService.updateVerificationStatus(accountId, {
        verification_level: level,
      })
      if (res?.success) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId ? { ...acc, verification_level: level } : acc
          )
        )
      }
    } catch (error) {
      console.error('Failed to update level:', error)
    }
    setActionLoading(null)
  }

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts

    return accounts.filter(account =>
      account.platform_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.influencer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.platform.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [accounts, searchQuery])

  const stats = useMemo(() => {
    return {
      total: total,
      verified: accounts.filter((a) => a.is_verified).length,
      pending: accounts.filter((a) => !a.is_verified).length,
      featured: accounts.filter((a) => a.verification_level === 'FEATURED').length,
    }
  }, [accounts, total])

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const getPlatformDetails = (platformStr: string) => {
    switch (platformStr) {
      case 'INSTAGRAM':
        return {
          color: 'from-purple-500 to-pink-500',
          icon: Instagram,
          name: 'Instagram'
        }
      case 'FACEBOOK':
        return {
          color: 'from-blue-600 to-blue-700',
          icon: Facebook,
          name: 'Facebook'
        }
      case 'TIKTOK':
        return {
          color: 'from-black to-gray-800',
          icon: Music2,
          name: 'TikTok'
        }
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          icon: Eye,
          name: platformStr
        }
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Platform', 'Username', 'Influencer', 'Followers', 'Verified', 'Level', 'Connected Date'],
      ...filteredAccounts.map(acc => [
        acc.platform,
        acc.platform_username || 'N/A',
        acc.influencer?.display_name || 'N/A',
        acc.metrics?.[0]?.followers_count || 0,
        acc.is_verified ? 'Yes' : 'No',
        acc.verification_level || 'N/A',
        new Date(acc.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `social-accounts-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Social Accounts Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage and verify influencer social media accounts across all platforms
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => load()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={filteredAccounts.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Accounts
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Verified
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.verified}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Featured
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {stats.featured}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by username, influencer name, or platform..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? 'default' : 'outline'}
                  className="h-11 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {/* Platform Filter */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Platform
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['ALL', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as PlatformFilter[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPlatform(p)
                            setPage(1)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            platform === p
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Status Filter */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Verification Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['ALL', 'VERIFIED', 'UNVERIFIED'] as VerificationFilter[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setVerificationStatus(v)
                            setPage(1)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            verificationStatus === v
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Level Filter */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Verification Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['ALL', 'BASIC', 'VERIFIED', 'FEATURED'] as VerificationLevelFilter[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setVerificationLevel(l)
                            setPage(1)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            verificationLevel === l
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Accounts</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  <Button
                    onClick={() => load()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-300 dark:border-red-700"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading accounts...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAccounts.length === 0 && (
          <Card className="bg-white dark:bg-slate-900">
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No social accounts found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No social accounts have been connected yet'}
                </p>
                {(platform !== 'ALL' || verificationStatus !== 'ALL' || verificationLevel !== 'ALL' || searchQuery) && (
                  <Button
                    onClick={() => {
                      setPlatform('ALL')
                      setVerificationStatus('ALL')
                      setVerificationLevel('ALL')
                      setSearchQuery('')
                      setPage(1)
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accounts List */}
        {!isLoading && !error && filteredAccounts.length > 0 && (
          <div className="space-y-4">
            {filteredAccounts.map((account) => {
              const latestMetric = account.metrics?.[0]
              const platformDetails = getPlatformDetails(account.platform)
              const PlatformIcon = platformDetails.icon

              return (
                <Card
                  key={account.id}
                  className="bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-200 border border-slate-200 dark:border-slate-800"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Platform Icon */}
                        <div
                          className={`size-14 bg-gradient-to-br ${platformDetails.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <PlatformIcon className="w-7 h-7 text-white" />
                        </div>

                        {/* Account Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">
                              @{account.platform_username || 'Unknown'}
                            </h3>
                            <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                              {platformDetails.name}
                            </span>
                            <VerificationBadge
                              isVerified={account.is_verified}
                              level={account.verification_level as any}
                              showLevel
                            />
                          </div>

                          {/* Influencer Info */}
                          {account.influencer && (
                            <div className="flex items-center gap-2 mb-3">
                              {account.influencer.avatar_url ? (
                                <img
                                  src={account.influencer.avatar_url}
                                  alt={account.influencer.display_name}
                                  className="size-7 rounded-full border-2 border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="size-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                  {account.influencer.display_name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {account.influencer.display_name}
                              </span>
                            </div>
                          )}

                          {/* Metrics */}
                          {latestMetric && (
                            <div className="flex gap-6 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">Followers:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {formatFollowers(latestMetric.followers_count)}
                                </span>
                              </div>
                              {latestMetric.engagement_rate !== undefined && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600 dark:text-slate-400">Engagement:</span>
                                  <span className="font-bold text-slate-900 dark:text-slate-100">
                                    {latestMetric.engagement_rate.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            Connected on {new Date(account.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 min-w-[180px]">
                        {/* Verification Toggle */}
                        <button
                          onClick={() =>
                            handleVerificationToggle(account.id, account.is_verified)
                          }
                          disabled={actionLoading === account.id}
                          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                            account.is_verified
                              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                        >
                          {actionLoading === account.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : account.is_verified ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Unverified
                            </>
                          )}
                        </button>

                        {/* Level Selection */}
                        <select
                          value={account.verification_level || 'BASIC'}
                          onChange={(e) =>
                            handleLevelChange(
                              account.id,
                              e.target.value as 'BASIC' | 'VERIFIED' | 'FEATURED'
                            )
                          }
                          disabled={actionLoading === account.id}
                          className="px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="BASIC">⭐ Basic Level</option>
                          <option value="VERIFIED">✓ Verified Level</option>
                          <option value="FEATURED">🌟 Featured Level</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && total > limit && (
          <Card className="bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} accounts
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
