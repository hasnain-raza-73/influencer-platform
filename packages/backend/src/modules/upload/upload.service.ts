import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'influencer-platform/products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          max_bytes: 5 * 1024 * 1024, // 5MB
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
