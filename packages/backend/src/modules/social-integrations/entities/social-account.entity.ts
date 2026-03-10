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
import { Influencer } from '../../influencers/influencer.entity';
import { SocialMetrics } from './social-metrics.entity';
import { SocialAudienceInsights } from './social-audience-insights.entity';

export enum SocialPlatform {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TIKTOK = 'TIKTOK',
}

export enum VerificationLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  FEATURED = 'FEATURED',
}

@Entity('social_accounts')
export class SocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  influencer_id: string;

  @ManyToOne(() => Influencer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @Column({
    type: 'varchar',
    length: 20,
    enum: SocialPlatform,
  })
  platform: SocialPlatform;

  @Column({ type: 'varchar', length: 255 })
  platform_user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  platform_username: string;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    enum: VerificationLevel,
    nullable: true,
  })
  verification_level: VerificationLevel;

  @Column({ type: 'timestamp', nullable: true })
  last_synced_at: Date;

  @OneToMany(() => SocialMetrics, (metrics) => metrics.social_account)
  metrics: SocialMetrics[];

  @OneToMany(() => SocialAudienceInsights, (insights) => insights.social_account)
  audience_insights: SocialAudienceInsights[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
