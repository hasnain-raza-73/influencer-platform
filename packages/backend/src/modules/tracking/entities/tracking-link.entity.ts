import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Influencer } from '../../influencers/influencer.entity';
import { Product } from '../../products/product.entity';

@Entity('tracking_links')
@Unique(['influencer_id', 'product_id'])
export class TrackingLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencer_id: string;

  @Column()
  product_id: string;

  @Column({ unique: true, length: 32 })
  unique_code: string;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ nullable: true })
  last_clicked_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
