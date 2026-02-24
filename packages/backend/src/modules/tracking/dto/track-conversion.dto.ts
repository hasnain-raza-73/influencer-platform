import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class TrackConversionDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP'])
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
