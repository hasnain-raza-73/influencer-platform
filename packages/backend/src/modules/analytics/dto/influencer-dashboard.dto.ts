export class InfluencerDashboardDto {
  // Overview metrics
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  total_commission: number;
  conversion_rate: number;
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;

  // Top performing products
  top_products: Array<{
    product_id: string;
    product_name: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
  }>;

  // Recent activity
  recent_clicks: Array<{
    date: string;
    count: number;
  }>;

  recent_conversions: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;

  // Active tracking links
  active_links_count: number;
}
