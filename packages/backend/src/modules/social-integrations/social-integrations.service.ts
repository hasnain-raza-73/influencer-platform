import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { SocialMetrics } from './entities/social-metrics.entity';
import { SocialAudienceInsights } from './entities/social-audience-insights.entity';
import { ConnectAccountDto } from './dto/connect-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { SyncMetricsDto } from './dto/sync-metrics.dto';

@Injectable()
export class SocialIntegrationsService {
  constructor(
    @InjectRepository(SocialAccount)
    private readonly socialAccountRepository: Repository<SocialAccount>,
    @InjectRepository(SocialMetrics)
    private readonly socialMetricsRepository: Repository<SocialMetrics>,
    @InjectRepository(SocialAudienceInsights)
    private readonly socialInsightsRepository: Repository<SocialAudienceInsights>,
  ) {}

  // Connect a new social account
  async connectAccount(
    influencerId: string,
    connectAccountDto: ConnectAccountDto,
  ): Promise<SocialAccount> {
    // Check if account already exists
    const existing = await this.socialAccountRepository.findOne({
      where: {
        platform: connectAccountDto.platform,
        platform_user_id: connectAccountDto.platform_user_id,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This social account is already connected to an influencer',
      );
    }

    const accountData: any = {
      influencer_id: influencerId,
      ...connectAccountDto,
    };

    if (connectAccountDto.token_expires_at) {
      accountData.token_expires_at = new Date(connectAccountDto.token_expires_at);
    }

    const account = this.socialAccountRepository.create(accountData);

    return this.socialAccountRepository.save(account) as unknown as Promise<SocialAccount>;
  }

  // Get all social accounts for an influencer
  async getAccounts(influencerId: string): Promise<SocialAccount[]> {
    return this.socialAccountRepository.find({
      where: { influencer_id: influencerId },
      relations: ['metrics', 'audience_insights'],
      order: { created_at: 'DESC' },
    });
  }

  // Get a specific social account
  async getAccount(accountId: string): Promise<SocialAccount> {
    const account = await this.socialAccountRepository.findOne({
      where: { id: accountId },
      relations: ['metrics', 'audience_insights'],
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    return account;
  }

  // Update social account
  async updateAccount(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<SocialAccount> {
    const account = await this.getAccount(accountId);

    const updateData: any = { ...updateAccountDto };

    if (updateAccountDto.token_expires_at) {
      updateData.token_expires_at = new Date(updateAccountDto.token_expires_at);
    }

    Object.assign(account, updateData);
    return this.socialAccountRepository.save(account);
  }

  // Delete social account
  async deleteAccount(accountId: string): Promise<void> {
    const account = await this.getAccount(accountId);
    await this.socialAccountRepository.remove(account);
  }

  // Sync metrics for an account
  async syncMetrics(
    accountId: string,
    syncMetricsDto: SyncMetricsDto,
  ): Promise<SocialMetrics> {
    const account = await this.getAccount(accountId);

    const metrics = this.socialMetricsRepository.create({
      social_account_id: accountId,
      ...syncMetricsDto,
      synced_at: new Date(),
    });

    const saved = await this.socialMetricsRepository.save(metrics);

    // Update last_synced_at on the account
    account.last_synced_at = new Date();
    await this.socialAccountRepository.save(account);

    return saved;
  }

  // Get latest metrics for an account
  async getLatestMetrics(accountId: string): Promise<SocialMetrics | null> {
    return this.socialMetricsRepository.findOne({
      where: { social_account_id: accountId },
      order: { synced_at: 'DESC' },
    });
  }

  // Get all metrics for an account (history)
  async getMetricsHistory(accountId: string): Promise<SocialMetrics[]> {
    return this.socialMetricsRepository.find({
      where: { social_account_id: accountId },
      order: { synced_at: 'DESC' },
    });
  }

  // Refresh account token
  async refreshToken(
    accountId: string,
    newAccessToken: string,
    newRefreshToken?: string,
    expiresAt?: string,
  ): Promise<SocialAccount> {
    const account = await this.getAccount(accountId);

    account.access_token = newAccessToken;
    if (newRefreshToken) {
      account.refresh_token = newRefreshToken;
    }
    if (expiresAt) {
      account.token_expires_at = new Date(expiresAt);
    }

    return this.socialAccountRepository.save(account);
  }

  // Verify account
  async verifyAccount(accountId: string): Promise<SocialAccount> {
    const account = await this.getAccount(accountId);
    account.is_verified = true;
    return this.socialAccountRepository.save(account);
  }

  // Admin: Get all social accounts across all influencers
  async getAllAccountsForAdmin(params: {
    platform?: string;
    is_verified?: boolean;
    verification_level?: string;
    limit?: number;
    page?: number;
  }) {
    const { platform, is_verified, verification_level, limit = 20, page = 1 } = params;

    const qb = this.socialAccountRepository
      .createQueryBuilder('social_account')
      .leftJoinAndSelect('social_account.influencer', 'influencer')
      .leftJoinAndSelect('social_account.metrics', 'metrics')
      .orderBy('social_account.created_at', 'DESC');

    if (platform) {
      qb.andWhere('social_account.platform = :platform', { platform });
    }

    if (is_verified !== undefined) {
      qb.andWhere('social_account.is_verified = :is_verified', { is_verified });
    }

    if (verification_level) {
      qb.andWhere('social_account.verification_level = :verification_level', {
        verification_level,
      });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [accounts, total] = await qb.getManyAndCount();

    return {
      accounts,
      total,
      page,
      limit,
    };
  }

  // Admin: Update verification status and level
  async updateVerificationStatus(
    accountId: string,
    updates: {
      is_verified?: boolean;
      verification_level?: string;
    },
  ): Promise<SocialAccount> {
    const account = await this.getAccount(accountId);

    if (updates.is_verified !== undefined) {
      account.is_verified = updates.is_verified;
    }

    if (updates.verification_level !== undefined) {
      account.verification_level = updates.verification_level as any;
    }

    return this.socialAccountRepository.save(account);
  }
}
