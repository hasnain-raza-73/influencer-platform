import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationLevel } from '../entities/social-account.entity';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  platform_username?: string;

  @IsString()
  @IsOptional()
  access_token?: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;

  @IsString()
  @IsOptional()
  token_expires_at?: string;

  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @IsEnum(VerificationLevel)
  @IsOptional()
  verification_level?: VerificationLevel;
}
