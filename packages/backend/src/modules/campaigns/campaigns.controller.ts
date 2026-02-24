import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Create a new campaign (Brand only)
  @Post()
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() createCampaignDto: CreateCampaignDto) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaign = await this.campaignsService.create(user.brand.id, createCampaignDto);

    return {
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    };
  }

  // Get all campaigns for the current brand
  @Get()
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: User, @Query() filter: CampaignFilterDto) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaigns = await this.campaignsService.findAll(user.brand.id, filter);

    return {
      success: true,
      data: campaigns,
    };
  }

  // Get active campaigns (Influencer can browse)
  @Get('active')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async findActiveCampaigns() {
    const campaigns = await this.campaignsService.findActiveCampaigns();

    return {
      success: true,
      data: campaigns,
    };
  }

  // Get a single campaign
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    let campaign;

    if (user.role === UserRole.BRAND) {
      if (!user.brand) {
        throw new Error('Brand profile not found');
      }
      campaign = await this.campaignsService.findOne(id, user.brand.id);
    } else {
      campaign = await this.campaignsService.findOne(id);
    }

    return {
      success: true,
      data: campaign,
    };
  }

  // Update a campaign (Brand only)
  @Put(':id')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaign = await this.campaignsService.update(id, user.brand.id, updateCampaignDto);

    return {
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    };
  }

  // Delete a campaign (Brand only)
  @Delete(':id')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    await this.campaignsService.remove(id, user.brand.id);

    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  }

  // Activate a campaign (Brand only)
  @Post(':id/activate')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async activate(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaign = await this.campaignsService.activate(id, user.brand.id);

    return {
      success: true,
      message: 'Campaign activated successfully',
      data: campaign,
    };
  }

  // Pause a campaign (Brand only)
  @Post(':id/pause')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async pause(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaign = await this.campaignsService.pause(id, user.brand.id);

    return {
      success: true,
      message: 'Campaign paused successfully',
      data: campaign,
    };
  }

  // End a campaign (Brand only)
  @Post(':id/end')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async end(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const campaign = await this.campaignsService.end(id, user.brand.id);

    return {
      success: true,
      message: 'Campaign ended successfully',
      data: campaign,
    };
  }

  // Get campaign statistics (Brand only)
  @Get(':id/statistics')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async getStatistics(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const statistics = await this.campaignsService.getStatistics(id, user.brand.id);

    return {
      success: true,
      data: statistics,
    };
  }

  // Check eligibility for a campaign (Influencer only)
  @Get(':id/eligibility')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async checkEligibility(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const eligibility = await this.campaignsService.checkEligibility(id, user.influencer.id);

    return {
      success: true,
      data: eligibility,
    };
  }
}
