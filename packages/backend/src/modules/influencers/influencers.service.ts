import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Brackets } from 'typeorm';
import { Influencer } from './influencer.entity';
import { InfluencerSearchDto } from './dto/influencer-search.dto';

@Injectable()
export class InfluencersService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
  ) {}

  async findAll(params: {
    search?: string;
    niche?: string;
    min_followers?: number;
    social_platform?: string;
    min_social_followers?: number;
    verified_only?: boolean;
    limit?: number;
    page?: number;
  }) {
    const {
      search,
      niche,
      min_followers,
      social_platform,
      min_social_followers,
      verified_only,
      limit = 20,
      page = 1,
    } = params;

    const qb = this.influencerRepository
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.social_accounts', 'social_accounts')
      .leftJoinAndSelect('social_accounts.metrics', 'metrics')
      .where('influencer.status = :status', { status: 'ACTIVE' });

    if (search) {
      qb.andWhere(
        '(influencer.display_name ILIKE :search OR influencer.bio ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (niche) {
      qb.andWhere(':niche = ANY(influencer.niche)', { niche });
    }

    if (min_followers) {
      qb.andWhere('influencer.follower_count >= :min_followers', { min_followers });
    }

    // Filter by social platform presence
    if (social_platform) {
      qb.andWhere('social_accounts.platform = :platform', { platform: social_platform });
    }

    // Filter by minimum social followers
    if (min_social_followers) {
      qb.andWhere('metrics.followers_count >= :min_social_followers', { min_social_followers });
    }

    // Filter by verified accounts only
    if (verified_only) {
      qb.andWhere('social_accounts.is_verified = :verified', { verified: true });
    }

    qb.orderBy('influencer.total_sales', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [influencers, total] = await qb.getManyAndCount();

    return {
      influencers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    return this.influencerRepository.findOne({
      where: { id },
    });
  }

  async advancedSearch(searchDto: InfluencerSearchDto) {
    const {
      search,
      niches,
      country,
      city,
      languages,
      minFollowers,
      maxFollowers,
      minEngagementRate,
      maxEngagementRate,
      minRating,
      minTotalSales,
      maxTotalSales,
      availableForCampaigns,
      campaignTypesInterested,
      isFeatured,
      hasInstagram,
      hasTikTok,
      hasYouTube,
      hasTwitter,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = searchDto;

    const qb = this.influencerRepository
      .createQueryBuilder('influencer')
      .where('influencer.status = :status', { status: 'ACTIVE' });

    // Text search (display_name, bio)
    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('influencer.display_name ILIKE :search', { search: `%${search}%` })
            .orWhere('influencer.bio ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // Niche filter
    if (niches && niches.length > 0) {
      qb.andWhere('influencer.niche && :niches', { niches });
    }

    // Location filters
    if (country) {
      qb.andWhere('influencer.country = :country', { country });
    }

    if (city) {
      qb.andWhere('influencer.city = :city', { city });
    }

    // Language filters
    if (languages && languages.length > 0) {
      qb.andWhere('influencer.languages && :languages', { languages });
    }

    // Follower count range
    if (minFollowers !== undefined) {
      qb.andWhere('influencer.follower_count >= :minFollowers', { minFollowers });
    }

    if (maxFollowers !== undefined) {
      qb.andWhere('influencer.follower_count <= :maxFollowers', { maxFollowers });
    }

    // Engagement rate range
    if (minEngagementRate !== undefined) {
      qb.andWhere('influencer.engagement_rate >= :minEngagementRate', { minEngagementRate });
    }

    if (maxEngagementRate !== undefined) {
      qb.andWhere('influencer.engagement_rate <= :maxEngagementRate', { maxEngagementRate });
    }

    // Rating filter
    if (minRating !== undefined) {
      qb.andWhere('influencer.rating >= :minRating', { minRating });
    }

    // Total sales range
    if (minTotalSales !== undefined) {
      qb.andWhere('influencer.total_sales >= :minTotalSales', { minTotalSales });
    }

    if (maxTotalSales !== undefined) {
      qb.andWhere('influencer.total_sales <= :maxTotalSales', { maxTotalSales });
    }

    // Availability filter
    if (availableForCampaigns !== undefined) {
      qb.andWhere('influencer.available_for_campaigns = :availableForCampaigns', { availableForCampaigns });
    }

    // Campaign types interested filter
    if (campaignTypesInterested && campaignTypesInterested.length > 0) {
      qb.andWhere('influencer.campaign_types_interested && :campaignTypesInterested', {
        campaignTypesInterested,
      });
    }

    // Featured filter
    if (isFeatured !== undefined) {
      qb.andWhere('influencer.is_featured = :isFeatured', { isFeatured });
    }

    // Social platform filters
    if (hasInstagram) {
      qb.andWhere('influencer.social_instagram IS NOT NULL');
    }

    if (hasTikTok) {
      qb.andWhere('influencer.social_tiktok IS NOT NULL');
    }

    if (hasYouTube) {
      qb.andWhere('influencer.social_youtube IS NOT NULL');
    }

    if (hasTwitter) {
      qb.andWhere('influencer.social_twitter IS NOT NULL');
    }

    // Sorting
    const sortColumn = `influencer.${sortBy}`;
    qb.orderBy(sortColumn, sortOrder);

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    const [influencers, total] = await qb.getManyAndCount();

    return {
      influencers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
