import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { MetaPixelService } from './meta-pixel.service';
import { GA4Service } from './ga4.service';
import { BrandIntegration } from '../brands/brand-integration.entity';
import { Brand } from '../brands/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrandIntegration, Brand])],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, MetaPixelService, GA4Service],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
