import { logger } from '@utils/logger';
import { prisma } from '@services/prisma';

interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface SystemMetrics {
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

class AnalyticsService {
  private metricsBuffer: MetricData[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicFlush();
  }

  private startPeriodicFlush() {
    this.flushInterval = setInterval(() => this.flushMetrics(), 60000); // Every minute
  }

  async recordMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    this.metricsBuffer.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    // Flush if buffer is large
    if (this.metricsBuffer.length >= 1000) {
      await this.flushMetrics();
    }
  }

  async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // In a real implementation, you'd write to a time-series database
      // For now, we'll store in database
      await prisma.metric.createMany({
        data: metrics.map(m => ({
          name: m.name,
          value: m.value,
          timestamp: m.timestamp,
          tags: m.tags,
        })),
      });
    } catch (error) {
      logger.error('Failed to flush metrics', { error });
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // In a real implementation, you'd query your metrics database
    // For now, return mock data
    return {
      requestsPerMinute: 1247,
      avgResponseTime: 142,
      errorRate: 0.12,
      activeUsers: 342,
      cpuUsage: 23,
      memoryUsage: 67,
      diskUsage: 45,
    };
  }

  async getRequestMetrics(timeRange: { start: Date; end: Date }): Promise<any> {
    // Query metrics from database
    return prisma.metric.findMany({
      where: {
        name: { in: ['http_requests_total', 'http_request_duration_seconds'] },
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getErrorMetrics(timeRange: { start: Date; end: Date }): Promise<any> {
    return prisma.metric.findMany({
      where: {
        name: 'http_errors_total',
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getUserActivityMetrics(timeRange: { start: Date; end: Date }): Promise<any> {
    return prisma.metric.findMany({
      where: {
        name: { in: ['active_users', 'new_users', 'user_sessions'] },
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getBusinessMetrics(timeRange: { start: Date; end: Date }): Promise<any> {
    const [
      totalUsers,
      totalVehicles,
      totalAds,
      totalInquiries,
      totalSales,
      revenue,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.vehicle.count({ where: { createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.ad.count({ where: { createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.inquiry.count({ where: { createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.sale.count({ where: { createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: timeRange.start, lte: timeRange.end } },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: totalUsers,
      vehicles: totalVehicles,
      ads: totalAds,
      inquiries: totalInquiries,
      sales: totalSales,
      revenue: revenue._sum.amount || 0,
    };
  }

  async getDealerMetrics(dealerId: string, timeRange: { start: Date; end: Date }): Promise<any> {
    const [
      vehicles,
      ads,
      inquiries,
      sales,
      views,
      favorites,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { dealerId, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.ad.count({ where: { dealerId, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.inquiry.count({ where: { dealerId, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.sale.count({ where: { dealerId, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.vehicleView.count({ where: { vehicle: { dealerId }, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
      prisma.favorite.count({ where: { vehicle: { dealerId }, createdAt: { gte: timeRange.start, lte: timeRange.end } } }),
    ]);

    return {
      vehicles,
      ads,
      inquiries,
      sales,
      views,
      favorites,
    };
  }

  async recordEvent(event: {
    name: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    await prisma.event.create({
      data: {
        name: event.name,
        value: event.value,
        userId: event.userId,
        sessionId: event.sessionId,
        properties: event.properties,
      },
    });
  }

  async trackPageView(data: {
    url: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ip?: string;
  }): Promise<void> {
    await prisma.pageView.create({
      data: {
        url: data.url,
        referrer: data.referrer,
        userId: data.userId,
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        ip: data.ip,
      },
    });
  }

  async trackConversion(data: {
    event: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    await prisma.conversion.create({
      data: {
        event: data.event,
        value: data.value,
        userId: data.userId,
        sessionId: data.sessionId,
        properties: data.properties,
      },
    });
  }

  async getFunnelMetrics(steps: string[], timeRange: { start: Date; end: Date }): Promise<any> {
    const results = [];
    for (const step of steps) {
      const count = await prisma.event.count({
        where: {
          name: step,
          createdAt: { gte: timeRange.start, lte: timeRange.end },
        },
      });
      results.push({ step, count });
    }
    return results;
  }

  async getRetentionMetrics(cohortDate: Date, periods: number): Promise<any> {
    // Cohort analysis - users who signed up on cohortDate
    // and their activity in subsequent periods
    return {
      cohort: cohortDate,
      periods: Array.from({ length: periods }, (_, i) => ({
        period: i,
        retained: 0,
        total: 0,
        rate: 0,
      })),
    };
  }

  async exportMetrics(format: 'json' | 'csv', timeRange: { start: Date; end: Date }): Promise<string> {
    const metrics = await prisma.metric.findMany({
      where: {
        timestamp: { gte: timeRange.start, lte: timeRange.end },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (format === 'csv') {
      const headers = ['name', 'value', 'timestamp', 'tags'];
      const rows = metrics.map(m => [
        m.name,
        m.value.toString(),
        m.timestamp.toISOString(),
        JSON.stringify(m.tags),
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return JSON.stringify(metrics, null, 2);
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushMetrics();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;