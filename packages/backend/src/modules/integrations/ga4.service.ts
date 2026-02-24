import { Injectable, Logger } from '@nestjs/common';

export interface GA4ConversionData {
  conversionId: string;
  orderId: string;
  amount: number;
  currency: string;
  productId: string;
  trackingLinkId: string;
}

@Injectable()
export class GA4Service {
  private readonly logger = new Logger(GA4Service.name);
  private readonly BASE_URL = 'https://www.google-analytics.com';

  async sendPurchaseEvent(
    measurementId: string,
    apiSecret: string,
    data: GA4ConversionData,
  ): Promise<boolean> {
    const payload = {
      client_id: data.trackingLinkId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: data.orderId,
            value: data.amount,
            currency: data.currency || 'USD',
            items: [
              {
                item_id: data.productId,
                price: data.amount,
                quantity: 1,
              },
            ],
            engagement_time_msec: 1,
          },
        },
      ],
    };

    try {
      const url = `${this.BASE_URL}/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // GA4 Measurement Protocol returns 204 No Content on success
      if (response.status === 204 || response.ok) {
        this.logger.log(`GA4 purchase event sent for order ${data.orderId}`);
        return true;
      }

      this.logger.error(`GA4 error: HTTP ${response.status}`);
      return false;
    } catch (err) {
      this.logger.error(`GA4 request failed: ${err.message}`);
      return false;
    }
  }

  async sendTestEvent(
    measurementId: string,
    apiSecret: string,
  ): Promise<{ success: boolean; message: string }> {
    // Use the validation endpoint to verify credentials
    const payload = {
      client_id: `test_${Date.now()}`,
      events: [
        {
          name: 'page_view',
          params: {
            page_title: 'Integration Test',
            engagement_time_msec: 1,
          },
        },
      ],
    };

    try {
      // Use debug endpoint to validate
      const debugUrl = `${this.BASE_URL}/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
      const response = await fetch(debugUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as any;

      if (!response.ok) {
        return {
          success: false,
          message: 'Could not reach Google Analytics. Check your Measurement ID and API secret.',
        };
      }

      // Check for validation messages
      const validationMessages = result.validationMessages || [];
      if (validationMessages.length > 0) {
        const errors = validationMessages.map((m: any) => m.description).join('; ');
        return {
          success: false,
          message: `GA4 validation error: ${errors}`,
        };
      }

      return {
        success: true,
        message: 'Connection verified. Your GA4 Measurement ID and API secret are valid.',
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error: ${err.message}`,
      };
    }
  }
}
