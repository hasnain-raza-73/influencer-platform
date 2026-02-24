import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverview() {
    const data = await this.adminService.getOverview();
    return { success: true, data };
  }

  // ── Brands ─────────────────────────────────────────────────────────────────

  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async getBrands(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getBrands({ status, search, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }

  @Get('brands/:id')
  @HttpCode(HttpStatus.OK)
  async getBrandDetail(@Param('id') id: string) {
    const data = await this.adminService.getBrandDetail(id);
    return { success: true, data };
  }

  @Patch('brands/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateBrandStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' },
  ) {
    const brand = await this.adminService.updateBrandStatus(id, body.status);
    return { success: true, data: brand };
  }

  // ── Influencers ─────────────────────────────────────────────────────────────

  @Get('influencers')
  @HttpCode(HttpStatus.OK)
  async getInfluencers(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getInfluencers({ status, search, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }

  @Get('influencers/:id')
  @HttpCode(HttpStatus.OK)
  async getInfluencerDetail(@Param('id') id: string) {
    const data = await this.adminService.getInfluencerDetail(id);
    return { success: true, data };
  }

  @Patch('influencers/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateInfluencerStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' },
  ) {
    const influencer = await this.adminService.updateInfluencerStatus(id, body.status);
    return { success: true, data: influencer };
  }

  // ── Campaigns ──────────────────────────────────────────────────────────────

  @Get('campaigns')
  @HttpCode(HttpStatus.OK)
  async getCampaigns(
    @Query('status') status?: string,
    @Query('brand_id') brand_id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getCampaigns({ status, brand_id, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }

  @Patch('campaigns/:id/close')
  @HttpCode(HttpStatus.OK)
  async closeCampaign(@Param('id') id: string) {
    const campaign = await this.adminService.closeCampaign(id);
    return { success: true, data: campaign };
  }

  // ── Products ───────────────────────────────────────────────────────────────

  @Get('products')
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Query('review_status') review_status?: string,
    @Query('brand_id') brand_id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getProducts({ review_status, brand_id, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }

  @Patch('products/:id/review')
  @HttpCode(HttpStatus.OK)
  async reviewProduct(
    @Param('id') id: string,
    @Body() body: { review_status: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED'; review_notes?: string },
  ) {
    const product = await this.adminService.reviewProduct(id, body);
    return { success: true, data: product };
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  @Get('payouts')
  @HttpCode(HttpStatus.OK)
  async getPayouts(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getPayouts({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }

  // ── Conversions ─────────────────────────────────────────────────────────────

  @Get('conversions')
  @HttpCode(HttpStatus.OK)
  async getConversions(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getConversions({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
    return { success: true, ...result };
  }
}
