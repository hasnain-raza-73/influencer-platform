import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum VerificationLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  FEATURED = 'FEATURED',
}

export class AdminUpdateVerificationDto {
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @IsEnum(VerificationLevel)
  @IsOptional()
  verification_level?: VerificationLevel;
}
