import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from '../brands/brand.entity';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum ProductReviewStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  NEEDS_REVISION = 'NEEDS_REVISION',
  REJECTED = 'REJECTED',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  image_urls: string[];

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  commission_rate?: number;

  @Column()
  product_url: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.INACTIVE })
  status: ProductStatus;

  @Column({
    type: 'enum',
    enum: ProductReviewStatus,
    default: ProductReviewStatus.PENDING_REVIEW,
  })
  review_status: ProductReviewStatus;

  @Column({ type: 'text', nullable: true })
  review_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}
