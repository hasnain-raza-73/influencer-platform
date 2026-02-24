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

export enum InfluencerStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('influencers')
export class Influencer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  display_name: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  social_instagram?: string;

  @Column({ nullable: true })
  social_tiktok?: string;

  @Column({ nullable: true })
  social_youtube?: string;

  @Column({ nullable: true })
  social_twitter?: string;

  @Column({ default: 0 })
  follower_count: number;

  @Column({ type: 'varchar', array: true, default: '{}' })
  niche: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_earnings: number;

  @Column({ default: 0 })
  total_clicks: number;

  @Column({ default: 0 })
  total_conversions: number;

  @Column({
    type: 'enum',
    enum: InfluencerStatus,
    default: InfluencerStatus.ACTIVE,
  })
  status: InfluencerStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, (user) => user.influencer)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
