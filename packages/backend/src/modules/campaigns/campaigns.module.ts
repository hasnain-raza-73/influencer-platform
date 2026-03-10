import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignInvitation } from './entities/campaign-invitation.entity';
import { Influencer } from '../influencers/influencer.entity';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';
import { Click } from '../tracking/entities/click.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignInvitationsService } from './campaign-invitations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignInvitation, Influencer, TrackingLink, Click])],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignInvitationsService],
  exports: [CampaignsService, CampaignInvitationsService],
})
export class CampaignsModule {}
