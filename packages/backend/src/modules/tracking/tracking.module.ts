import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingLink } from './entities/tracking-link.entity';
import { TrackingLinkProduct } from './entities/tracking-link-product.entity';
import { Click } from './entities/click.entity';
import { Conversion } from './entities/conversion.entity';
import { Product } from '../products/product.entity';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { SlugService } from './slug.service';
import { QRCodeService } from './qrcode.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackingLink,
      TrackingLinkProduct,
      Click,
      Conversion,
      Product,
    ]),
    IntegrationsModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService, SlugService, QRCodeService],
  exports: [TypeOrmModule, TrackingService, SlugService, QRCodeService],
})
export class TrackingModule {}
