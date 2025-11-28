import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Trial {
  id: string;
  trial_name: string;
  company_name: string;
  site_count: number;
  asset_count: number;
  subject_count: number;
}

export interface TrialFilters {
  search?: string;
}

export class TrialsApi extends BaseApi {
  async list(
    pagination?: PaginationParams,
    filters?: TrialFilters,
    options?: RequestOptions
  ): Promise<PaginatedResponse<Trial>> {
    const params = this.buildParams(pagination, filters);
    return this.client.get('/api/trials', params, options);
  }

  async getById(id: string, options?: RequestOptions): Promise<Trial> {
    return this.client.get(`/api/trials/${id}`, undefined, options);
  }
}
