import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  recipient_id: string;

  @IsString()
  @IsNotEmpty()
  recipient_type: 'BRAND' | 'INFLUENCER';

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUUID()
  @IsOptional()
  campaign_id?: string;
}
