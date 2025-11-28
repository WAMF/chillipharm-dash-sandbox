import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Review {
    id: string;
    asset_id: string;
    reviewed: boolean;
    review_date: string | null;
    reviewer_id: string | null;
    reviewer_name: string | null;
    comments: string | null;
}

export interface ReviewFilters {
    asset_id?: string;
    reviewed?: boolean;
    date_from?: string;
    date_to?: string;
}

export class ReviewsApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: ReviewFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<Review>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/reviews', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<Review> {
        return this.client.get(`/api/reviews/${id}`, undefined, options);
    }

    async getMetrics(
        options?: RequestOptions
    ): Promise<{ total: number; reviewed: number; pending: number }> {
        return this.client.get('/api/reviews/metrics', undefined, options);
    }
}
