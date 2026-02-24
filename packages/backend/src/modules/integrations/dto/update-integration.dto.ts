import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateIntegrationDto {
  // Meta Pixel (Conversions API)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  meta_pixel_id?: string;

  @IsOptional()
  @IsString()
  meta_access_token?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  meta_test_event_code?: string;

  @IsOptional()
  @IsBoolean()
  is_meta_enabled?: boolean;

  // Google Analytics 4 (Measurement Protocol)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ga4_measurement_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ga4_api_secret?: string;

  @IsOptional()
  @IsBoolean()
  is_ga4_enabled?: boolean;
}
