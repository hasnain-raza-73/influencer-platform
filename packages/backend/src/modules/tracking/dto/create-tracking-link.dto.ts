import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTrackingLinkDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;
}
