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
import { TrackingLinkProduct } from './tracking-link-product.entity';

@Entity('tracking_links')
@Unique(['influencer_id', 'product_id'])
export class TrackingLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencer_id: string;

  @Column({ nullable: true })
  product_id?: string;

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

  @Column({ nullable: true, length: 100 })
  custom_slug?: string;

  @Column({ default: false })
  is_bio_link: boolean;

  @Column({ nullable: true, type: 'text' })
  qr_code_url?: string;

  @Column({ type: 'jsonb', default: {} })
  landing_page_config: {
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    color?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @OneToMany(
    () => TrackingLinkProduct,
    (linkProduct) => linkProduct.tracking_link,
    {
      cascade: true,
      eager: false,
    },
  )
  link_products: TrackingLinkProduct[];

  /**
   * Get the public-facing URL for this link
   * @param baseUrl The base URL (e.g., 'https://link.co')
   * @returns The full public URL
   */
  getPublicUrl(baseUrl: string): string {
    return this.custom_slug
      ? `${baseUrl}/${this.custom_slug}`
      : `${baseUrl}/${this.unique_code}`;
  }

  /**
   * Check if this is a multi-product link
   * @returns true if link has multiple products
   */
  isMultiProduct(): boolean {
    return this.link_products && this.link_products.length > 1;
  }

  /**
   * Get product IDs in display order
   * @returns Array of product IDs sorted by display_order
   */
  getProductIds(): string[] {
    if (!this.link_products || this.link_products.length === 0) {
      return this.product_id ? [this.product_id] : [];
    }
    return this.link_products
      .sort((a, b) => a.display_order - b.display_order)
      .map((lp) => lp.product_id);
  }
}
