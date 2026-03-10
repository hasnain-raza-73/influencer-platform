import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SocialIntegrationsService } from './social-integrations.service';
import { ConnectAccountDto } from './dto/connect-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { SyncMetricsDto } from './dto/sync-metrics.dto';
import { AdminUpdateVerificationDto } from './dto/admin-update-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('social-integrations')
@UseGuards(JwtAuthGuard)
export class SocialIntegrationsController {
  constructor(
    private readonly socialIntegrationsService: SocialIntegrationsService,
  ) {}

  // Connect a new social account
  @Post('connect')
  async connectAccount(
    @Req() req: any,
    @Body() connectAccountDto: ConnectAccountDto,
  ) {
    const influencerId = req.user.influencer?.id;
    if (!influencerId) {
      return {
        success: false,
        message: 'Only influencers can connect social accounts',
      };
    }

    const account = await this.socialIntegrationsService.connectAccount(
      influencerId,
      connectAccountDto,
    );

    return {
      success: true,
      data: account,
      message: 'Social account connected successfully',
    };
  }

  // Get all social accounts for the logged-in influencer
  @Get('accounts')
  async getAccounts(@Req() req: any) {
    const influencerId = req.user.influencer?.id;
    if (!influencerId) {
      return {
        success: false,
        message: 'Only influencers can view social accounts',
      };
    }

    const accounts = await this.socialIntegrationsService.getAccounts(
      influencerId,
    );

    return {
      success: true,
      data: accounts,
    };
  }

  // Get a specific social account
  @Get('accounts/:id')
  async getAccount(@Param('id') accountId: string) {
    const account = await this.socialIntegrationsService.getAccount(accountId);

    return {
      success: true,
      data: account,
    };
  }

  // Update a social account
  @Patch('accounts/:id')
  async updateAccount(
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const account = await this.socialIntegrationsService.updateAccount(
      accountId,
      updateAccountDto,
    );

    return {
      success: true,
      data: account,
      message: 'Social account updated successfully',
    };
  }

  // Delete a social account
  @Delete('accounts/:id')
  async deleteAccount(@Param('id') accountId: string) {
    await this.socialIntegrationsService.deleteAccount(accountId);

    return {
      success: true,
      message: 'Social account disconnected successfully',
    };
  }

  // Sync metrics for an account
  @Post('accounts/:id/sync')
  async syncMetrics(
    @Param('id') accountId: string,
    @Body() syncMetricsDto: SyncMetricsDto,
  ) {
    const metrics = await this.socialIntegrationsService.syncMetrics(
      accountId,
      syncMetricsDto,
    );

    return {
      success: true,
      data: metrics,
      message: 'Metrics synced successfully',
    };
  }

  // Get latest metrics for an account
  @Get('accounts/:id/metrics')
  async getLatestMetrics(@Param('id') accountId: string) {
    const metrics = await this.socialIntegrationsService.getLatestMetrics(
      accountId,
    );

    return {
      success: true,
      data: metrics,
    };
  }

  // Get metrics history for an account
  @Get('accounts/:id/metrics/history')
  async getMetricsHistory(@Param('id') accountId: string) {
    const metrics = await this.socialIntegrationsService.getMetricsHistory(
      accountId,
    );

    return {
      success: true,
      data: metrics,
    };
  }

  // Refresh account token
  @Post('accounts/:id/refresh-token')
  async refreshToken(
    @Param('id') accountId: string,
    @Body() body: { access_token: string; refresh_token?: string; expires_at?: string },
  ) {
    const account = await this.socialIntegrationsService.refreshToken(
      accountId,
      body.access_token,
      body.refresh_token,
      body.expires_at,
    );

    return {
      success: true,
      data: account,
      message: 'Token refreshed successfully',
    };
  }

  // Verify account
  @Post('accounts/:id/verify')
  async verifyAccount(@Param('id') accountId: string) {
    const account = await this.socialIntegrationsService.verifyAccount(accountId);

    return {
      success: true,
      data: account,
      message: 'Account verified successfully',
    };
  }

  // Admin: Get all social accounts
  @Get('admin/accounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllAccountsForAdmin(
    @Query('platform') platform?: string,
    @Query('is_verified') is_verified?: string,
    @Query('verification_level') verification_level?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.socialIntegrationsService.getAllAccountsForAdmin({
      platform,
      is_verified: is_verified === 'true' ? true : is_verified === 'false' ? false : undefined,
      verification_level,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
    });

    return {
      success: true,
      data: result,
    };
  }

  // Admin: Update verification status
  @Patch('admin/accounts/:id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateVerificationStatus(
    @Param('id') accountId: string,
    @Body() updateDto: AdminUpdateVerificationDto,
  ) {
    const account = await this.socialIntegrationsService.updateVerificationStatus(
      accountId,
      updateDto,
    );

    return {
      success: true,
      data: account,
      message: 'Verification status updated successfully',
    };
  }
}
