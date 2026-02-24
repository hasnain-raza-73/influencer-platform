import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, IsEnum, IsArray } from 'class-validator';
import { ProductStatus } from '../product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  @IsOptional()
  image_url?: string;

  @IsArray()
  @IsOptional()
  image_urls?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  commission_rate?: number;

  @IsUrl()
  @IsNotEmpty()
  product_url: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
