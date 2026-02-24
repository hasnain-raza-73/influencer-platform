import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TrackingLink } from './tracking-link.entity';
import { Influencer } from '../../influencers/influencer.entity';
import { Brand } from '../../brands/brand.entity';
import { Product } from '../../products/product.entity';

export enum ConversionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

@Entity('conversions')
@Unique(['brand_id', 'order_id'])
export class Conversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_link_id: string;

  @Column()
  influencer_id: string;

  @Column()
  brand_id: string;

  @Column()
  product_id: string;

  @Column()
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @Column({ type: 'enum', enum: ConversionStatus, default: ConversionStatus.PENDING })
  status: ConversionStatus;

  @Column({ default: 0 })
  fraud_score: number;

  @Column({ type: 'text', nullable: true })
  fraud_notes?: string;

  @Column()
  clicked_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  converted_at: Date;

  @Column({ nullable: true })
  approved_at?: Date;

  @Column({ nullable: true })
  paid_at?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TrackingLink)
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
