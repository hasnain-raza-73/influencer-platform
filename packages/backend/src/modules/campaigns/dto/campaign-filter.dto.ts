import { IsOptional, IsEnum } from 'class-validator';
import { CampaignStatus } from '../entities/campaign.entity';

export class CampaignFilterDto {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  search?: string; // Search by name
}
