import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsHexColor,
} from 'class-validator';

export enum QRCodeSize {
  SMALL = 200,
  MEDIUM = 300,
  LARGE = 500,
  XLARGE = 800,
}

export enum QRErrorCorrectionLevel {
  LOW = 'L',
  MEDIUM = 'M',
  QUARTILE = 'Q',
  HIGH = 'H',
}

export class GenerateQRCodeDto {
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(1000)
  size?: number;

  @IsOptional()
  @IsEnum(QRErrorCorrectionLevel)
  errorCorrectionLevel?: QRErrorCorrectionLevel;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;
}

export class QRCodeResponseDto {
  data: string;
  url: string;
  format: string;
}
