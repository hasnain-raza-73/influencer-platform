import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

export interface QRCodeOptions {
  /** Size of QR code in pixels (default: 300) */
  size?: number;
  /** Error correction level (default: 'M') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Foreground color (default: '#000000') */
  color?: string;
  /** Background color (default: '#FFFFFF') */
  backgroundColor?: string;
  /** Output format (default: 'data-url') */
  format?: 'data-url' | 'buffer';
}

export interface QRCodeResult {
  /** Data URL or buffer depending on format */
  data: string | Buffer;
  /** Format of the result */
  format: 'data-url' | 'buffer';
  /** URL that was encoded */
  url: string;
}

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);

  /**
   * Generate a QR code for a URL
   * @param url The URL to encode
   * @param options QR code generation options
   * @returns QR code result with data URL or buffer
   */
  async generateQRCode(
    url: string,
    options: QRCodeOptions = {},
  ): Promise<QRCodeResult> {
    const {
      size = 300,
      errorCorrectionLevel = 'M',
      color = '#000000',
      backgroundColor = '#FFFFFF',
      format = 'data-url',
    } = options;

    try {
      let data: string | Buffer;

      if (format === 'buffer') {
        const bufferOptions: QRCode.QRCodeToBufferOptions = {
          errorCorrectionLevel,
          type: 'png',
          width: size,
          color: {
            dark: color,
            light: backgroundColor,
          },
          margin: 2,
        };
        data = await QRCode.toBuffer(url, bufferOptions);
      } else {
        const dataUrlOptions: QRCode.QRCodeToDataURLOptions = {
          errorCorrectionLevel,
          type: 'image/png',
          width: size,
          color: {
            dark: color,
            light: backgroundColor,
          },
          margin: 2,
        };
        data = await QRCode.toDataURL(url, dataUrlOptions);
      }

      this.logger.log(`Generated QR code for URL: ${url}`);

      return {
        data,
        format,
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to generate QR code for URL: ${url}`, error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate a QR code as a data URL (base64 encoded PNG)
   * Convenient method for returning QR codes directly to frontend
   */
  async generateDataURL(url: string, options?: QRCodeOptions): Promise<string> {
    const result = await this.generateQRCode(url, {
      ...options,
      format: 'data-url',
    });
    return result.data as string;
  }

  /**
   * Generate a QR code as a buffer
   * Useful for saving to file system or uploading to cloud storage
   */
  async generateBuffer(url: string, options?: QRCodeOptions): Promise<Buffer> {
    const result = await this.generateQRCode(url, {
      ...options,
      format: 'buffer',
    });
    return result.data as Buffer;
  }

  /**
   * Validate URL format before generating QR code
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate QR code with brand customization
   * @param url The URL to encode
   * @param brandColor Brand's primary color (hex)
   * @returns QR code data URL
   */
  async generateBrandedQRCode(
    url: string,
    brandColor?: string,
  ): Promise<string> {
    const options: QRCodeOptions = {
      size: 400,
      errorCorrectionLevel: 'H', // Higher error correction for branding
      color: brandColor || '#000000',
      backgroundColor: '#FFFFFF',
      format: 'data-url',
    };

    return this.generateDataURL(url, options);
  }

  /**
   * Generate QR code for link-in-bio with custom styling
   */
  async generateBioLinkQRCode(url: string): Promise<string> {
    const options: QRCodeOptions = {
      size: 500,
      errorCorrectionLevel: 'H',
      color: '#1a1a1a',
      backgroundColor: '#ffffff',
      format: 'data-url',
    };

    return this.generateDataURL(url, options);
  }
}
