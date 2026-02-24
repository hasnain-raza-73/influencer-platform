import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, Min, Max } from 'class-validator';
import { CampaignStatus } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fixed_commission?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  max_conversions?: number;

  @IsArray()
  @IsOptional()
  target_product_ids?: string[];

  @IsArray()
  @IsOptional()
  target_influencer_ids?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  min_followers?: number;

  @IsString()
  @IsOptional()
  requirements?: string;
}
