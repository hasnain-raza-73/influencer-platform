import { Injectable, Logger } from '@nestjs/common';

export interface MetaConversionData {
  conversionId: string;
  orderId: string;
  amount: number;
  currency: string;
  productId: string;
  ipAddress?: string;
  userAgent?: string;
  clickedAt?: Date;
}

@Injectable()
export class MetaPixelService {
  private readonly logger = new Logger(MetaPixelService.name);
  private readonly API_VERSION = 'v19.0';
  private readonly BASE_URL = 'https://graph.facebook.com';

  async sendPurchaseEvent(
    pixelId: string,
    accessToken: string,
    data: MetaConversionData,
    testEventCode?: string,
  ): Promise<boolean> {
    const eventTime = Math.floor(Date.now() / 1000);

    const payload: any = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: data.conversionId,
          action_source: 'website',
          user_data: {
            client_ip_address: data.ipAddress || '',
            client_user_agent: data.userAgent || '',
          },
          custom_data: {
            currency: data.currency || 'USD',
            value: data.amount,
            order_id: data.orderId,
            content_ids: [data.productId],
            content_type: 'product',
          },
        },
      ],
      access_token: accessToken,
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    try {
      const url = `${this.BASE_URL}/${this.API_VERSION}/${pixelId}/events`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as any;

      if (!response.ok) {
        this.logger.error(`Meta CAPI error: ${JSON.stringify(result)}`);
        return false;
      }

      this.logger.log(`Meta CAPI success: ${result.events_received} events received`);
      return true;
    } catch (err) {
      this.logger.error(`Meta CAPI request failed: ${err.message}`);
      return false;
    }
  }

  async sendTestEvent(
    pixelId: string,
    accessToken: string,
    testEventCode: string,
  ): Promise<{ success: boolean; message: string }> {
    const payload = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_id: `test_${Date.now()}`,
          action_source: 'website',
          user_data: {},
        },
      ],
      test_event_code: testEventCode,
      access_token: accessToken,
    };

    try {
      const url = `${this.BASE_URL}/${this.API_VERSION}/${pixelId}/events`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as any;

      if (!response.ok) {
        return {
          success: false,
          message: result.error?.message || 'Meta API returned an error. Check your Pixel ID and access token.',
        };
      }

      return {
        success: true,
        message: `Connection verified. ${result.events_received || 0} test event(s) received by Meta.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error: ${err.message}`,
      };
    }
  }
}
