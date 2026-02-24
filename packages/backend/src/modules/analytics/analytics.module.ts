import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';
import { Click } from '../tracking/entities/click.entity';
import { Conversion } from '../tracking/entities/conversion.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingLink, Click, Conversion])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
