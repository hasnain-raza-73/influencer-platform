import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Conversion, ConversionStatus } from '../tracking/entities/conversion.entity';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutFilterDto } from './dto/payout-filter.dto';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
  ) {}

  // Create a payout request (Influencer)
  async create(influencerId: string, createPayoutDto: CreatePayoutDto): Promise<Payout> {
    // Validate that influencer has enough approved commission to withdraw
    const approvedCommission = await this.getAvailableBalance(influencerId);

    if (createPayoutDto.amount > approvedCommission) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${approvedCommission}, Requested: ${createPayoutDto.amount}`,
      );
    }

    // Get approved conversions to include in payout
    let conversionsToInclude: Conversion[] = [];

    if (createPayoutDto.conversion_ids && createPayoutDto.conversion_ids.length > 0) {
      // Use specific conversions if provided
      conversionsToInclude = await this.conversionRepository.find({
        where: {
          id: In(createPayoutDto.conversion_ids),
          influencer_id: influencerId,
          status: ConversionStatus.APPROVED,
        },
      });

      const totalAmount = conversionsToInclude.reduce(
        (sum, c) => sum + Number(c.commission_amount),
        0,
      );

      if (Math.abs(totalAmount - createPayoutDto.amount) > 0.01) {
        throw new BadRequestException('Payout amount does not match selected conversions');
      }
    } else {
      // Auto-select approved conversions up to the requested amount
      conversionsToInclude = await this.selectConversionsForPayout(
        influencerId,
        createPayoutDto.amount,
      );
    }

    if (conversionsToInclude.length === 0) {
      throw new BadRequestException('No approved conversions available for payout');
    }

    const payout = this.payoutRepository.create({
      influencer_id: influencerId,
      amount: createPayoutDto.amount,
      currency: createPayoutDto.currency || 'USD',
      payout_method: createPayoutDto.payout_method,
      payment_details: createPayoutDto.payment_details,
      conversion_ids: conversionsToInclude.map((c) => c.id),
      notes: createPayoutDto.notes,
      status: PayoutStatus.PENDING,
      requested_at: new Date(),
    });

    const savedPayout = await this.payoutRepository.save(payout);

    // Mark conversions as paid
    await this.conversionRepository.update(
      { id: In(conversionsToInclude.map((c) => c.id)) },
      { status: ConversionStatus.PAID },
    );

    return savedPayout;
  }

  // Get available balance for influencer
  async getAvailableBalance(influencerId: string): Promise<number> {
    const approvedConversions = await this.conversionRepository.find({
      where: {
        influencer_id: influencerId,
        status: ConversionStatus.APPROVED,
      },
    });

    return approvedConversions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
  }

  // Select conversions for payout
  private async selectConversionsForPayout(
    influencerId: string,
    amount: number,
  ): Promise<Conversion[]> {
    const approvedConversions = await this.conversionRepository.find({
      where: {
        influencer_id: influencerId,
        status: ConversionStatus.APPROVED,
      },
      order: {
        converted_at: 'ASC', // Oldest first
      },
    });

    const selected: Conversion[] = [];
    let currentAmount = 0;

    for (const conversion of approvedConversions) {
      if (currentAmount >= amount) break;

      selected.push(conversion);
      currentAmount += Number(conversion.commission_amount);
    }

    if (currentAmount < amount) {
      throw new BadRequestException(
        `Insufficient approved conversions. Available: ${currentAmount}, Requested: ${amount}`,
      );
    }

    return selected;
  }

  // Get all payouts for an influencer
  async findAllForInfluencer(influencerId: string, filter?: PayoutFilterDto): Promise<Payout[]> {
    const queryBuilder = this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.influencer_id = :influencerId', { influencerId })
      .leftJoinAndSelect('payout.influencer', 'influencer')
      .leftJoinAndSelect('influencer.user', 'user');

    if (filter?.status) {
      queryBuilder.andWhere('payout.status = :status', { status: filter.status });
    }

    if (filter?.start_date && filter?.end_date) {
      queryBuilder.andWhere('payout.created_at BETWEEN :start AND :end', {
        start: new Date(filter.start_date),
        end: new Date(filter.end_date),
      });
    }

    queryBuilder.orderBy('payout.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  // Get all payouts (Admin view)
  async findAll(filter?: PayoutFilterDto): Promise<Payout[]> {
    const queryBuilder = this.payoutRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.influencer', 'influencer')
      .leftJoinAndSelect('influencer.user', 'user');

    if (filter?.status) {
      queryBuilder.andWhere('payout.status = :status', { status: filter.status });
    }

    if (filter?.start_date && filter?.end_date) {
      queryBuilder.andWhere('payout.created_at BETWEEN :start AND :end', {
        start: new Date(filter.start_date),
        end: new Date(filter.end_date),
      });
    }

    queryBuilder.orderBy('payout.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  // Get a single payout
  async findOne(id: string, influencerId?: string): Promise<Payout> {
    const query: any = { id };

    if (influencerId) {
      query.influencer_id = influencerId;
    }

    const payout = await this.payoutRepository.findOne({
      where: query,
      relations: ['influencer', 'influencer.user'],
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  // Update payout status (Admin/System)
  async update(id: string, updatePayoutDto: UpdatePayoutDto): Promise<Payout> {
    const payout = await this.findOne(id);

    // Validate status transitions
    if (updatePayoutDto.status) {
      this.validateStatusTransition(payout.status, updatePayoutDto.status);
    }

    Object.assign(payout, updatePayoutDto);

    // Update timestamps based on status
    if (updatePayoutDto.status === PayoutStatus.PROCESSING && !payout.processed_at) {
      payout.processed_at = new Date();
    }

    if (updatePayoutDto.status === PayoutStatus.COMPLETED && !payout.completed_at) {
      payout.completed_at = new Date();
    }

    if (
      updatePayoutDto.status === PayoutStatus.CANCELLED ||
      updatePayoutDto.status === PayoutStatus.FAILED
    ) {
      // Revert conversions back to approved
      if (payout.conversion_ids && payout.conversion_ids.length > 0) {
        await this.conversionRepository.update(
          { id: In(payout.conversion_ids) },
          { status: ConversionStatus.APPROVED },
        );
      }
    }

    return this.payoutRepository.save(payout);
  }

  // Validate status transitions
  private validateStatusTransition(currentStatus: PayoutStatus, newStatus: PayoutStatus): void {
    const validTransitions: Record<PayoutStatus, PayoutStatus[]> = {
      [PayoutStatus.PENDING]: [
        PayoutStatus.PROCESSING,
        PayoutStatus.CANCELLED,
        PayoutStatus.FAILED,
      ],
      [PayoutStatus.PROCESSING]: [PayoutStatus.COMPLETED, PayoutStatus.FAILED],
      [PayoutStatus.COMPLETED]: [],
      [PayoutStatus.FAILED]: [PayoutStatus.PENDING],
      [PayoutStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  // Cancel payout (Influencer - only if pending)
  async cancel(id: string, influencerId: string): Promise<Payout> {
    const payout = await this.findOne(id, influencerId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be cancelled');
    }

    return this.update(id, { status: PayoutStatus.CANCELLED });
  }

  // Get payout statistics for influencer
  async getInfluencerStats(influencerId: string): Promise<any> {
    const payouts = await this.findAllForInfluencer(influencerId);

    const stats = {
      total_payouts: payouts.length,
      total_amount: 0,
      pending_amount: 0,
      processing_amount: 0,
      completed_amount: 0,
      failed_amount: 0,
      available_balance: await this.getAvailableBalance(influencerId),
    };

    for (const payout of payouts) {
      const amount = Number(payout.amount);
      stats.total_amount += amount;

      switch (payout.status) {
        case PayoutStatus.PENDING:
          stats.pending_amount += amount;
          break;
        case PayoutStatus.PROCESSING:
          stats.processing_amount += amount;
          break;
        case PayoutStatus.COMPLETED:
          stats.completed_amount += amount;
          break;
        case PayoutStatus.FAILED:
          stats.failed_amount += amount;
          break;
      }
    }

    return stats;
  }

  // Process payout (Admin/System)
  async process(id: string, transactionId?: string): Promise<Payout> {
    const payout = await this.findOne(id);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be processed');
    }

    return this.update(id, {
      status: PayoutStatus.PROCESSING,
      transaction_id: transactionId,
    });
  }

  // Complete payout (Admin/System)
  async complete(id: string, transactionId?: string): Promise<Payout> {
    const payout = await this.findOne(id);

    if (payout.status !== PayoutStatus.PROCESSING) {
      throw new BadRequestException('Only processing payouts can be completed');
    }

    return this.update(id, {
      status: PayoutStatus.COMPLETED,
      transaction_id: transactionId || payout.transaction_id,
    });
  }

  // Fail payout (Admin/System)
  async fail(id: string, failureReason: string): Promise<Payout> {
    return this.update(id, {
      status: PayoutStatus.FAILED,
      failure_reason: failureReason,
    });
  }
}
