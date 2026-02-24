import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Influencer } from './influencer.entity';
import { InfluencersService } from './influencers.service';
import { InfluencersController } from './influencers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Influencer])],
  controllers: [InfluencersController],
  providers: [InfluencersService],
  exports: [TypeOrmModule, InfluencersService],
})
export class InfluencersModule {}
