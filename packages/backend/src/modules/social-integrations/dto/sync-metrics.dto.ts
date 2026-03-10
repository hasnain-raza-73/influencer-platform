import { IsInt, IsNumber, IsObject, IsOptional } from 'class-validator';

export class SyncMetricsDto {
  @IsInt()
  followers_count: number;

  @IsInt()
  @IsOptional()
  following_count?: number;

  @IsInt()
  @IsOptional()
  posts_count?: number;

  @IsNumber()
  @IsOptional()
  engagement_rate?: number;

  @IsInt()
  @IsOptional()
  avg_likes?: number;

  @IsInt()
  @IsOptional()
  avg_comments?: number;

  @IsInt()
  @IsOptional()
  avg_views?: number;

  @IsObject()
  @IsOptional()
  audience_demographics?: any;
}
