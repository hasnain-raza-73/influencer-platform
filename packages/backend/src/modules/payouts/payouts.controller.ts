import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutFilterDto } from './dto/payout-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  // Create a payout request (Influencer)
  @Post()
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() createPayoutDto: CreatePayoutDto) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const payout = await this.payoutsService.create(user.influencer.id, createPayoutDto);

    return {
      success: true,
      message: 'Payout request created successfully',
      data: payout,
    };
  }

  // Get influencer's payouts
  @Get('my-payouts')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getMyPayouts(@CurrentUser() user: User, @Query() filter: PayoutFilterDto) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const payouts = await this.payoutsService.findAllForInfluencer(user.influencer.id, filter);

    return {
      success: true,
      data: payouts,
    };
  }

  // Get influencer's payout statistics
  @Get('my-stats')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getMyStats(@CurrentUser() user: User) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const stats = await this.payoutsService.getInfluencerStats(user.influencer.id);

    return {
      success: true,
      data: stats,
    };
  }

  // Get available balance (Influencer)
  @Get('available-balance')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async getAvailableBalance(@CurrentUser() user: User) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const balance = await this.payoutsService.getAvailableBalance(user.influencer.id);

    return {
      success: true,
      data: {
        available_balance: balance,
        currency: 'USD',
      },
    };
  }

  // Get all payouts (Brand/Admin)
  @Get('admin/all')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async getAllPayouts(@Query() filter: PayoutFilterDto) {
    const payouts = await this.payoutsService.findAll(filter);

    return {
      success: true,
      data: payouts,
    };
  }

  // Get a single payout
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    let payout;

    if (user.role === UserRole.INFLUENCER) {
      if (!user.influencer) {
        throw new Error('Influencer profile not found');
      }
      payout = await this.payoutsService.findOne(id, user.influencer.id);
    } else {
      payout = await this.payoutsService.findOne(id);
    }

    return {
      success: true,
      data: payout,
    };
  }

  // Cancel payout (Influencer - only if pending)
  @Post(':id/cancel')
  @Roles(UserRole.INFLUENCER)
  @HttpCode(HttpStatus.OK)
  async cancel(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.influencer) {
      throw new Error('Influencer profile not found');
    }

    const payout = await this.payoutsService.cancel(id, user.influencer.id);

    return {
      success: true,
      message: 'Payout cancelled successfully',
      data: payout,
    };
  }

  // Process payout (Brand/Admin)
  @Post(':id/process')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async process(@Param('id') id: string, @Body() body: { transaction_id?: string }) {
    const payout = await this.payoutsService.process(id, body.transaction_id);

    return {
      success: true,
      message: 'Payout processing started',
      data: payout,
    };
  }

  // Complete payout (Brand/Admin)
  @Post(':id/complete')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string, @Body() body: { transaction_id?: string }) {
    const payout = await this.payoutsService.complete(id, body.transaction_id);

    return {
      success: true,
      message: 'Payout completed successfully',
      data: payout,
    };
  }

  // Fail payout (Brand/Admin)
  @Post(':id/fail')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async fail(@Param('id') id: string, @Body() body: { failure_reason: string }) {
    const payout = await this.payoutsService.fail(id, body.failure_reason);

    return {
      success: true,
      message: 'Payout marked as failed',
      data: payout,
    };
  }

  // Update payout (Brand/Admin)
  @Put(':id')
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updatePayoutDto: UpdatePayoutDto) {
    const payout = await this.payoutsService.update(id, updatePayoutDto);

    return {
      success: true,
      message: 'Payout updated successfully',
      data: payout,
    };
  }
}
