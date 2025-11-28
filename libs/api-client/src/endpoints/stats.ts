import { BaseApi } from './base';
import type { RequestOptions } from '../client';
import type { DashboardMetrics } from '@cp/types';

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface StatsFilters {
  trial_id?: string;
  site_id?: string;
  date_from?: string;
  date_to?: string;
}

export class StatsApi extends BaseApi {
  async getDashboard(filters?: StatsFilters, options?: RequestOptions): Promise<DashboardMetrics> {
    return this.client.get('/api/stats', filters, options);
  }

  async getAssetTimeline(filters?: StatsFilters, options?: RequestOptions): Promise<TimeSeriesDataPoint[]> {
    return this.client.get('/api/stats/assets-timeline', filters, options);
  }

  async getReviewTimeline(filters?: StatsFilters, options?: RequestOptions): Promise<TimeSeriesDataPoint[]> {
    return this.client.get('/api/stats/reviews-timeline', filters, options);
  }
}
