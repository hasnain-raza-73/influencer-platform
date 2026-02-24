import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PayoutStatus } from '../entities/payout.entity';

export class PayoutFilterDto {
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
