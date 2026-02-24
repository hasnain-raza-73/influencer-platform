import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { Brand, BrandStatus } from '../brands/brand.entity';
import { Influencer, InfluencerStatus } from '../influencers/influencer.entity';
import { Product, ProductReviewStatus, ProductStatus } from '../products/product.entity';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';
import { Payout, PayoutStatus } from '../payouts/entities/payout.entity';
import { Conversion } from '../tracking/entities/conversion.entity';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Influencer)
    private readonly influencerRepository: Repository<Influencer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
  ) {}

  async getOverview() {
    const [
      totalBrands,
      totalInfluencers,
      pendingReviewCount,
      needsRevisionCount,
      activeCampaigns,
      totalCampaigns,
      totalConversions,
    ] = await Promise.all([
      this.brandRepository.count(),
      this.influencerRepository.count(),
      this.productRepository.count({ where: { review_status: ProductReviewStatus.PENDING_REVIEW } }),
      this.productRepository.count({ where: { review_status: ProductReviewStatus.NEEDS_REVISION } }),
      this.campaignRepository.count({ where: { status: CampaignStatus.ACTIVE } }),
      this.campaignRepository.count(),
      this.conversionRepository.count(),
    ]);

    // Pending payout total
    const pendingPayouts = await this.payoutRepository
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'total')
      .where('payout.status = :status', { status: PayoutStatus.PENDING })
      .getRawOne();

    // Total platform revenue
    const revenueResult = await this.conversionRepository
      .createQueryBuilder('conversion')
      .select('SUM(conversion.amount)', 'total')
      .getRawOne();

    return {
      total_brands: totalBrands,
      total_influencers: totalInfluencers,
      pending_reviews: pendingReviewCount,
      needs_revision: needsRevisionCount,
      active_campaigns: activeCampaigns,
      total_campaigns: totalCampaigns,
      total_conversions: totalConversions,
      pending_payout_amount: parseFloat(pendingPayouts?.total || '0'),
      total_platform_revenue: parseFloat(revenueResult?.total || '0'),
    };
  }

  async getBrands(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.user', 'user');

    if (status) qb.andWhere('brand.status = :status', { status });
    if (search) {
      qb.andWhere('(brand.company_name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    const total = await qb.getCount();
    qb.skip(skip).take(limit).orderBy('brand.created_at', 'DESC');
    const brands = await qb.getMany();
    return { data: brands, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async updateBrandStatus(brandId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
      relations: ['user'],
    });
    if (!brand) throw new NotFoundException('Brand not found');

    brand.status = status as BrandStatus;
    await this.brandRepository.save(brand);

    // Also update the user account status
    brand.user.status = status === 'SUSPENDED' ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    await this.userRepository.save(brand.user);

    return brand;
  }

  async getInfluencers(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.influencerRepository
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.user', 'user');

    if (status) qb.andWhere('influencer.status = :status', { status });
    if (search) {
      qb.andWhere('(influencer.display_name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    qb.skip(skip).take(limit).orderBy('influencer.created_at', 'DESC');

    const [influencers, total] = await qb.getManyAndCount();
    return { data: influencers, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async updateInfluencerStatus(influencerId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId },
      relations: ['user'],
    });
    if (!influencer) throw new NotFoundException('Influencer not found');

    influencer.status = status as InfluencerStatus;
    await this.influencerRepository.save(influencer);

    influencer.user.status = status === 'SUSPENDED' ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    await this.userRepository.save(influencer.user);

    return influencer;
  }

  async getCampaigns(params: { status?: string; brand_id?: string; page?: number; limit?: number }) {
    const { status, brand_id, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.brand', 'brand');

    if (status) qb.andWhere('campaign.status = :status', { status });
    if (brand_id) qb.andWhere('campaign.brand_id = :brand_id', { brand_id });

    qb.skip(skip).take(limit).orderBy('campaign.created_at', 'DESC');

    const [campaigns, total] = await qb.getManyAndCount();
    return { data: campaigns, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async closeCampaign(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = CampaignStatus.ENDED;
    return await this.campaignRepository.save(campaign);
  }

  async getProducts(params: { review_status?: string; brand_id?: string; page?: number; limit?: number }) {
    const { review_status = ProductReviewStatus.PENDING_REVIEW, brand_id, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand');

    if (review_status && review_status !== 'ALL') {
      qb.andWhere('product.review_status = :review_status', { review_status });
    }
    if (brand_id) qb.andWhere('product.brand_id = :brand_id', { brand_id });

    qb.skip(skip).take(limit).orderBy('product.created_at', 'DESC');

    const [products, total] = await qb.getManyAndCount();
    return { data: products, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async reviewProduct(
    productId: string,
    data: { review_status: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED'; review_notes?: string },
  ) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    product.review_status = data.review_status as ProductReviewStatus;
    product.review_notes = data.review_notes || undefined;

    // Set product operational status based on review decision
    if (data.review_status === 'APPROVED') {
      product.status = ProductStatus.ACTIVE;
    } else {
      product.status = ProductStatus.INACTIVE;
    }

    return await this.productRepository.save(product);
  }

  async getPayouts(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.payoutRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.influencer', 'influencer')
      .leftJoinAndSelect('influencer.user', 'user');

    if (status) qb.andWhere('payout.status = :status', { status });

    qb.skip(skip).take(limit).orderBy('payout.created_at', 'DESC');

    const [payouts, total] = await qb.getManyAndCount();
    return { data: payouts, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getConversions(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const qb = this.conversionRepository
      .createQueryBuilder('conversion')
      .leftJoinAndSelect('conversion.brand', 'brand')
      .leftJoinAndSelect('conversion.influencer', 'influencer');

    if (status) qb.andWhere('conversion.status = :status', { status });

    qb.skip(skip).take(limit).orderBy('conversion.created_at', 'DESC');

    const [conversions, total] = await qb.getManyAndCount();
    return { data: conversions, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getBrandDetail(brandId: string) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
      relations: ['user'],
    });
    if (!brand) throw new NotFoundException('Brand not found');

    const [campaigns, products] = await Promise.all([
      this.campaignRepository.find({
        where: { brand_id: brandId },
        order: { created_at: 'DESC' },
        take: 50,
      }),
      this.productRepository.find({
        where: { brand_id: brandId },
        order: { created_at: 'DESC' },
        take: 50,
      }),
    ]);

    const stats = {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter((c) => c.status === CampaignStatus.ACTIVE).length,
      total_products: products.length,
      approved_products: products.filter((p) => p.review_status === ProductReviewStatus.APPROVED).length,
      pending_products: products.filter((p) => p.review_status === ProductReviewStatus.PENDING_REVIEW).length,
      total_revenue: campaigns.reduce((sum, c) => sum + Number(c.total_revenue || 0), 0),
      total_conversions: campaigns.reduce((sum, c) => sum + Number(c.total_conversions || 0), 0),
    };

    return { brand, campaigns, products, stats };
  }

  async getInfluencerDetail(influencerId: string) {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId },
      relations: ['user'],
    });
    if (!influencer) throw new NotFoundException('Influencer not found');

    // Get tracking links with product and brand info
    const trackingLinks = await this.trackingLinkRepository
      .createQueryBuilder('tl')
      .leftJoinAndSelect('tl.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('tl.influencer_id = :influencerId', { influencerId })
      .orderBy('tl.created_at', 'DESC')
      .take(50)
      .getMany();

    // Get recent conversions for this influencer
    const conversions = await this.conversionRepository
      .createQueryBuilder('conversion')
      .leftJoinAndSelect('conversion.brand', 'brand')
      .where('conversion.influencer_id = :influencerId', { influencerId })
      .orderBy('conversion.created_at', 'DESC')
      .take(20)
      .getMany();

    const stats = {
      total_clicks: influencer.total_clicks || 0,
      total_conversions: influencer.total_conversions || 0,
      total_earnings: influencer.total_earnings || 0,
      total_sales: influencer.total_sales || 0,
      active_links: trackingLinks.length,
    };

    return { influencer, tracking_links: trackingLinks, conversions, stats };
  }
}
