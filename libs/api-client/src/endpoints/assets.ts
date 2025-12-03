import type { AssetRecord, DataViewMode, PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface AssetFilters {
    trial_id?: string;
    site_id?: string;
    processed?: boolean;
    date_from?: string;
    date_to?: string;
    search?: string;
    data_view?: DataViewMode;
}

export class AssetsApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: AssetFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<AssetRecord>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/assets', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<AssetRecord> {
        return this.client.get(`/api/assets/${id}`, undefined, options);
    }

    async getMetrics(
        filters?: AssetFilters,
        options?: RequestOptions
    ): Promise<{ total: number; processed: number; pending: number }> {
        return this.client.get('/api/assets/metrics', filters, options);
    }

    async getVideoMetrics(
        filters?: AssetFilters,
        options?: RequestOptions
    ): Promise<{
        totalDuration: number;
        avgDuration: number;
        totalSize: number;
    }> {
        return this.client.get('/api/assets/video-metrics', filters, options);
    }
}
