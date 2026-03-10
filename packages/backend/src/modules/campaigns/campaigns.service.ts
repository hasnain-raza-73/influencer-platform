import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from './entities/campaign.entity';
import { CampaignInvitation, InvitationStatus } from './entities/campaign-invitation.entity';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';
import { Click } from '../tracking/entities/click.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignInvitation)
    private readonly invitationRepository: Repository<CampaignInvitation>,
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
    @InjectRepository(Click)
    private readonly clickRepository: Repository<Click>,
  ) {}

  // Create a new campaign
  async create(brandId: string, createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    // Validate date range
    if (createCampaignDto.start_date && createCampaignDto.end_date) {
      const start = new Date(createCampaignDto.start_date);
      const end = new Date(createCampaignDto.end_date);

      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      brand_id: brandId,
      status: createCampaignDto.status || CampaignStatus.DRAFT,
    });

    return this.campaignRepository.save(campaign);
  }

  // Get all campaigns for a brand
  async findAll(brandId: string, filter?: CampaignFilterDto): Promise<Campaign[]> {
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.brand_id = :brandId', { brandId });

    if (filter?.status) {
      queryBuilder.andWhere('campaign.status = :status', { status: filter.status });
    }

    if (filter?.search) {
      queryBuilder.andWhere('campaign.name LIKE :search', { search: `%${filter.search}%` });
    }

    queryBuilder.orderBy('campaign.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  // Get active campaigns (for influencers to browse)
  // Returns OPEN campaigns + SPECIFIC campaigns with accepted invitation
  async findActiveCampaigns(influencerId?: string): Promise<Campaign[]> {
    const now = new Date();

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('(campaign.start_date IS NULL OR campaign.start_date <= :now)', { now })
      .andWhere('(campaign.end_date IS NULL OR campaign.end_date >= :now)', { now })
      .leftJoinAndSelect('campaign.brand', 'brand');

    if (influencerId) {
      // Get campaigns that are:
      // 1. OPEN campaigns (accessible to all)
      // 2. SPECIFIC campaigns where influencer has accepted invitation
      const acceptedInvitations = await this.invitationRepository.find({
        where: {
          influencer_id: influencerId,
          status: InvitationStatus.ACCEPTED,
        },
        select: ['campaign_id'],
      });

      const acceptedCampaignIds = acceptedInvitations.map((inv) => inv.campaign_id);

      if (acceptedCampaignIds.length > 0) {
        queryBuilder.andWhere(
          '(campaign.campaign_type = :openType OR campaign.id IN (:...acceptedIds))',
          {
            openType: CampaignType.OPEN,
            acceptedIds: acceptedCampaignIds,
          },
        );
      } else {
        // Only show OPEN campaigns if no accepted invitations
        queryBuilder.andWhere('campaign.campaign_type = :openType', {
          openType: CampaignType.OPEN,
        });
      }
    } else {
      // If no influencer specified, only return OPEN campaigns
      queryBuilder.andWhere('campaign.campaign_type = :openType', {
        openType: CampaignType.OPEN,
      });
    }

    return queryBuilder.orderBy('campaign.created_at', 'DESC').getMany();
  }

  // Get a single campaign
  async findOne(id: string, brandId?: string): Promise<Campaign> {
    const query: any = { id };

    if (brandId) {
      query.brand_id = brandId;
    }

    const campaign = await this.campaignRepository.findOne({
      where: query,
      relations: ['brand'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  // Update a campaign
  async update(id: string, brandId: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id, brandId);

    // Validate date range if updating dates
    if (updateCampaignDto.start_date || updateCampaignDto.end_date) {
      const start = updateCampaignDto.start_date
        ? new Date(updateCampaignDto.start_date)
        : campaign.start_date;
      const end = updateCampaignDto.end_date
        ? new Date(updateCampaignDto.end_date)
        : campaign.end_date;

      if (start && end && end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(campaign, updateCampaignDto);

    return this.campaignRepository.save(campaign);
  }

  // Delete a campaign
  async remove(id: string, brandId: string): Promise<void> {
    const campaign = await this.findOne(id, brandId);
    await this.campaignRepository.remove(campaign);
  }

  // Activate a campaign
  async activate(id: string, brandId: string): Promise<Campaign> {
    const campaign = await this.findOne(id, brandId);

    // Validate campaign has required fields
    if (!campaign.commission_rate || campaign.commission_rate <= 0) {
      throw new BadRequestException('Campaign must have a valid commission rate');
    }

    if (campaign.start_date && new Date(campaign.start_date) > new Date()) {
      throw new BadRequestException('Cannot activate a campaign with a future start date');
    }

    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      throw new BadRequestException('Cannot activate a campaign that has already ended');
    }

    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepository.save(campaign);
  }

  // Pause a campaign
  async pause(id: string, brandId: string): Promise<Campaign> {
    const campaign = await this.findOne(id, brandId);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Only active campaigns can be paused');
    }

    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepository.save(campaign);
  }

  // End a campaign
  async end(id: string, brandId: string): Promise<Campaign> {
    const campaign = await this.findOne(id, brandId);

    campaign.status = CampaignStatus.ENDED;
    return this.campaignRepository.save(campaign);
  }

  // Get campaign statistics
  async getStatistics(id: string, brandId: string): Promise<any> {
    const campaign = await this.findOne(id, brandId);

    const conversionRate = campaign.total_clicks > 0
      ? (campaign.total_conversions / campaign.total_clicks) * 100
      : 0;

    const averageOrderValue = campaign.total_conversions > 0
      ? Number(campaign.total_revenue) / campaign.total_conversions
      : 0;

    const roi = Number(campaign.total_commission_paid) > 0
      ? (Number(campaign.total_revenue) / Number(campaign.total_commission_paid)) * 100
      : 0;

    const budgetSpent = Number(campaign.total_commission_paid);
    const budgetRemaining = campaign.budget
      ? Number(campaign.budget) - budgetSpent
      : null;

    const budgetUsedPercentage = campaign.budget && Number(campaign.budget) > 0
      ? (budgetSpent / Number(campaign.budget)) * 100
      : 0;

    // Get device type distribution from tracking links clicks
    const trackingLinks = campaign.target_product_ids && campaign.target_product_ids.length > 0
      ? await this.trackingLinkRepository.find({
          where: { product_id: In(campaign.target_product_ids) },
          relations: ['clicks'],
        })
      : []; // No products means no tracking links

    const deviceCounts: Record<string, number> = {};
    let totalDeviceClicks = 0;

    for (const link of trackingLinks) {
      const linkId = link.id;
      const clicks = await this.clickRepository.find({
        where: { tracking_link_id: linkId },
      });

      for (const click of clicks) {
        const device = click.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        totalDeviceClicks++;
      }
    }

    const device_distribution = Object.entries(deviceCounts).map(([device_type, clicks]) => ({
      device_type,
      clicks,
      percentage: totalDeviceClicks > 0 ? (clicks / totalDeviceClicks) * 100 : 0,
    }));

    return {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      status: campaign.status,
      total_clicks: campaign.total_clicks,
      total_conversions: campaign.total_conversions,
      total_revenue: Number(campaign.total_revenue),
      total_commission_paid: Number(campaign.total_commission_paid),
      conversion_rate: conversionRate,
      average_order_value: averageOrderValue,
      roi: roi,
      budget: campaign.budget ? Number(campaign.budget) : null,
      budget_spent: budgetSpent,
      budget_remaining: budgetRemaining,
      budget_used_percentage: budgetUsedPercentage,
      max_conversions: campaign.max_conversions,
      conversions_remaining: campaign.max_conversions
        ? campaign.max_conversions - campaign.total_conversions
        : null,
      device_distribution,
    };
  }

  // Check if influencer is eligible for a campaign
  async checkEligibility(campaignId: string, influencerId: string): Promise<{ eligible: boolean; reason?: string }> {
    const campaign = await this.findOne(campaignId);

    // Check if campaign is active
    if (campaign.status !== CampaignStatus.ACTIVE) {
      return { eligible: false, reason: 'Campaign is not active' };
    }

    // Check campaign type and invitation status
    if (campaign.campaign_type === CampaignType.SPECIFIC) {
      const invitation = await this.invitationRepository.findOne({
        where: {
          campaign_id: campaignId,
          influencer_id: influencerId,
        },
      });

      if (!invitation) {
        return { eligible: false, reason: 'You have not been invited to this campaign' };
      }

      if (invitation.status !== InvitationStatus.ACCEPTED) {
        return {
          eligible: false,
          reason: invitation.status === InvitationStatus.PENDING
            ? 'You must accept the invitation first'
            : 'You declined this campaign invitation',
        };
      }
    }

    // Check date range
    const now = new Date();
    if (campaign.start_date && new Date(campaign.start_date) > now) {
      return { eligible: false, reason: 'Campaign has not started yet' };
    }

    if (campaign.end_date && new Date(campaign.end_date) < now) {
      return { eligible: false, reason: 'Campaign has ended' };
    }

    // Check budget limit
    if (campaign.budget && Number(campaign.total_commission_paid) >= Number(campaign.budget)) {
      return { eligible: false, reason: 'Campaign budget has been exhausted' };
    }

    // Check conversion limit
    if (campaign.max_conversions && campaign.total_conversions >= campaign.max_conversions) {
      return { eligible: false, reason: 'Campaign has reached maximum conversions' };
    }

    // Check if specific influencers are targeted (legacy field, still supported)
    if (campaign.target_influencer_ids && campaign.target_influencer_ids.length > 0) {
      if (!campaign.target_influencer_ids.includes(influencerId)) {
        return { eligible: false, reason: 'You are not included in this campaign' };
      }
    }

    // TODO: Check min_followers requirement (would need influencer data)

    return { eligible: true };
  }
}
