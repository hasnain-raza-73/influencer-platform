import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TrackingLink } from '../tracking/entities/tracking-link.entity';
import { Click } from '../tracking/entities/click.entity';
import { Conversion, ConversionStatus } from '../tracking/entities/conversion.entity';
import { AnalyticsFilterDto, DateRangePreset } from './dto/analytics-filter.dto';
import { InfluencerDashboardDto } from './dto/influencer-dashboard.dto';
import { BrandDashboardDto } from './dto/brand-dashboard.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
    @InjectRepository(Click)
    private readonly clickRepository: Repository<Click>,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
  ) {}

  // Get date range from filter
  private getDateRange(filter: AnalyticsFilterDto): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    if (filter.preset) {
      switch (filter.preset) {
        case DateRangePreset.TODAY:
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case DateRangePreset.YESTERDAY:
          start = new Date(now.setDate(now.getDate() - 1));
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setHours(23, 59, 59, 999);
          break;
        case DateRangePreset.LAST_7_DAYS:
          start = new Date(now.setDate(now.getDate() - 7));
          start.setHours(0, 0, 0, 0);
          break;
        case DateRangePreset.LAST_30_DAYS:
          start = new Date(now.setDate(now.getDate() - 30));
          start.setHours(0, 0, 0, 0);
          break;
        case DateRangePreset.THIS_MONTH:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case DateRangePreset.LAST_MONTH:
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 0);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          start = new Date(now.setDate(now.getDate() - 30));
          start.setHours(0, 0, 0, 0);
      }
    } else if (filter.start_date && filter.end_date) {
      start = new Date(filter.start_date);
      end = new Date(filter.end_date);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default to last 30 days
      start = new Date(now.setDate(now.getDate() - 30));
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  // Get influencer dashboard data
  async getInfluencerDashboard(
    influencerId: string,
    filter: AnalyticsFilterDto,
  ): Promise<InfluencerDashboardDto> {
    const { start, end } = this.getDateRange(filter);

    // Get tracking links for influencer
    const trackingLinks = await this.trackingLinkRepository.find({
      where: { influencer_id: influencerId },
      relations: ['product'],
    });

    const trackingLinkIds = trackingLinks.map((link) => link.id);

    // Total clicks
    const totalClicks = await this.clickRepository.count({
      where: {
        tracking_link_id: Between(trackingLinkIds[0], trackingLinkIds[trackingLinkIds.length - 1]),
        clicked_at: Between(start, end),
      },
    });

    // Get conversions
    const conversions = await this.conversionRepository.find({
      where: {
        influencer_id: influencerId,
        converted_at: Between(start, end),
      },
      relations: ['product'],
    });

    const totalConversions = conversions.length;
    const totalRevenue = conversions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Commission breakdown by status
    const pendingCommission = conversions
      .filter((c) => c.status === ConversionStatus.PENDING)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    const approvedCommission = conversions
      .filter((c) => c.status === ConversionStatus.APPROVED)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    const paidCommission = conversions
      .filter((c) => c.status === ConversionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    // Top performing products
    const productPerformance = new Map<
      string,
      { name: string; clicks: number; conversions: number; revenue: number; commission: number }
    >();

    for (const link of trackingLinks) {
      const linkClicks = await this.clickRepository.count({
        where: {
          tracking_link_id: link.id,
          clicked_at: Between(start, end),
        },
      });

      const linkConversions = conversions.filter((c) => c.product_id === link.product_id);
      const linkRevenue = linkConversions.reduce((sum, c) => sum + Number(c.amount), 0);
      const linkCommission = linkConversions.reduce((sum, c) => sum + Number(c.commission_amount), 0);

      if (linkClicks > 0 || linkConversions.length > 0) {
        productPerformance.set(link.product_id, {
          name: link.product?.name || 'Unknown Product',
          clicks: linkClicks,
          conversions: linkConversions.length,
          revenue: linkRevenue,
          commission: linkCommission,
        });
      }
    }

    const topProducts = Array.from(productPerformance.entries())
      .sort((a, b) => b[1].commission - a[1].commission)
      .slice(0, 5)
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.name,
        clicks: data.clicks,
        conversions: data.conversions,
        revenue: data.revenue,
        commission: data.commission,
      }));

    // Recent clicks by day
    const recentClicks = await this.getClicksByDay(trackingLinkIds, start, end);

    // Recent conversions by day
    const recentConversions = await this.getConversionsByDay(influencerId, start, end);

    return {
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      conversion_rate: conversionRate,
      pending_commission: pendingCommission,
      approved_commission: approvedCommission,
      paid_commission: paidCommission,
      top_products: topProducts,
      recent_clicks: recentClicks,
      recent_conversions: recentConversions,
      active_links_count: trackingLinks.length,
    };
  }

  // Get brand dashboard data
  async getBrandDashboard(brandId: string, filter: AnalyticsFilterDto): Promise<BrandDashboardDto> {
    const { start, end } = this.getDateRange(filter);

    // Get conversions for brand
    const conversions = await this.conversionRepository.find({
      where: {
        brand_id: brandId,
        converted_at: Between(start, end),
      },
      relations: ['product', 'influencer', 'influencer.user'],
    });

    const totalConversions = conversions.length;
    const totalRevenue = conversions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalCommissionPaid = conversions
      .filter((c) => c.status === ConversionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // Get total clicks for brand products
    const brandTrackingLinks = await this.trackingLinkRepository
      .createQueryBuilder('tl')
      .innerJoin('tl.product', 'p')
      .where('p.brand_id = :brandId', { brandId })
      .getMany();

    const trackingLinkIds = brandTrackingLinks.map((link) => link.id);

    const totalClicks =
      trackingLinkIds.length > 0
        ? await this.clickRepository.count({
            where: {
              tracking_link_id: Between(trackingLinkIds[0], trackingLinkIds[trackingLinkIds.length - 1]),
              clicked_at: Between(start, end),
            },
          })
        : 0;

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Commission breakdown
    const pendingCommission = conversions
      .filter((c) => c.status === ConversionStatus.PENDING)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    const approvedCommission = conversions
      .filter((c) => c.status === ConversionStatus.APPROVED)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    const paidCommission = conversions
      .filter((c) => c.status === ConversionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);

    // Top performing influencers
    const influencerPerformance = new Map<
      string,
      { name: string; clicks: number; conversions: number; revenue: number; commission: number }
    >();

    for (const conversion of conversions) {
      const influencerId = conversion.influencer_id;
      const existing = influencerPerformance.get(influencerId) || {
        name: conversion.influencer?.user?.email || 'Unknown',
        clicks: 0,
        conversions: 0,
        revenue: 0,
        commission: 0,
      };

      existing.conversions += 1;
      existing.revenue += Number(conversion.amount);
      existing.commission += Number(conversion.commission_amount);

      influencerPerformance.set(influencerId, existing);
    }

    const topInfluencers = Array.from(influencerPerformance.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([influencer_id, data]) => ({
        influencer_id,
        influencer_name: data.name,
        clicks: data.clicks,
        conversions: data.conversions,
        revenue: data.revenue,
        commission: data.commission,
      }));

    // Top performing products
    const productPerformance = new Map<
      string,
      { name: string; clicks: number; conversions: number; revenue: number }
    >();

    for (const conversion of conversions) {
      const productId = conversion.product_id;
      const existing = productPerformance.get(productId) || {
        name: conversion.product?.name || 'Unknown',
        clicks: 0,
        conversions: 0,
        revenue: 0,
      };

      existing.conversions += 1;
      existing.revenue += Number(conversion.amount);

      productPerformance.set(productId, existing);
    }

    const topProducts = Array.from(productPerformance.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.name,
        clicks: data.clicks,
        conversions: data.conversions,
        revenue: data.revenue,
      }));

    // Performance over time
    const performanceChart = await this.getPerformanceChart(brandId, start, end);

    return {
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      total_revenue: totalRevenue,
      total_commission_paid: totalCommissionPaid,
      conversion_rate: conversionRate,
      average_order_value: averageOrderValue,
      pending_commission: pendingCommission,
      approved_commission: approvedCommission,
      paid_commission: paidCommission,
      top_influencers: topInfluencers,
      top_products: topProducts,
      performance_chart: performanceChart,
    };
  }

  // Helper: Get clicks grouped by day
  private async getClicksByDay(
    trackingLinkIds: string[],
    start: Date,
    end: Date,
  ): Promise<Array<{ date: string; count: number }>> {
    if (trackingLinkIds.length === 0) {
      return [];
    }

    const clicks = await this.clickRepository
      .createQueryBuilder('click')
      .select('DATE(click.clicked_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('click.tracking_link_id IN (:...ids)', { ids: trackingLinkIds })
      .andWhere('click.clicked_at BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(click.clicked_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return clicks.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));
  }

  // Helper: Get conversions grouped by day
  private async getConversionsByDay(
    influencerId: string,
    start: Date,
    end: Date,
  ): Promise<Array<{ date: string; count: number; revenue: number }>> {
    const conversions = await this.conversionRepository
      .createQueryBuilder('conversion')
      .select('DATE(conversion.converted_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(conversion.amount)', 'revenue')
      .where('conversion.influencer_id = :influencerId', { influencerId })
      .andWhere('conversion.converted_at BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(conversion.converted_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return conversions.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
      revenue: parseFloat(row.revenue),
    }));
  }

  // Helper: Get performance chart data for brand
  private async getPerformanceChart(
    brandId: string,
    start: Date,
    end: Date,
  ): Promise<Array<{ date: string; clicks: number; conversions: number; revenue: number }>> {
    const conversions = await this.conversionRepository
      .createQueryBuilder('conversion')
      .select('DATE(conversion.converted_at)', 'date')
      .addSelect('COUNT(*)', 'conversions')
      .addSelect('SUM(conversion.amount)', 'revenue')
      .where('conversion.brand_id = :brandId', { brandId })
      .andWhere('conversion.converted_at BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(conversion.converted_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return conversions.map((row) => ({
      date: row.date,
      clicks: 0, // Can be enhanced to join with clicks data
      conversions: parseInt(row.conversions, 10),
      revenue: parseFloat(row.revenue),
    }));
  }
}
