import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Influencer dashboard
  @Get('influencer/dashboard')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getInfluencerDashboard(@CurrentUser() user: User, @Query() filter: AnalyticsFilterDto) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const dashboard = await this.analyticsService.getInfluencerDashboard(user.influencer.id, filter);

    return {
      success: true,
      data: dashboard,
    };
  }

  // Brand dashboard
  @Get('brand/dashboard')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async getBrandDashboard(@CurrentUser() user: User, @Query() filter: AnalyticsFilterDto) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const dashboard = await this.analyticsService.getBrandDashboard(user.brand.id, filter);

    return {
      success: true,
      data: dashboard,
    };
  }

  // Get influencer earnings summary
  @Get('influencer/earnings')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getInfluencerEarnings(@CurrentUser() user: User, @Query() filter: AnalyticsFilterDto) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const dashboard = await this.analyticsService.getInfluencerDashboard(user.influencer.id, filter);

    return {
      success: true,
      data: {
        total_commission: dashboard.total_commission,
        pending_commission: dashboard.pending_commission,
        approved_commission: dashboard.approved_commission,
        paid_commission: dashboard.paid_commission,
        conversion_rate: dashboard.conversion_rate,
      },
    };
  }

  // Get brand ROI summary
  @Get('brand/roi')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async getBrandROI(@CurrentUser() user: User, @Query() filter: AnalyticsFilterDto) {
    if (!user.brand) {
      throw new Error('Brand profile not found');
    }

    const dashboard = await this.analyticsService.getBrandDashboard(user.brand.id, filter);

    const roi = dashboard.total_revenue > 0 ? (dashboard.total_revenue / dashboard.total_commission_paid) * 100 : 0;

    return {
      success: true,
      data: {
        total_revenue: dashboard.total_revenue,
        total_commission_paid: dashboard.total_commission_paid,
        roi: roi,
        conversion_rate: dashboard.conversion_rate,
        average_order_value: dashboard.average_order_value,
      },
    };
  }
}
