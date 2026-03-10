import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TrackingLink } from './entities/tracking-link.entity';
import { TrackingLinkProduct } from './entities/tracking-link-product.entity';
import { Click } from './entities/click.entity';
import { Conversion, ConversionStatus } from './entities/conversion.entity';
import { Product } from '../products/product.entity';
import { CreateTrackingLinkDto } from './dto/create-tracking-link.dto';
import { CreateAdvancedLinkDto } from './dto/create-advanced-link.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { User, UserRole } from '../users/user.entity';
import { randomBytes } from 'crypto';
import { IntegrationsService } from '../integrations/integrations.service';
import { SlugService } from './slug.service';
import { QRCodeService } from './qrcode.service';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
    @InjectRepository(TrackingLinkProduct)
    private readonly linkProductRepository: Repository<TrackingLinkProduct>,
    @InjectRepository(Click)
    private readonly clickRepository: Repository<Click>,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly integrationsService: IntegrationsService,
    private readonly slugService: SlugService,
    private readonly qrCodeService: QRCodeService,
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

  // Generate advanced tracking link with custom slug, multi-product, QR code, etc.
  async generateAdvancedTrackingLink(
    createDto: CreateAdvancedLinkDto,
    user: User,
    baseUrl: string,
  ): Promise<TrackingLink> {
    if (user.role !== UserRole.INFLUENCER) {
      throw new BadRequestException('Only influencers can generate tracking links');
    }

    if (!user.influencer) {
      throw new BadRequestException('Influencer profile not found');
    }

    // Validate: must have either single product or multiple products
    if (!createDto.product_id && (!createDto.products || createDto.products.length === 0)) {
      throw new BadRequestException('Must provide either product_id or products array');
    }

    if (createDto.product_id && createDto.products && createDto.products.length > 0) {
      throw new BadRequestException('Cannot provide both product_id and products array');
    }

    // If custom slug provided, validate and check availability
    if (createDto.custom_slug) {
      const validation = this.slugService.validateSlugFormat(createDto.custom_slug);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }

      const availability = await this.slugService.checkAvailability(createDto.custom_slug);
      if (!availability.available) {
        throw new BadRequestException(
          `Slug "${createDto.custom_slug}" is not available. Try: ${availability.suggestions?.join(', ')}`,
        );
      }
    }

    // Generate unique code
    const uniqueCode = this.generateUniqueCode();

    // Create tracking link
    const trackingLink: TrackingLink = this.trackingLinkRepository.create({
      influencer_id: user.influencer.id,
      product_id: createDto.product_id || undefined,
      unique_code: uniqueCode,
      custom_slug: createDto.custom_slug
        ? this.slugService.normalizeSlug(createDto.custom_slug)
        : undefined,
      is_bio_link: createDto.is_bio_link || false,
      landing_page_config: createDto.landing_page_config || {},
    });

    const savedLink: TrackingLink = await this.trackingLinkRepository.save(trackingLink);

    // If multi-product link, create junction table entries
    if (createDto.products && createDto.products.length > 0) {
      const linkProducts = createDto.products.map((p) =>
        this.linkProductRepository.create({
          tracking_link_id: savedLink.id,
          product_id: p.product_id,
          display_order: p.display_order,
        }),
      );

      await this.linkProductRepository.save(linkProducts);
    }

    // Generate QR code if requested
    if (createDto.generate_qr) {
      const publicUrl = savedLink.getPublicUrl(baseUrl);
      const qrDataUrl = await this.qrCodeService.generateDataURL(publicUrl, {
        size: 400,
        errorCorrectionLevel: 'M',
      });

      savedLink.qr_code_url = qrDataUrl;
      await this.trackingLinkRepository.save(savedLink);
    }

    // Load relationships before returning
    const linkWithRelations = await this.trackingLinkRepository.findOne({
      where: { id: savedLink.id },
      relations: ['product', 'link_products'],
    });

    if (!linkWithRelations) {
      throw new NotFoundException('Tracking link not found after creation');
    }

    return linkWithRelations;
  }

  // Check if custom slug is available
  async checkSlugAvailability(slug: string): Promise<{
    available: boolean;
    suggestions?: string[];
  }> {
    return await this.slugService.checkAvailability(slug);
  }

  // Generate QR code for an existing tracking link
  async generateQRCodeForLink(
    linkId: string,
    userId: string,
    baseUrl: string,
  ): Promise<string> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!trackingLink) {
      throw new NotFoundException('Tracking link not found');
    }

    // Verify ownership
    if (trackingLink.influencer_id !== userId) {
      throw new BadRequestException('You can only generate QR codes for your own links');
    }

    const publicUrl = trackingLink.getPublicUrl(baseUrl);
    const qrDataUrl = await this.qrCodeService.generateDataURL(publicUrl, {
      size: 500,
      errorCorrectionLevel: 'H',
    });

    // Save QR code URL to database
    trackingLink.qr_code_url = qrDataUrl;
    await this.trackingLinkRepository.save(trackingLink);

    return qrDataUrl;
  }

  // Track a click and redirect to product
  async trackClick(
    uniqueCode: string,
    ipAddress: string,
    userAgent: string,
    referrer?: string,
    productId?: string,
  ): Promise<{ redirectUrl: string; trackingLinkId: string; isMultiProduct: boolean }> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { unique_code: uniqueCode },
      relations: ['product', 'link_products'],
    });

    if (!trackingLink) {
      throw new NotFoundException('Tracking link not found');
    }

    // For multi-product links, need to know which product was clicked
    let targetProductId = trackingLink.product_id;
    let redirectUrl = trackingLink.product?.product_url;

    if (trackingLink.isMultiProduct()) {
      if (!productId) {
        throw new BadRequestException('Product ID required for multi-product links');
      }

      // Verify product is part of this link
      const linkProduct = trackingLink.link_products.find(
        (lp) => lp.product_id === productId,
      );
      if (!linkProduct) {
        throw new BadRequestException('Product not found in this tracking link');
      }

      targetProductId = productId;

      // Get product details for redirect
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      redirectUrl = product.product_url;
    }

    // Record the click with product_id for multi-product tracking
    const click = this.clickRepository.create({
      tracking_link_id: trackingLink.id,
      product_id: targetProductId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      device_type: this.detectDeviceType(userAgent),
    });

    await this.clickRepository.save(click);

    // Ensure redirect URL is valid
    if (!redirectUrl) {
      throw new NotFoundException('Product URL not found for this tracking link');
    }

    // Update tracking link stats
    trackingLink.clicks += 1;
    trackingLink.last_clicked_at = new Date();
    await this.trackingLinkRepository.save(trackingLink);

    return {
      redirectUrl,
      trackingLinkId: trackingLink.id,
      isMultiProduct: trackingLink.isMultiProduct(),
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
      relations: ['product', 'link_products'],
      order: { created_at: 'DESC' },
    });
  }

  // Get single tracking link with stats
  async getTrackingLink(id: string, userId: string, userRole: UserRole): Promise<TrackingLink> {
    const trackingLink = await this.trackingLinkRepository.findOne({
      where: { id },
      relations: ['product', 'influencer', 'link_products'],
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
