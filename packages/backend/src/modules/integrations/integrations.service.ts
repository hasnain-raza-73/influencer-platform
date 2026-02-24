import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandIntegration } from '../brands/brand-integration.entity';
import { Brand } from '../brands/brand.entity';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { MetaPixelService, MetaConversionData } from './meta-pixel.service';
import { GA4Service, GA4ConversionData } from './ga4.service';
import { Conversion } from '../tracking/entities/conversion.entity';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(BrandIntegration)
    private readonly integrationRepository: Repository<BrandIntegration>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly metaPixelService: MetaPixelService,
    private readonly ga4Service: GA4Service,
  ) {}

  /** Get integration config for a brand, creating a default record if none exists */
  async getIntegration(brandId: string): Promise<BrandIntegration> {
    let integration = await this.integrationRepository.findOne({
      where: { brand_id: brandId },
    });

    if (!integration) {
      integration = this.integrationRepository.create({ brand_id: brandId });
      await this.integrationRepository.save(integration);
    }

    return integration;
  }

  /** Return config with tokens masked (last 4 chars visible) */
  async getMaskedIntegration(brandId: string): Promise<any> {
    const integration = await this.getIntegration(brandId);
    return {
      ...integration,
      meta_access_token: this.maskToken(integration.meta_access_token),
      ga4_api_secret: this.maskToken(integration.ga4_api_secret),
    };
  }

  /** Save/update integration credentials */
  async updateIntegration(brandId: string, dto: UpdateIntegrationDto): Promise<any> {
    let integration = await this.integrationRepository.findOne({
      where: { brand_id: brandId },
    });

    if (!integration) {
      integration = this.integrationRepository.create({ brand_id: brandId });
    }

    // Only update token fields if a real value is provided (not a masked placeholder)
    if (dto.meta_access_token !== undefined && !dto.meta_access_token.includes('•')) {
      integration.meta_access_token = dto.meta_access_token || undefined;
    }
    if (dto.ga4_api_secret !== undefined && !dto.ga4_api_secret.includes('•')) {
      integration.ga4_api_secret = dto.ga4_api_secret || undefined;
    }

    if (dto.meta_pixel_id !== undefined) integration.meta_pixel_id = dto.meta_pixel_id || undefined;
    if (dto.meta_test_event_code !== undefined) integration.meta_test_event_code = dto.meta_test_event_code || undefined;
    if (dto.is_meta_enabled !== undefined) integration.is_meta_enabled = dto.is_meta_enabled;
    if (dto.ga4_measurement_id !== undefined) integration.ga4_measurement_id = dto.ga4_measurement_id || undefined;
    if (dto.is_ga4_enabled !== undefined) integration.is_ga4_enabled = dto.is_ga4_enabled;

    await this.integrationRepository.save(integration);

    return this.getMaskedIntegration(brandId);
  }

  /** Generate the JS pixel snippet personalized for this brand */
  async generatePixelSnippet(brandId: string): Promise<string> {
    const brand = await this.brandRepository.findOne({ where: { id: brandId } });
    const apiUrl = process.env.APP_URL || 'http://localhost:3000';

    return `<!-- Affluencer Tracking Pixel — ${brand?.company_name || 'Your Brand'} -->
<script>
(function() {
  // Set these variables with values from your order system BEFORE this script runs:
  // window._order_id = 'your-order-id';
  // window._order_amount = 99.99;
  // window._currency = 'USD';

  var BRAND_ID = '${brandId}';
  var PIXEL_URL = '${apiUrl}/v1/pixel/track';

  // Check for influencer attribution cookie
  var cookies = document.cookie.split('; ');
  var attributed = cookies.find(function(c) { return c.startsWith('_tracking_link_id='); });
  if (!attributed) return; // visitor did not come through an influencer link

  var orderId = (window._order_id || '').toString();
  var amount = parseFloat(window._order_amount || 0);
  var currency = window._currency || 'USD';

  if (!orderId || !amount) {
    console.warn('[Affluencer] _order_id and _order_amount must be set before the pixel script.');
    return;
  }

  // Fire the conversion pixel (1x1 transparent image)
  var img = new Image();
  img.src = PIXEL_URL
    + '?brand_id=' + encodeURIComponent(BRAND_ID)
    + '&order_id=' + encodeURIComponent(orderId)
    + '&amount=' + encodeURIComponent(amount)
    + '&currency=' + encodeURIComponent(currency);
})();
</script>
<!-- End Affluencer Tracking Pixel -->`;
  }

  /**
   * Forward a conversion to all enabled third-party integrations.
   * Fire-and-forget: never throws, never blocks conversion recording.
   */
  async forwardConversion(
    brandId: string,
    conversion: Conversion,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const integration = await this.integrationRepository.findOne({
        where: { brand_id: brandId },
      });

      if (!integration) return;

      const promises: Promise<any>[] = [];

      // Forward to Meta CAPI
      if (
        integration.is_meta_enabled &&
        integration.meta_pixel_id &&
        integration.meta_access_token
      ) {
        const metaData: MetaConversionData = {
          conversionId: conversion.id,
          orderId: conversion.order_id,
          amount: Number(conversion.amount),
          currency: conversion.currency,
          productId: conversion.product_id,
          ipAddress,
          userAgent,
        };
        promises.push(
          this.metaPixelService.sendPurchaseEvent(
            integration.meta_pixel_id,
            integration.meta_access_token,
            metaData,
            integration.meta_test_event_code,
          ).then((ok) => {
            if (ok) this.logger.log(`Meta CAPI forwarded conversion ${conversion.id}`);
          }),
        );
      }

      // Forward to GA4
      if (
        integration.is_ga4_enabled &&
        integration.ga4_measurement_id &&
        integration.ga4_api_secret
      ) {
        const ga4Data: GA4ConversionData = {
          conversionId: conversion.id,
          orderId: conversion.order_id,
          amount: Number(conversion.amount),
          currency: conversion.currency,
          productId: conversion.product_id,
          trackingLinkId: conversion.tracking_link_id,
        };
        promises.push(
          this.ga4Service.sendPurchaseEvent(
            integration.ga4_measurement_id,
            integration.ga4_api_secret,
            ga4Data,
          ).then((ok) => {
            if (ok) this.logger.log(`GA4 forwarded conversion ${conversion.id}`);
          }),
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      // Never propagate - integrations are best-effort
      this.logger.error(`forwardConversion error: ${err.message}`);
    }
  }

  /** Test Meta CAPI connection */
  async testMetaConnection(brandId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(brandId);

    if (!integration.meta_pixel_id || !integration.meta_access_token) {
      return { success: false, message: 'Meta Pixel ID and Access Token are required.' };
    }

    const testCode = integration.meta_test_event_code || 'TEST12345';
    return this.metaPixelService.sendTestEvent(
      integration.meta_pixel_id,
      integration.meta_access_token,
      testCode,
    );
  }

  /** Test GA4 Measurement Protocol connection */
  async testGA4Connection(brandId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(brandId);

    if (!integration.ga4_measurement_id || !integration.ga4_api_secret) {
      return { success: false, message: 'GA4 Measurement ID and API Secret are required.' };
    }

    return this.ga4Service.sendTestEvent(
      integration.ga4_measurement_id,
      integration.ga4_api_secret,
    );
  }

  private maskToken(token?: string | null): string | null {
    if (!token) return null;
    if (token.length <= 4) return '••••';
    return '••••••••' + token.slice(-4);
  }
}
