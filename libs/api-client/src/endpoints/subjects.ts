import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Subject {
  id: string;
  number: string;
  site_id: string;
  site_name: string;
  trial_id: string;
  trial_name: string;
  event_count: number;
  procedure_count: number;
  asset_count: number;
}

export interface SubjectFilters {
  trial_id?: string;
  site_id?: string;
  search?: string;
}

export class SubjectsApi extends BaseApi {
  async list(
    pagination?: PaginationParams,
    filters?: SubjectFilters,
    options?: RequestOptions
  ): Promise<PaginatedResponse<Subject>> {
    const params = this.buildParams(pagination, filters);
    return this.client.get('/api/subjects', params, options);
  }

  async getById(id: string, options?: RequestOptions): Promise<Subject> {
    return this.client.get(`/api/subjects/${id}`, undefined, options);
  }
}
