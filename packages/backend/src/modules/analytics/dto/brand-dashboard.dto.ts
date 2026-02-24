export class BrandDashboardDto {
  // Overview metrics
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  total_commission_paid: number;
  conversion_rate: number;
  average_order_value: number;

  // Commission breakdown
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;

  // Top performing influencers
  top_influencers: Array<{
    influencer_id: string;
    influencer_name: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
  }>;

  // Top performing products
  top_products: Array<{
    product_id: string;
    product_name: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;

  // Performance over time
  performance_chart: Array<{
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}
