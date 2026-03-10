import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class InfluencerSearchDto {
  // Text search
  @IsOptional()
  @IsString()
  search?: string;

  // Niche/Category filters
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niches?: string[];

  // Location filters
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  // Language filters
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  // Follower count range
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minFollowers?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxFollowers?: number;

  // Engagement rate range (0-100)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minEngagementRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  maxEngagementRate?: number;

  // Rating filter (0-5)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  // Total sales range
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minTotalSales?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxTotalSales?: number;

  // Availability filter
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  availableForCampaigns?: boolean;

  // Campaign types interested
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignTypesInterested?: string[];

  // Featured influencers
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  // Social platform filters
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasInstagram?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasTikTok?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasYouTube?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasTwitter?: boolean;

  // Pagination
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: 'follower_count' | 'engagement_rate' | 'rating' | 'total_sales' | 'created_at' = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
