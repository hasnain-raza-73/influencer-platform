import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class InviteInfluencersDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Must invite at least 1 influencer' })
  @ArrayMaxSize(50, { message: 'Cannot invite more than 50 influencers at once' })
  @IsUUID('4', { each: true, message: 'Each influencer ID must be a valid UUID' })
  influencer_ids: string[];
}
