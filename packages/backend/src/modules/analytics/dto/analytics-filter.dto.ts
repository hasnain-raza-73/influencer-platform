import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum DateRangePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
}

export class AnalyticsFilterDto {
  @IsOptional()
  @IsEnum(DateRangePreset)
  preset?: DateRangePreset;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
