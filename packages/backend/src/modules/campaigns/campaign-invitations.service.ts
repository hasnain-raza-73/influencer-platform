import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignInvitation, InvitationStatus } from './entities/campaign-invitation.entity';
import { Campaign, CampaignType } from './entities/campaign.entity';
import { Influencer } from '../influencers/influencer.entity';

@Injectable()
export class CampaignInvitationsService {
  constructor(
    @InjectRepository(CampaignInvitation)
    private readonly invitationRepository: Repository<CampaignInvitation>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Influencer)
    private readonly influencerRepository: Repository<Influencer>,
  ) {}

  /**
   * Invite multiple influencers to a SPECIFIC campaign
   */
  async inviteInfluencers(
    campaignId: string,
    influencerIds: string[],
    brandId: string,
  ): Promise<CampaignInvitation[]> {
    // Verify campaign exists and belongs to brand
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, brand_id: brandId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Verify campaign is SPECIFIC type
    if (campaign.campaign_type !== CampaignType.SPECIFIC) {
      throw new BadRequestException('Can only invite influencers to SPECIFIC campaigns');
    }

    // Verify all influencers exist
    const influencers = await this.influencerRepository.findByIds(influencerIds);
    if (influencers.length !== influencerIds.length) {
      throw new NotFoundException('One or more influencers not found');
    }

    const invitations: CampaignInvitation[] = [];

    // Create invitations (skip if already exists)
    for (const influencerId of influencerIds) {
      try {
        const invitation = this.invitationRepository.create({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: InvitationStatus.PENDING,
        });

        const saved = await this.invitationRepository.save(invitation);
        invitations.push(saved);
      } catch (error) {
        // Skip if invitation already exists (unique constraint violation)
        if (error.code === '23505') {
          continue;
        }
        throw error;
      }
    }

    return invitations;
  }

  /**
   * Get all invitations for a campaign
   */
  async getInvitationsForCampaign(
    campaignId: string,
    brandId: string,
  ): Promise<{
    pending: CampaignInvitation[];
    accepted: CampaignInvitation[];
    declined: CampaignInvitation[];
  }> {
    // Verify campaign belongs to brand
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, brand_id: brandId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const invitations = await this.invitationRepository.find({
      where: { campaign_id: campaignId },
      relations: ['influencer', 'influencer.user'],
      order: { invited_at: 'DESC' },
    });

    return {
      pending: invitations.filter((inv) => inv.status === InvitationStatus.PENDING),
      accepted: invitations.filter((inv) => inv.status === InvitationStatus.ACCEPTED),
      declined: invitations.filter((inv) => inv.status === InvitationStatus.DECLINED),
    };
  }

  /**
   * Get pending invitations for an influencer
   */
  async getPendingInvitations(influencerId: string): Promise<CampaignInvitation[]> {
    return this.invitationRepository.find({
      where: {
        influencer_id: influencerId,
        status: InvitationStatus.PENDING,
      },
      relations: ['campaign', 'campaign.brand', 'campaign.brand.user'],
      order: { invited_at: 'DESC' },
    });
  }

  /**
   * Get all invitations for an influencer (with optional status filter)
   */
  async getInvitationsForInfluencer(
    influencerId: string,
    status?: InvitationStatus,
  ): Promise<CampaignInvitation[]> {
    const where: any = { influencer_id: influencerId };
    if (status) {
      where.status = status;
    }

    return this.invitationRepository.find({
      where,
      relations: ['campaign', 'campaign.brand', 'campaign.brand.user'],
      order: { invited_at: 'DESC' },
    });
  }

  /**
   * Respond to a campaign invitation (ACCEPT or DECLINE)
   */
  async respondToInvitation(
    invitationId: string,
    influencerId: string,
    action: 'ACCEPT' | 'DECLINE',
  ): Promise<CampaignInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, influencer_id: influencerId },
      relations: ['campaign'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    // Update status
    invitation.status =
      action === 'ACCEPT' ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED;
    invitation.responded_at = new Date();

    return this.invitationRepository.save(invitation);
  }

  /**
   * Remove an invitation (brand removes influencer from campaign)
   */
  async removeInvitation(
    campaignId: string,
    influencerId: string,
    brandId: string,
  ): Promise<void> {
    // Verify campaign belongs to brand
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, brand_id: brandId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { campaign_id: campaignId, influencer_id: influencerId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
  }

  /**
   * Check if an influencer has accepted invitation for a campaign
   */
  async hasAcceptedInvitation(campaignId: string, influencerId: string): Promise<boolean> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        campaign_id: campaignId,
        influencer_id: influencerId,
        status: InvitationStatus.ACCEPTED,
      },
    });

    return !!invitation;
  }

  /**
   * Check if an influencer can access a campaign
   * - OPEN campaigns: always true
   * - SPECIFIC campaigns: must have accepted invitation
   */
  async canAccessCampaign(campaignId: string, influencerId: string): Promise<boolean> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      return false;
    }

    // OPEN campaigns are accessible to all
    if (campaign.campaign_type === CampaignType.OPEN) {
      return true;
    }

    // SPECIFIC campaigns require accepted invitation
    return this.hasAcceptedInvitation(campaignId, influencerId);
  }
}
