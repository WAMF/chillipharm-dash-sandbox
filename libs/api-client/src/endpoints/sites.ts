import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Site {
    id: string;
    name: string;
    country_code: string;
    country_name: string;
    trial_id: string;
    trial_name: string;
    asset_count: number;
    subject_count: number;
}

export interface SiteFilters {
    trial_id?: string;
    country_code?: string;
    search?: string;
}

export class SitesApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: SiteFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<Site>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/sites', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<Site> {
        return this.client.get(`/api/sites/${id}`, undefined, options);
    }

    async getMetrics(
        options?: RequestOptions
    ): Promise<{ total: number; byCountry: Record<string, number> }> {
        return this.client.get('/api/sites/metrics', undefined, options);
    }
}
