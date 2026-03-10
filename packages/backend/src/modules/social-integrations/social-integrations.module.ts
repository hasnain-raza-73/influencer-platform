import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialIntegrationsController } from './social-integrations.controller';
import { SocialIntegrationsService } from './social-integrations.service';
import { SocialAccount } from './entities/social-account.entity';
import { SocialMetrics } from './entities/social-metrics.entity';
import { SocialAudienceInsights } from './entities/social-audience-insights.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SocialAccount,
      SocialMetrics,
      SocialAudienceInsights,
    ]),
  ],
  controllers: [SocialIntegrationsController],
  providers: [SocialIntegrationsService],
  exports: [SocialIntegrationsService],
})
export class SocialIntegrationsModule {}
