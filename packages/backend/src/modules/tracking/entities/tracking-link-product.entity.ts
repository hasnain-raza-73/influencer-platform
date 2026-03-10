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
import { Product } from '../../products/product.entity';

/**
 * Junction table for multi-product tracking links
 * Allows one tracking link to promote 2-10 products
 */
@Entity('tracking_link_products')
@Unique(['tracking_link_id', 'product_id'])
export class TrackingLinkProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tracking_link_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'integer', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TrackingLink, (trackingLink) => trackingLink.link_products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
