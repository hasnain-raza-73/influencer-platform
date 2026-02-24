import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Brand } from '../../brands/brand.entity';
import { Product } from '../../products/product.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  brand_id: string;

  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  // Commission settings
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commission_rate: number; // Percentage (e.g., 10.00 for 10%)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixed_commission: number; // Optional fixed commission amount

  // Date range
  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  // Budget and limits
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'integer', nullable: true })
  max_conversions: number;

  // Targeting
  @Column({ type: 'simple-array', nullable: true })
  target_product_ids: string[]; // Specific products for this campaign

  @Column({ type: 'simple-array', nullable: true })
  target_influencer_ids: string[]; // Specific influencers (optional, empty = all)

  // Requirements
  @Column({ type: 'integer', nullable: true })
  min_followers: number; // Minimum follower count for influencers

  @Column({ type: 'text', nullable: true })
  requirements: string; // Additional requirements/terms

  // Tracking
  @Column({ type: 'integer', default: 0 })
  total_clicks: number;

  @Column({ type: 'integer', default: 0 })
  total_conversions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_revenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_commission_paid: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
