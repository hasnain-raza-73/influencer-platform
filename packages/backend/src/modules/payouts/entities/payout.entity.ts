import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Influencer } from '../../influencers/influencer.entity';
import { Brand } from '../../brands/brand.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  WISE = 'wise',
  OTHER = 'other',
}

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  influencer_id: string;

  @ManyToOne(() => Influencer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @Column({ type: 'uuid', nullable: true })
  brand_id: string;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  // Payout details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @Column({ type: 'enum', enum: PayoutMethod })
  payout_method: PayoutMethod;

  // Payment details (encrypted/sensitive data should be handled separately)
  @Column({ type: 'jsonb', nullable: true })
  payment_details: {
    account_holder?: string;
    account_number?: string;
    bank_name?: string;
    routing_number?: string;
    paypal_email?: string;
    [key: string]: any;
  };

  // Commission IDs included in this payout
  @Column({ type: 'simple-array', nullable: true })
  conversion_ids: string[];

  // Tracking
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  requested_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id: string; // External payment processor transaction ID

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
