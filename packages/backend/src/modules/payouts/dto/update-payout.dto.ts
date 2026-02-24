import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PayoutStatus } from '../entities/payout.entity';

export class UpdatePayoutDto {
  @IsEnum(PayoutStatus)
  @IsOptional()
  status?: PayoutStatus;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  failure_reason?: string;
}
