export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Brand {
  id: string;
  user_id: string;
  company_name: string;
  website?: string;
  logo_url?: string;
  default_commission_rate: number;
}

export interface Influencer {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  follower_count: number;
  niche: string[];
  rating: number;
  total_sales: number;
  total_earnings: number;
}
