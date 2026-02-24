import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('brand_integrations')
export class BrandIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  brand_id: string;

  // Meta Pixel (Conversions API)
  @Column({ nullable: true, length: 30 })
  meta_pixel_id?: string;

  @Column({ type: 'text', nullable: true })
  meta_access_token?: string;

  @Column({ nullable: true, length: 50 })
  meta_test_event_code?: string;

  @Column({ default: false })
  is_meta_enabled: boolean;

  // Google Analytics 4 (Measurement Protocol)
  @Column({ nullable: true, length: 30 })
  ga4_measurement_id?: string;

  @Column({ nullable: true, length: 150 })
  ga4_api_secret?: string;

  @Column({ default: false })
  is_ga4_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}
