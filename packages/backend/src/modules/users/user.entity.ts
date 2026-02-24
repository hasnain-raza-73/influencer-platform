import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Influencer } from '../influencers/influencer.entity';

export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true })
  oauth_provider?: string;

  @Column({ nullable: true })
  oauth_id?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Brand, (brand) => brand.user)
  brand?: Brand;

  @OneToOne(() => Influencer, (influencer) => influencer.user)
  influencer?: Influencer;
}
