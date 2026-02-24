import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Influencer } from './influencer.entity';

@Injectable()
export class InfluencersService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
  ) {}

  async findAll(params: {
    search?: string;
    niche?: string;
    min_followers?: number;
    limit?: number;
    page?: number;
  }) {
    const {
      search,
      niche,
      min_followers,
      limit = 20,
      page = 1,
    } = params;

    const qb = this.influencerRepository
      .createQueryBuilder('influencer')
      .where('influencer.status = :status', { status: 'ACTIVE' });

    if (search) {
      qb.andWhere(
        '(influencer.display_name ILIKE :search OR influencer.bio ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (niche) {
      qb.andWhere(':niche = ANY(influencer.niche)', { niche });
    }

    if (min_followers) {
      qb.andWhere('influencer.follower_count >= :min_followers', { min_followers });
    }

    qb.orderBy('influencer.total_sales', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [influencers, total] = await qb.getManyAndCount();

    return {
      influencers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    return this.influencerRepository.findOne({
      where: { id },
    });
  }
}
