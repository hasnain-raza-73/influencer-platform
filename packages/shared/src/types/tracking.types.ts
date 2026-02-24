export enum ConversionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface TrackingLink {
  id: string;
  influencer_id: string;
  product_id: string;
  unique_code: string;
  clicks: number;
  conversions: number;
  total_sales: number;
  created_at: Date;
}

export interface Conversion {
  id: string;
  order_id: string;
  amount: number;
  commission_amount: number;
  commission_rate: number;
  status: ConversionStatus;
  clicked_at: Date;
  converted_at: Date;
  approved_at?: Date;
  paid_at?: Date;
}
