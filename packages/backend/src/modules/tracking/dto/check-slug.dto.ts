import { IsString, MinLength, MaxLength } from 'class-validator';

export class CheckSlugDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  slug: string;
}

export class SlugAvailabilityResponseDto {
  available: boolean;
  suggestions?: string[];
  error?: string;
}
