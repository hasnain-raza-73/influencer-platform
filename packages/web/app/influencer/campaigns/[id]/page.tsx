'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  Info,
} from 'lucide-react'
import { campaignsService } from '@/services/campaigns-service'
import { Campaign } from '@/types'

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadCampaign()
  }, [isAuthenticated, user, router, campaignId])

  const loadCampaign = async () => {
    try {
      setIsLoading(true)
      setError('')
      const campaignData = await campaignsService.getById(campaignId)
      setCampaign(campaignData)
    } catch (err: any) {
      console.error('Error loading campaign:', err)
      setError(err.message || 'Failed to load campaign details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isActive = campaign?.status?.toUpperCase() === 'ACTIVE'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/influencer/campaigns')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaign Details</h1>
              </div>
            </div>
            {isActive && campaign && (
              <Button
                variant="primary"
                onClick={() =>
                  router.push(`/influencer/tracking-links/new?campaign_id=${campaign.id}`)
                }
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Create Tracking Link
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : campaign ? (
          <>
            {/* Campaign Header */}
            <Card variant="elevated" className="mb-6">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                        <Target className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{campaign.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              campaign.status?.toUpperCase() === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : campaign.status?.toUpperCase() === 'PAUSED'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {campaign.description && (
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Commission Rate */}
                  <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">Commission Rate</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {campaign.commission_rate}%
                    </p>
                  </div>

                  {/* Budget */}
                  {campaign.budget && (
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-700 font-medium">Total Budget</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-700">
                        ${campaign.budget?.toLocaleString() || '0'}
                      </p>
                    </div>
                  )}

                  {/* Total Sales */}
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-purple-700 font-medium">Total Sales</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      ${campaign.total_sales?.toLocaleString() || '0'}
                    </p>
                  </div>

                  {/* Conversions */}
                  <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <p className="text-sm text-orange-700 font-medium">Total Conversions</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">
                      {campaign.total_conversions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Timeline */}
            {(campaign.start_date || campaign.end_date) && (
              <Card variant="elevated" className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Campaign Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaign.start_date && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Start Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(campaign.start_date)}
                          </p>
                        </div>
                      </div>
                    )}
                    {campaign.end_date && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">End Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(campaign.end_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How to Participate */}
            <Card variant="elevated" className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  How to Participate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-secondary-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Create a Tracking Link
                      </h4>
                      <p className="text-sm text-gray-600">
                        Click &quot;Create Tracking Link&quot; to generate your unique affiliate link for
                        this campaign
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-secondary-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Share Your Link</h4>
                      <p className="text-sm text-gray-600">
                        Promote the campaign using your tracking link on social media, blogs, or
                        other channels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-secondary-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Earn Commissions</h4>
                      <p className="text-sm text-gray-600">
                        Earn {campaign.commission_rate}% commission on every sale made through
                        your link
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-secondary-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Track Performance</h4>
                      <p className="text-sm text-gray-600">
                        Monitor your clicks, conversions, and earnings in real-time from your
                        dashboard
                      </p>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() =>
                        router.push(`/influencer/tracking-links/new?campaign_id=${campaign.id}`)
                      }
                    >
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Create Tracking Link for This Campaign
                    </Button>
                  </div>
                )}
                {!isActive && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        This campaign is currently {campaign.status.toLowerCase()}. You cannot
                        create new tracking links at this time.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign not found</h3>
              <p className="text-gray-600 mb-6">
                The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button variant="primary" onClick={() => router.push('/influencer/campaigns')}>
                Browse Available Campaigns
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
