import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TrackingLink } from './entities/tracking-link.entity';
import { Click } from './entities/click.entity';
import { Conversion, ConversionStatus } from './entities/conversion.entity';
import { Product } from '../products/product.entity';
import { CreateTrackingLinkDto } from './dto/create-tracking-link.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { User, UserRole } from '../users/user.entity';
import { randomBytes } from 'crypto';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
    @InjectRepository(Click)
    private readonly clickRepository: Repository<Click>,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly integrationsService: IntegrationsService,
  ) {}

  // Generate a unique tracking link for influencer + product
  async generateTrackingLink(createDto: CreateTrackingLinkDto, user: User): Promise<TrackingLink> {
    if (user.role !== UserRole.INFLUENCER) {
      throw new BadRequestException('Only influencers can generate tracking links');
    }

    if (!user.influencer) {
      throw new BadRequestException('Influencer profile not found');
    }

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createDto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if tracking link already exists for this influencer-product combination
    let trackingLink = await this.trackingLinkRepository.findOne({
      where: {
        influencer_id: user.influencer.id,
        product_id: createDto.product_id,
      },
    });

    if (trackingLink) {
      return trackingLink; // Return existing link
    }

    // Generate unique code
    const uniqueCode = this.generateUniqueCode();

    // Create new tracking link
    trackingLink = this.trackingLinkRepository.create({
      influencer_id: user.influencer.id,
      product_id: createDto.product_id,
      unique_code: uniqueCode,
    });

    return await this.trackingLinkRepository.save(trackingLink);
  }

  // Track a click and redirect to product
  async trackClick(
    uniqueCode: string,
    ipAddress: string,
    userAgent: string,
    referrer?: string,
  ): Promise<{ redirectUrl: string; trackingLinkId: string }> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { unique_code: uniqueCode },
      relations: ['product'],
    });

    if (!trackingLink) {
      throw new NotFoundException('Tracking link not found');
    }

    // Record the click
    const click = this.clickRepository.create({
      tracking_link_id: trackingLink.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      device_type: this.detectDeviceType(userAgent),
    });

    await this.clickRepository.save(click);

    // Update tracking link stats
    trackingLink.clicks += 1;
    trackingLink.last_clicked_at = new Date();
    await this.trackingLinkRepository.save(trackingLink);

    return {
      redirectUrl: trackingLink.product.product_url,
      trackingLinkId: trackingLink.id,
    };
  }

  // Track a conversion (purchase) - called by brand via webhook
  async trackConversion(
    trackingLinkId: string,
    conversionDto: TrackConversionDto,
    brandId: string,
  ): Promise<Conversion> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { id: trackingLinkId },
      relations: ['product', 'influencer'],
    });

    if (!trackingLink) {
      throw new NotFoundException('Tracking link not found');
    }

    // Check for duplicate order
    const existingConversion = await this.conversionRepository.findOne({
      where: {
        brand_id: brandId,
        order_id: conversionDto.order_id,
      },
    });

    if (existingConversion) {
      throw new ConflictException('Conversion already tracked for this order');
    }

    // Get the most recent click (for attribution - clicked_at timestamp)
    const recentClick = await this.clickRepository.findOne({
      where: {
        tracking_link_id: trackingLinkId,
      },
      order: { clicked_at: 'DESC' },
    });

    if (!recentClick) {
      throw new BadRequestException('No click found for this tracking link');
    }

    // Check if click is within attribution window (30 days)
    const attributionWindowDays = 30;
    const clickDate = new Date(recentClick.clicked_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - clickDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > attributionWindowDays) {
      throw new BadRequestException('Click is outside the 30-day attribution window');
    }

    // Get commission rate (use product's commission_rate or brand's default)
    const product = await this.productRepository.findOne({
      where: { id: trackingLink.product_id },
      relations: ['brand'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const commissionRate = product.commission_rate || product.brand.default_commission_rate;
    const commissionAmount = conversionDto.amount * Number(commissionRate);

    // Create conversion
    const conversion = this.conversionRepository.create({
      tracking_link_id: trackingLinkId,
      influencer_id: trackingLink.influencer_id,
      brand_id: brandId,
      product_id: trackingLink.product_id,
      order_id: conversionDto.order_id,
      amount: conversionDto.amount,
      currency: conversionDto.currency || 'USD',
      commission_rate: Number(commissionRate),
      commission_amount: commissionAmount,
      status: ConversionStatus.PENDING,
      clicked_at: recentClick.clicked_at,
      notes: conversionDto.notes,
    });

    await this.conversionRepository.save(conversion);

    // Update tracking link stats
    trackingLink.conversions += 1;
    trackingLink.total_sales = Number(trackingLink.total_sales) + conversionDto.amount;
    await this.trackingLinkRepository.save(trackingLink);

    // Forward to Meta CAPI / GA4 asynchronously (fire-and-forget)
    this.integrationsService.forwardConversion(brandId, conversion).catch(() => {});

    return conversion;
  }

  // Find attribution for a conversion (pixel tracking)
  async findAttributionForPixel(
    brandId: string,
    orderId: string,
    cookieValue?: string,
  ): Promise<{ tracking_link_id: string } | null> {
    // If we have a cookie with tracking_link_id, use it
    if (cookieValue) {
      const trackingLink = await this.trackingLinkRepository.findOne({
        where: { id: cookieValue },
      });

      if (trackingLink) {
        // Verify the click is within attribution window
        const attributionWindowDays = 30;
        const now = new Date();
        const lastClickDate = trackingLink.last_clicked_at ? new Date(trackingLink.last_clicked_at) : null;

        if (lastClickDate) {
          const daysDiff = Math.floor((now.getTime() - lastClickDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= attributionWindowDays) {
            return { tracking_link_id: trackingLink.id };
          }
        }
      }
    }

    return null;
  }

  // Get tracking links for an influencer
  async getInfluencerLinks(influencerId: string): Promise<TrackingLink[]> {
    return await this.trackingLinkRepository.find({
      where: { influencer_id: influencerId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  // Get single tracking link with stats
  async getTrackingLink(id: string, userId: string, userRole: UserRole): Promise<TrackingLink> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { id },
      relations: ['product', 'influencer'],
    });

    if (!trackingLink) {
      throw new NotFoundException('Tracking link not found');
    }

    // Authorization: only the influencer can view their own link
    if (userRole === UserRole.INFLUENCER && trackingLink.influencer_id !== userId) {
      throw new BadRequestException('You can only view your own tracking links');
    }

    return trackingLink;
  }

  // Generate a unique random code
  private generateUniqueCode(): string {
    return randomBytes(12).toString('hex'); // 24 character hex string
  }

  // Detect device type from user agent
  private detectDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return 'mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    return 'desktop';
  }
}
