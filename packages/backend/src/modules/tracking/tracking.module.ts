import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingLink } from './entities/tracking-link.entity';
import { Click } from './entities/click.entity';
import { Conversion } from './entities/conversion.entity';
import { Product } from '../products/product.entity';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingLink, Click, Conversion, Product]),
    IntegrationsModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TypeOrmModule, TrackingService],
})
export class TrackingModule {}
