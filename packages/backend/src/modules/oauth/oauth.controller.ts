import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { SocialIntegrationsService } from '../social-integrations/social-integrations.service';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { SocialPlatform } from '../social-integrations/entities/social-account.entity';
import * as crypto from 'crypto';

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly socialIntegrationsService: SocialIntegrationsService,
    private readonly configService: ConfigService,
  ) {}

  // Helper to encode state with influencer_id
  private encodeState(influencerId: string): string {
    const stateObj = {
      influencer_id: influencerId,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };
    return Buffer.from(JSON.stringify(stateObj)).toString('base64');
  }

  // Helper to decode and verify state
  private decodeState(state: string): { influencer_id: string } {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());

      // Verify timestamp (state should be used within 10 minutes)
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - decoded.timestamp > tenMinutes) {
        throw new UnauthorizedException('OAuth state expired');
      }

      return { influencer_id: decoded.influencer_id };
    } catch (error) {
      throw new UnauthorizedException('Invalid OAuth state');
    }
  }

  // Helper to get frontend URL
  private getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  }

  // =====================
  // INSTAGRAM OAuth Flow
  // =====================

  @Get('instagram/authorize')
  async instagramAuthorize(@Query('influencer_id') influencerId: string, @Res() res: Response) {
    if (!influencerId) {
      throw new BadRequestException('influencer_id is required');
    }

    const state = this.encodeState(influencerId);
    const authUrl = this.oauthService.getInstagramAuthUrl(state);

    res.redirect(authUrl);
  }

  @Get('instagram/callback')
  async instagramCallback(@Query() query: OAuthCallbackDto, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl();

    // Check for errors
    if (query.error) {
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(query.error_description || query.error)}`
      );
    }

    if (!query.code || !query.state) {
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_error=Missing code or state`);
    }

    try {
      // Decode and verify state
      const { influencer_id } = this.decodeState(query.state);

      // Exchange code for short-lived token
      const shortLivedToken = await this.oauthService.exchangeInstagramCode(query.code);

      // Exchange for long-lived token
      const longLivedToken = await this.oauthService.getInstagramLongLivedToken(
        shortLivedToken.access_token
      );

      // Get user profile
      const profile = await this.oauthService.getInstagramUserProfile(longLivedToken.access_token);

      // Calculate token expiration (60 days for Instagram long-lived tokens)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      // Save to database
      await this.socialIntegrationsService.connectAccount(influencer_id, {
        platform: SocialPlatform.INSTAGRAM,
        platform_user_id: profile.id,
        platform_username: profile.username,
        access_token: longLivedToken.access_token,
        refresh_token: longLivedToken.refresh_token,
        token_expires_at: expiresAt.toISOString(),
      });

      // Redirect back to frontend with success
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_success=instagram`);
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(error.message || 'Failed to connect Instagram account')}`
      );
    }
  }

  // =====================
  // FACEBOOK OAuth Flow
  // =====================

  @Get('facebook/authorize')
  async facebookAuthorize(@Query('influencer_id') influencerId: string, @Res() res: Response) {
    if (!influencerId) {
      throw new BadRequestException('influencer_id is required');
    }

    const state = this.encodeState(influencerId);
    const authUrl = this.oauthService.getFacebookAuthUrl(state);

    res.redirect(authUrl);
  }

  @Get('facebook/callback')
  async facebookCallback(@Query() query: OAuthCallbackDto, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl();

    // Check for errors
    if (query.error) {
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(query.error_description || query.error)}`
      );
    }

    if (!query.code || !query.state) {
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_error=Missing code or state`);
    }

    try {
      // Decode and verify state
      const { influencer_id } = this.decodeState(query.state);

      // Exchange code for short-lived token
      const shortLivedToken = await this.oauthService.exchangeFacebookCode(query.code);

      // Exchange for long-lived token (60 days)
      const longLivedToken = await this.oauthService.getFacebookLongLivedToken(
        shortLivedToken.access_token
      );

      // Get Facebook pages (for Instagram Business accounts)
      const pages = await this.oauthService.getFacebookPages(longLivedToken.access_token);

      // For now, we'll just save the main Facebook connection
      // Later, you could allow selecting which page/Instagram account to connect
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      // Save Facebook account
      await this.socialIntegrationsService.connectAccount(influencer_id, {
        platform: SocialPlatform.FACEBOOK,
        platform_user_id: pages[0]?.id || 'facebook_user', // Use first page or generic ID
        platform_username: pages[0]?.name,
        access_token: longLivedToken.access_token,
        refresh_token: longLivedToken.refresh_token,
        token_expires_at: expiresAt.toISOString(),
      });

      // Redirect back to frontend with success
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_success=facebook`);
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(error.message || 'Failed to connect Facebook account')}`
      );
    }
  }

  // =====================
  // TIKTOK OAuth Flow
  // =====================

  @Get('tiktok/authorize')
  async tiktokAuthorize(@Query('influencer_id') influencerId: string, @Res() res: Response) {
    if (!influencerId) {
      throw new BadRequestException('influencer_id is required');
    }

    const state = this.encodeState(influencerId);
    const authUrl = this.oauthService.getTikTokAuthUrl(state);

    res.redirect(authUrl);
  }

  @Get('tiktok/callback')
  async tiktokCallback(@Query() query: OAuthCallbackDto, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl();

    // Check for errors
    if (query.error) {
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(query.error_description || query.error)}`
      );
    }

    if (!query.code || !query.state) {
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_error=Missing code or state`);
    }

    try {
      // Decode and verify state
      const { influencer_id } = this.decodeState(query.state);

      // Exchange code for tokens
      const tokens = await this.oauthService.exchangeTikTokCode(query.code);

      // Get user profile
      const profile = await this.oauthService.getTikTokUserProfile(tokens.access_token);

      // TikTok access tokens expire in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Save to database
      await this.socialIntegrationsService.connectAccount(influencer_id, {
        platform: SocialPlatform.TIKTOK,
        platform_user_id: profile.open_id,
        platform_username: profile.display_name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
      });

      // Redirect back to frontend with success
      return res.redirect(`${frontendUrl}/influencer/settings?oauth_success=tiktok`);
    } catch (error) {
      console.error('TikTok OAuth error:', error);
      return res.redirect(
        `${frontendUrl}/influencer/settings?oauth_error=${encodeURIComponent(error.message || 'Failed to connect TikTok account')}`
      );
    }
  }
}
