'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { socialIntegrationsService, SocialAccount } from '@/services/social-integrations-service'
import { useAuthStore } from '@/store/auth-store'

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const influencer = useAuthStore((state) => state.influencer)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    const oauthError = searchParams.get('oauth_error')

    if (oauthSuccess) {
      setSuccessMessage(`Successfully connected ${oauthSuccess.toUpperCase()} account!`)
      fetchAccounts() // Refresh accounts list
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (oauthError) {
      setError(decodeURIComponent(oauthError))
      // Clear URL params after 5 seconds
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname)
      }, 5000)
    }
  }, [searchParams])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await socialIntegrationsService.getAccounts()
      setAccounts(response.data || [])
    } catch (err: any) {
      console.error('Failed to fetch social accounts:', err)
      setError(err.message || 'Failed to load social accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return
    }

    try {
      await socialIntegrationsService.deleteAccount(accountId)
      setAccounts(accounts.filter(acc => acc.id !== accountId))
    } catch (err: any) {
      console.error('Failed to disconnect account:', err)
      alert(err.message || 'Failed to disconnect account')
    }
  }

  const handleConnectPlatform = (platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK') => {
    if (!influencer?.id) {
      setError('Influencer profile not found. Please try logging in again.')
      return
    }

    // Get API base URL from environment or default to localhost
    // Remove /v1 suffix if present to get the base URL
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1').replace(/\/v1$/, '')

    // Redirect to OAuth authorization endpoint
    const platformLower = platform.toLowerCase()
    const oauthUrl = `${apiUrl}/v1/oauth/${platformLower}/authorize?influencer_id=${influencer.id}`

    window.location.href = oauthUrl
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
        return 'photo_camera'
      case 'FACEBOOK':
        return 'facebook'
      case 'TIKTOK':
        return 'music_note'
      default:
        return 'link'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
        return 'bg-gradient-to-br from-purple-600 to-pink-500'
      case 'FACEBOOK':
        return 'bg-blue-600'
      case 'TIKTOK':
        return 'bg-black'
      default:
        return 'bg-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getLatestMetrics = (account: SocialAccount) => {
    if (!account.metrics || account.metrics.length === 0) return null
    return account.metrics[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading social accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Social Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Connect your social media accounts to verify your identity and display your follower metrics
        </p>
      </div>

      {/* Success Display */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Available Platforms to Connect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Instagram */}
        {!accounts.find(acc => acc.platform === 'INSTAGRAM') && (
          <button
            onClick={() => handleConnectPlatform('INSTAGRAM')}
            className="p-6 bg-card border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Connect Instagram</h3>
                <p className="text-sm text-muted-foreground">Connect your Instagram Business or Creator account</p>
              </div>
            </div>
          </button>
        )}

        {/* Facebook */}
        {!accounts.find(acc => acc.platform === 'FACEBOOK') && (
          <button
            onClick={() => handleConnectPlatform('FACEBOOK')}
            className="p-6 bg-card border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">facebook</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Connect Facebook</h3>
                <p className="text-sm text-muted-foreground">Connect your Facebook Page</p>
              </div>
            </div>
          </button>
        )}

        {/* TikTok */}
        {!accounts.find(acc => acc.platform === 'TIKTOK') && (
          <button
            onClick={() => handleConnectPlatform('TIKTOK')}
            className="p-6 bg-card border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 bg-black rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">music_note</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Connect TikTok</h3>
                <p className="text-sm text-muted-foreground">Connect your TikTok Creator account</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account) => {
              const metrics = getLatestMetrics(account)
              return (
                <div key={account.id} className="bg-card border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`size-16 ${getPlatformColor(account.platform)} rounded-lg flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white text-3xl">
                          {getPlatformIcon(account.platform)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {account.platform_username || account.platform}
                          {account.is_verified && (
                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {account.platform} Account
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(account.id, account.platform)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* Metrics */}
                  {metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="text-2xl font-bold">{formatNumber(metrics.followers_count)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Posts</p>
                        <p className="text-2xl font-bold">{formatNumber(metrics.posts_count)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        <p className="text-2xl font-bold">
                          {metrics.engagement_rate ? `${metrics.engagement_rate}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Synced</p>
                        <p className="text-sm font-medium">
                          {account.last_synced_at
                            ? new Date(account.last_synced_at).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verification Level */}
                  {account.verification_level && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Verification Level:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          account.verification_level === 'FEATURED'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : account.verification_level === 'VERIFIED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {account.verification_level}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">link_off</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No Connected Accounts</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your social media accounts to verify your identity and showcase your audience metrics to brands.
          </p>
        </div>
      )}
    </div>
  )
}
