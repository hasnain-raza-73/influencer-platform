import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SocialAccount } from './social-account.entity';

@Entity('social_metrics')
export class SocialMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  social_account_id: string;

  @ManyToOne(() => SocialAccount, (account) => account.metrics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'social_account_id' })
  social_account: SocialAccount;

  @Column({ type: 'int', default: 0 })
  followers_count: number;

  @Column({ type: 'int', default: 0 })
  following_count: number;

  @Column({ type: 'int', default: 0 })
  posts_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagement_rate: number;

  @Column({ type: 'int', default: 0 })
  avg_likes: number;

  @Column({ type: 'int', default: 0 })
  avg_comments: number;

  @Column({ type: 'int', default: 0 })
  avg_views: number;

  @Column({ type: 'jsonb', nullable: true })
  audience_demographics: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  synced_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
