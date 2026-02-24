import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Brand } from '../brands/brand.entity';
import { Influencer } from '../influencers/influencer.entity';
import { Product } from '../products/product.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Payout } from '../payouts/entities/payout.entity';
import { Conversion } from '../tracking/entities/conversion.entity';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Brand, Influencer, Product, Campaign, Payout, Conversion, TrackingLink]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
