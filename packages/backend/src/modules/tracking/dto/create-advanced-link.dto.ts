import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  Min,
  Max,
  IsEnum,
  ValidateNested,
  IsHexColor,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LandingPageTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export class LandingPageConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(LandingPageTheme)
  theme?: LandingPageTheme;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class ProductOrderDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(0)
  @Max(9)
  display_order: number;
}

export class CreateAdvancedLinkDto {
  // Required: Either single product OR multiple products
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products?: ProductOrderDto[];

  // Custom slug (optional)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  custom_slug?: string;

  // Bio link flag
  @IsOptional()
  @IsBoolean()
  is_bio_link?: boolean;

  // Generate QR code flag
  @IsOptional()
  @IsBoolean()
  generate_qr?: boolean;

  // Landing page configuration
  @IsOptional()
  @ValidateNested()
  @Type(() => LandingPageConfigDto)
  landing_page_config?: LandingPageConfigDto;
}
