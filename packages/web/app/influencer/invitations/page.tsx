'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Check,
  X,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { campaignsService, CampaignInvitation } from '@/services/campaigns-service'

export default function InfluencerInvitationsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [invitations, setInvitations] = useState<{
    pending: CampaignInvitation[]
    accepted: CampaignInvitation[]
    declined: CampaignInvitation[]
  }>({
    pending: [],
    accepted: [],
    declined: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [respondingTo, setRespondingTo] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'INFLUENCER') {
      router.push('/auth/login')
      return
    }

    loadInvitations()
  }, [isAuthenticated, user, router])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      setError('')
      const [pending, accepted, declined] = await Promise.all([
        campaignsService.getMyInvitations('PENDING'),
        campaignsService.getMyInvitations('ACCEPTED'),
        campaignsService.getMyInvitations('DECLINED'),
      ])
      setInvitations({ pending, accepted, declined })
    } catch (err: any) {
      console.error('Error loading invitations:', err)
      setError(err.message || 'Failed to load invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async (invitationId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      setRespondingTo(invitationId)
      await campaignsService.respondToInvitation(invitationId, action)
      loadInvitations()
    } catch (err: any) {
      alert(err.message || `Failed to ${action.toLowerCase()} invitation`)
    } finally {
      setRespondingTo(null)
    }
  }

  const totalInvitations = invitations.pending.length + invitations.accepted.length + invitations.declined.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Invitations</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and respond to campaign invitations from brands
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
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
                <Mail className="w-8 h-8 text-gray-400" />
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
                <p className="text-xs text-gray-400 mt-1">
                  Check back later for new campaign opportunities
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.pending.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={() => handleRespond(invitation.id, 'ACCEPT')}
                    onDecline={() => handleRespond(invitation.id, 'DECLINE')}
                    isResponding={respondingTo === invitation.id}
                    showActions={true}
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
                <p className="text-sm">No accepted invitations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.accepted.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    showActions={false}
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
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isResponding = false,
  showActions = false,
}: {
  invitation: CampaignInvitation
  onAccept?: () => void
  onDecline?: () => void
  isResponding?: boolean
  showActions?: boolean
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
    <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{invitation.campaign?.name}</h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                statusColors[invitation.status]
              }`}
            >
              <StatusIcon className="w-3 h-3" />
              {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            Invited {new Date(invitation.invited_at).toLocaleDateString()}
            {invitation.responded_at && ` · Responded ${new Date(invitation.responded_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* Campaign Details */}
      {invitation.campaign && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Commission Rate</p>
                <p className="text-sm font-semibold text-gray-900">{invitation.campaign.commission_rate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Campaign Type</p>
                <p className="text-sm font-semibold text-gray-900">Invitation Only</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-gray-900">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-3">
          <Button
            onClick={onAccept}
            disabled={isResponding}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isResponding ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isResponding}
            className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      )}
    </div>
  )
}
