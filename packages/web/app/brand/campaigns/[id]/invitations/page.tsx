'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Check,
  X,
  Clock,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { campaignsService, CampaignInvitation, InvitationsGrouped } from '@/services/campaigns-service'
import { influencersService, InfluencersResponse } from '@/services/influencers-service'
import { Influencer } from '@/types'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'

export default function CampaignInvitationsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const campaignId = params.id as string

  const [invitations, setInvitations] = useState<InvitationsGrouped>({
    pending: [],
    accepted: [],
    declined: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(false)
  const [selectedInfluencerIds, setSelectedInfluencerIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }

    loadInvitations()
  }, [isAuthenticated, user, router, campaignId])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await campaignsService.getInvitations(campaignId)
      setInvitations(data)
    } catch (err: any) {
      console.error('Error loading invitations:', err)
      setError(err.message || 'Failed to load invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveInvitation = async (influencerId: string) => {
    if (!confirm('Are you sure you want to remove this invitation?')) return

    try {
      await campaignsService.removeInvitation(campaignId, influencerId)
      loadInvitations()
    } catch (err: any) {
      alert(err.message || 'Failed to remove invitation')
    }
  }

  const loadInfluencers = async (search?: string) => {
    try {
      setIsLoadingInfluencers(true)
      const data = await influencersService.getAll({ search, limit: 50 })
      setInfluencers(data.influencers)
    } catch (err: any) {
      console.error('Error loading influencers:', err)
    } finally {
      setIsLoadingInfluencers(false)
    }
  }

  const handleOpenInviteModal = () => {
    setShowInviteModal(true)
    setSelectedInfluencerIds(new Set())
    setSearchQuery('')
    loadInfluencers()
  }

  const handleToggleInfluencer = (influencerId: string) => {
    const newSelected = new Set(selectedInfluencerIds)
    if (newSelected.has(influencerId)) {
      newSelected.delete(influencerId)
    } else {
      newSelected.add(influencerId)
    }
    setSelectedInfluencerIds(newSelected)
  }

  const handleInviteInfluencers = async () => {
    if (selectedInfluencerIds.size === 0) {
      alert('Please select at least one influencer')
      return
    }

    try {
      setIsInviting(true)
      await campaignsService.inviteInfluencers(campaignId, Array.from(selectedInfluencerIds))
      setShowInviteModal(false)
      loadInvitations()
    } catch (err: any) {
      alert(err.message || 'Failed to send invitations')
    } finally {
      setIsInviting(false)
    }
  }

  const handleSearchInfluencers = () => {
    loadInfluencers(searchQuery)
  }

  // Get already invited influencer IDs
  const invitedInfluencerIds = new Set([
    ...invitations.pending.map((i) => i.influencer_id),
    ...invitations.accepted.map((i) => i.influencer_id),
    ...invitations.declined.map((i) => i.influencer_id),
  ])

  const totalInvitations =
    invitations.pending.length + invitations.accepted.length + invitations.declined.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Invitations</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage influencer invitations for this campaign
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleOpenInviteModal}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Influencers
              </Button>
              <Button variant="outline" onClick={() => router.push(`/brand/campaigns/${campaignId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInvitations}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{invitations.pending.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{invitations.accepted.length}</p>
                </div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Declined</p>
                  <p className="text-2xl font-bold text-red-600">{invitations.declined.length}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invitations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Invitations ({invitations.pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.pending.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.pending.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onRemove={() => handleRemoveInvitation(invitation.influencer_id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accepted Invitations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Accepted ({invitations.accepted.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.accepted.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No accepted invitations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.accepted.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onRemove={() => handleRemoveInvitation(invitation.influencer_id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Declined Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              Declined ({invitations.declined.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.declined.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <X className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No declined invitations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.declined.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onRemove={() => handleRemoveInvitation(invitation.influencer_id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent title="Invite Influencers">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search influencers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchInfluencers()}
                className="flex-1"
              />
              <Button onClick={handleSearchInfluencers} variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Influencer List */}
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {isLoadingInfluencers ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading influencers...
                </div>
              ) : influencers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No influencers found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {influencers.map((influencer) => {
                    const alreadyInvited = invitedInfluencerIds.has(influencer.id)
                    const isSelected = selectedInfluencerIds.has(influencer.id)

                    return (
                      <div
                        key={influencer.id}
                        className={`p-4 flex items-center gap-3 hover:bg-gray-50 ${
                          alreadyInvited ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        onClick={() => !alreadyInvited && handleToggleInfluencer(influencer.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={alreadyInvited}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">
                            {influencer.display_name?.charAt(0).toUpperCase() || 'I'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {influencer.display_name}
                            {alreadyInvited && (
                              <span className="ml-2 text-xs text-gray-500">(Already invited)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {influencer.follower_count?.toLocaleString() || 0} followers
                            {influencer.niche && influencer.niche.length > 0 && (
                              <span className="ml-2">· {influencer.niche.join(', ')}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Performance</p>
                          <p className="text-sm text-gray-900">
                            {influencer.total_clicks || 0} clicks · {influencer.total_conversions || 0} conversions
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedInfluencerIds.size > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-sm text-primary-700">
                  {selectedInfluencerIds.size} influencer{selectedInfluencerIds.size > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)} disabled={isInviting}>
              Cancel
            </Button>
            <Button onClick={handleInviteInfluencers} disabled={isInviting || selectedInfluencerIds.size === 0}>
              {isInviting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send {selectedInfluencerIds.size > 0 ? selectedInfluencerIds.size : ''} Invitation
                  {selectedInfluencerIds.size > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InvitationCard({
  invitation,
  onRemove,
}: {
  invitation: CampaignInvitation
  onRemove: () => void
}) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
    DECLINED: 'bg-red-100 text-red-700 border-red-200',
  }

  const statusIcons = {
    PENDING: Clock,
    ACCEPTED: Check,
    DECLINED: X,
  }

  const StatusIcon = statusIcons[invitation.status]

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-700">
            {invitation.influencer?.display_name?.charAt(0).toUpperCase() || 'I'}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{invitation.influencer?.display_name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{invitation.influencer?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Invited {new Date(invitation.invited_at).toLocaleDateString()}
            {invitation.responded_at && ` · Responded ${new Date(invitation.responded_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {invitation.influencer && (
          <div className="text-right mr-4">
            <p className="text-xs text-gray-500">Performance</p>
            <p className="text-sm font-medium text-gray-900">
              {invitation.influencer.total_clicks || 0} clicks · {invitation.influencer.total_conversions || 0}{' '}
              conversions
            </p>
          </div>
        )}

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            statusColors[invitation.status]
          }`}
        >
          <StatusIcon className="w-3 h-3" />
          {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
