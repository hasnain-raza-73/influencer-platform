import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SocialAccount } from './social-account.entity';

export enum InsightType {
  AGE = 'AGE',
  GENDER = 'GENDER',
  LOCATION = 'LOCATION',
  INTERESTS = 'INTERESTS',
}

@Entity('social_audience_insights')
export class SocialAudienceInsights {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  social_account_id: string;

  @ManyToOne(() => SocialAccount, (account) => account.audience_insights, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'social_account_id' })
  social_account: SocialAccount;

  @Column({
    type: 'varchar',
    length: 50,
    enum: InsightType,
  })
  insight_type: InsightType;

  @Column({ type: 'jsonb', nullable: true })
  insight_data: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  synced_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
