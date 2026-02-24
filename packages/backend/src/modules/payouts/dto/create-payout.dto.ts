import { IsNumber, IsEnum, IsOptional, IsObject, IsArray, IsString, Min } from 'class-validator';
import { PayoutMethod } from '../entities/payout.entity';

export class CreatePayoutDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PayoutMethod)
  payout_method: PayoutMethod;

  @IsObject()
  @IsOptional()
  payment_details?: {
    account_holder?: string;
    account_number?: string;
    bank_name?: string;
    routing_number?: string;
    paypal_email?: string;
    [key: string]: any;
  };

  @IsArray()
  @IsOptional()
  conversion_ids?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
