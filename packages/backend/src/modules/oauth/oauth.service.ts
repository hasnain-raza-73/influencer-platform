import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
}

export interface FacebookPageProfile {
  id: string;
  name: string;
  followers_count?: number;
  access_token?: string;
}

export interface TikTokUserProfile {
  open_id: string;
  union_id?: string;
  display_name?: string;
  avatar_url?: string;
}

@Injectable()
export class OAuthService {
  constructor(private configService: ConfigService) {}

  // =====================
  // INSTAGRAM OAuth Flow
  // =====================

  getInstagramAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new BadRequestException('Instagram OAuth not configured. Please set INSTAGRAM_CLIENT_ID and INSTAGRAM_REDIRECT_URI environment variables.');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state,
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeInstagramCode(code: string): Promise<OAuthTokenResponse> {
    const clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('INSTAGRAM_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('Instagram OAuth not configured');
    }

    try {
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to exchange Instagram authorization code');
    }
  }

  async getInstagramLongLivedToken(shortLivedToken: string): Promise<OAuthTokenResponse> {
    const clientSecret = this.configService.get<string>('INSTAGRAM_CLIENT_SECRET');

    try {
      const response = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: clientSecret,
          access_token: shortLivedToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get long-lived Instagram token');
    }
  }

  async getInstagramUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    try {
      const response = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch Instagram user profile');
    }
  }

  async refreshInstagramToken(accessToken: string): Promise<OAuthTokenResponse> {
    try {
      const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to refresh Instagram token');
    }
  }

  // =====================
  // FACEBOOK OAuth Flow
  // =====================

  getFacebookAuthUrl(state: string): string {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');

    if (!appId || !redirectUri) {
      throw new BadRequestException('Facebook OAuth not configured. Please set FACEBOOK_APP_ID and FACEBOOK_REDIRECT_URI environment variables.');
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: 'pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights',
      response_type: 'code',
      state,
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeFacebookCode(code: string): Promise<OAuthTokenResponse> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');

    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to exchange Facebook authorization code');
    }
  }

  async getFacebookPages(accessToken: string): Promise<FacebookPageProfile[]> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          fields: 'id,name,followers_count,access_token',
          access_token: accessToken,
        },
      });

      return response.data.data || [];
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch Facebook pages');
    }
  }

  async getFacebookLongLivedToken(shortLivedToken: string): Promise<OAuthTokenResponse> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');

    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get long-lived Facebook token');
    }
  }

  // =====================
  // TIKTOK OAuth Flow
  // =====================

  getTikTokAuthUrl(state: string): string {
    const clientKey = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');

    if (!clientKey || !redirectUri) {
      throw new BadRequestException('TikTok OAuth not configured. Please set TIKTOK_CLIENT_KEY and TIKTOK_REDIRECT_URI environment variables.');
    }

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    });

    return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
  }

  async exchangeTikTokCode(code: string): Promise<OAuthTokenResponse> {
    const clientKey = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    const clientSecret = this.configService.get<string>('TIKTOK_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');

    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        {
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to exchange TikTok authorization code');
    }
  }

  async getTikTokUserProfile(accessToken: string): Promise<TikTokUserProfile> {
    try {
      const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
        params: {
          fields: 'open_id,union_id,avatar_url,display_name',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data.user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch TikTok user profile');
    }
  }

  async refreshTikTokToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const clientKey = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    const clientSecret = this.configService.get<string>('TIKTOK_CLIENT_SECRET');

    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        {
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to refresh TikTok token');
    }
  }
}
