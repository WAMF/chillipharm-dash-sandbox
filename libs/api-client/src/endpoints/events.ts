import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Event {
    id: string;
    display_name: string;
    subject_id: string;
    subject_number: string;
    procedure_count: number;
    asset_count: number;
}

export interface EventFilters {
    trial_id?: string;
    site_id?: string;
    subject_id?: string;
}

export class EventsApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: EventFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<Event>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/events', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<Event> {
        return this.client.get(`/api/events/${id}`, undefined, options);
    }
}
