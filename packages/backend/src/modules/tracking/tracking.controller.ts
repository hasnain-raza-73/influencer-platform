import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TrackingService } from './tracking.service';
import { CreateTrackingLinkDto } from './dto/create-tracking-link.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';
import { IntegrationsService } from '../integrations/integrations.service';

@Controller()
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  // Generate tracking link (Influencer only)
  @Post('tracking/links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.CREATED)
  async generateLink(@Body() createDto: CreateTrackingLinkDto, @CurrentUser() user: User) {
    const trackingLink = await this.trackingService.generateTrackingLink(createDto, user);

    // Build the tracking URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/v1/track/c/${trackingLink.unique_code}`;

    return {
      success: true,
      data: {
        ...trackingLink,
        tracking_url: trackingUrl,
      },
    };
  }

  // Get influencer's tracking links
  @Get('tracking/links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getMyLinks(@CurrentUser() user: User) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const links = await this.trackingService.getInfluencerLinks(user.influencer.id);

    // Add tracking URLs to each link
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const linksWithUrls = links.map((link) => ({
      ...link,
      tracking_url: `${baseUrl}/v1/track/c/${link.unique_code}`,
    }));

    return {
      success: true,
      data: linksWithUrls,
    };
  }

  // Get specific tracking link
  @Get('tracking/links/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getLink(@Param('id') id: string, @CurrentUser() user: User) {
    const influencerId = user.influencer?.id || '';
    const trackingLink = await this.trackingService.getTrackingLink(id, influencerId, user.role);

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return {
      success: true,
      data: {
        ...trackingLink,
        tracking_url: `${baseUrl}/v1/track/c/${trackingLink.unique_code}`,
      },
    };
  }

  // Click tracking endpoint - redirects to product (GET for direct browser access)
  @Get('track/c/:code')
  @HttpCode(HttpStatus.FOUND)
  async trackClick(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    try {
      const result = await this.trackingService.trackClick(
        code,
        ipAddress,
        userAgent,
        referrer as string,
      );

      // Set cookie for attribution (30 days)
      res.cookie('_tracking_link_id', result.trackingLinkId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'lax',
      });

      // Redirect to product URL
      return res.redirect(result.redirectUrl);
    } catch (error) {
      // If tracking link not found, redirect to homepage or show error
      return res.status(404).json({
        success: false,
        message: 'Tracking link not found',
      });
    }
  }

  // Click tracking endpoint - returns JSON for SPA (POST for API access)
  @Post('tracking/:code/click')
  @HttpCode(HttpStatus.OK)
  async trackClickApi(
    @Param('code') code: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    const result = await this.trackingService.trackClick(
      code,
      ipAddress,
      userAgent,
      referrer as string,
    );

    // Set cookie for attribution (30 days)
    res.cookie('_tracking_link_id', result.trackingLinkId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });

    return {
      success: true,
      data: {
        redirect_url: result.redirectUrl,
      },
    };
  }

  // Pixel tracking endpoint - returns 1x1 transparent GIF
  @Get('pixel/track')
  @HttpCode(HttpStatus.OK)
  async trackPixel(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-api-key') apiKey: string,
  ) {
    // Called by our JS pixel snippet installed on brand's purchase confirmation page
    // Format: /pixel/track?brand_id=UUID&order_id=ORDER123&amount=99.99&currency=USD

    // CORS headers — pixel fires cross-domain from brand's website
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const { order_id, amount, brand_id, currency } = req.query;
    const trackingLinkId = req.cookies?._tracking_link_id;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    try {
      if (trackingLinkId && order_id && amount && brand_id) {
        const conversion = await this.trackingService.trackConversion(
          trackingLinkId as string,
          {
            order_id: order_id as string,
            amount: parseFloat(amount as string),
            currency: (currency as string) || 'USD',
          },
          brand_id as string,
        );
        // Forward to Meta CAPI / GA4 with IP + UA for enriched matching
        this.integrationsService
          .forwardConversion(brand_id as string, conversion, ipAddress, userAgent)
          .catch(() => {});
      }
    } catch (error) {
      // Silently fail — always return the pixel GIF
      console.error('Pixel tracking error:', error.message);
    }

    // Return 1x1 transparent GIF
    const pixelBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', pixelBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(pixelBuffer);
  }

  // Webhook for conversion tracking (Brand API key required)
  @Post('webhooks/conversion')
  @HttpCode(HttpStatus.OK)
  async trackConversionWebhook(
    @Body() conversionDto: TrackConversionDto & { tracking_link_id: string },
    @Headers('x-api-key') apiKey: string,
    @Headers('x-brand-id') brandId: string,
  ) {
    // TODO: Verify API key belongs to the brand
    // For now, we'll just use the brand_id from header

    if (!apiKey || !brandId) {
      return {
        success: false,
        message: 'API key and brand ID required',
      };
    }

    try {
      const conversion = await this.trackingService.trackConversion(
        conversionDto.tracking_link_id,
        conversionDto,
        brandId,
      );

      return {
        success: true,
        data: conversion,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
