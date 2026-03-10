import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SocialPlatform } from '../entities/social-account.entity';

export class ConnectAccountDto {
  @IsEnum(SocialPlatform)
  @IsNotEmpty()
  platform: SocialPlatform;

  @IsString()
  @IsNotEmpty()
  platform_user_id: string;

  @IsString()
  @IsOptional()
  platform_username?: string;

  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;

  @IsString()
  @IsOptional()
  token_expires_at?: string;
}
