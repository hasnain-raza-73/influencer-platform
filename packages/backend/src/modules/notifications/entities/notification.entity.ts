import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  CAMPAIGN_INVITE = 'CAMPAIGN_INVITE',
  CAMPAIGN_ACCEPTED = 'CAMPAIGN_ACCEPTED',
  CAMPAIGN_DECLINED = 'CAMPAIGN_DECLINED',
  NEW_CONVERSION = 'NEW_CONVERSION',
  PAYOUT_REQUESTED = 'PAYOUT_REQUESTED',
  PAYOUT_APPROVED = 'PAYOUT_APPROVED',
  PAYOUT_PAID = 'PAYOUT_PAID',
  PRODUCT_APPROVED = 'PRODUCT_APPROVED',
  PRODUCT_REJECTED = 'PRODUCT_REJECTED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 20 })
  user_type: 'BRAND' | 'INFLUENCER' | 'ADMIN';

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
