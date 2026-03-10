import React from 'react'
import { SocialAccount, SocialMetrics } from '@/services/social-integrations-service'
import { VerificationBadge } from './VerificationBadge'

interface SocialMetricsCardProps {
  accounts: SocialAccount[]
  compact?: boolean
  className?: string
}

export function SocialMetricsCard({ accounts, compact = false, className = '' }: SocialMetricsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
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
        return 'from-purple-600 to-pink-500'
      case 'FACEBOOK':
        return 'from-blue-600 to-blue-700'
      case 'TIKTOK':
        return 'from-black to-gray-800'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const getLatestMetrics = (account: SocialAccount): SocialMetrics | null => {
    if (!account.metrics || account.metrics.length === 0) return null
    return account.metrics[0]
  }

  const totalFollowers = accounts.reduce((sum, account) => {
    const metrics = getLatestMetrics(account)
    return sum + (metrics?.followers_count || 0)
  }, 0)

  const averageEngagement = accounts.length > 0
    ? accounts.reduce((sum, account) => {
        const metrics = getLatestMetrics(account)
        return sum + (metrics?.engagement_rate || 0)
      }, 0) / accounts.length
    : 0

  if (accounts.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className={`bg-card border rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Social Presence</h3>
          <VerificationBadge isVerified={accounts.some(acc => acc.is_verified)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Followers</p>
            <p className="text-xl font-bold">{formatNumber(totalFollowers)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
            <p className="text-xl font-bold">{averageEngagement.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t">
          {accounts.map((account) => {
            const metrics = getLatestMetrics(account)
            return (
              <div key={account.id} className="flex items-center gap-2 text-xs">
                <div className={`size-6 bg-gradient-to-br ${getPlatformColor(account.platform)} rounded flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-xs">
                    {getPlatformIcon(account.platform)}
                  </span>
                </div>
                <span className="font-medium">{metrics ? formatNumber(metrics.followers_count) : '-'}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Social Media Presence</h3>
        <VerificationBadge
          isVerified={accounts.some(acc => acc.is_verified)}
          level={accounts.find(acc => acc.verification_level)?.verification_level}
          showLevel
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Followers</p>
          <p className="text-2xl font-bold">{formatNumber(totalFollowers)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Platforms</p>
          <p className="text-2xl font-bold">{accounts.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Avg Engagement</p>
          <p className="text-2xl font-bold">{averageEngagement.toFixed(1)}%</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-3">
        {accounts.map((account) => {
          const metrics = getLatestMetrics(account)
          return (
            <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`size-10 bg-gradient-to-br ${getPlatformColor(account.platform)} rounded-lg flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white">
                    {getPlatformIcon(account.platform)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{account.platform_username || account.platform}</p>
                  <p className="text-xs text-muted-foreground">{account.platform}</p>
                </div>
              </div>
              {metrics && (
                <div className="text-right">
                  <p className="font-semibold">{formatNumber(metrics.followers_count)}</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.engagement_rate ? `${metrics.engagement_rate}% engagement` : 'followers'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
