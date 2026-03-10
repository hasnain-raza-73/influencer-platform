import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { InfluencerSearchDto } from './dto/influencer-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('influencers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post('search')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async advancedSearch(@Body() searchDto: InfluencerSearchDto) {
    const result = await this.influencersService.advancedSearch(searchDto);
    return {
      success: true,
      data: result,
    };
  }

  @Get()
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
    @Query('niche') niche?: string,
    @Query('min_followers') min_followers?: string,
    @Query('social_platform') social_platform?: string,
    @Query('min_social_followers') min_social_followers?: string,
    @Query('verified_only') verified_only?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.influencersService.findAll({
      search,
      niche,
      min_followers: min_followers ? parseInt(min_followers) : undefined,
      social_platform,
      min_social_followers: min_social_followers ? parseInt(min_social_followers) : undefined,
      verified_only: verified_only === 'true',
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const influencer = await this.influencersService.findOne(id);
    return {
      success: true,
      data: influencer,
    };
  }
}
