import { InvitationStatus } from '../entities/campaign-invitation.entity';

export class CampaignInvitationResponseDto {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: InvitationStatus;
  invited_at: Date;
  responded_at?: Date;

  // Populated relationships
  campaign?: {
    id: string;
    name: string;
    commission_rate: number;
    start_date?: Date;
    end_date?: Date;
  };

  influencer?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    follower_count: number;
  };

  brand?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}
