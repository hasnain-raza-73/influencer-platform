import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TrackingLink } from './tracking-link.entity';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_link_id: string;

  @Column({ length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ length: 500, nullable: true })
  referrer?: string;

  @Column({ length: 2, nullable: true })
  country?: string;

  @Column({ length: 20, nullable: true })
  device_type?: string;

  @CreateDateColumn()
  clicked_at: Date;

  @ManyToOne(() => TrackingLink)
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;
}
