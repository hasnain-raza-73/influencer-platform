import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum BrandIntegrationType {
  PIXEL = 'PIXEL',
  WEBHOOK = 'WEBHOOK',
  API = 'API',
}

export enum BrandStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.1 })
  default_commission_rate: number;

  @Column({ unique: true })
  api_key: string;

  @Column({ unique: true })
  pixel_id: string;

  @Column({
    type: 'enum',
    enum: BrandIntegrationType,
    default: BrandIntegrationType.PIXEL,
  })
  integration_type: BrandIntegrationType;

  @Column({
    type: 'enum',
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
  })
  status: BrandStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, (user) => user.brand)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
