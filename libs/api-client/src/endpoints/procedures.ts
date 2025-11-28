import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Procedure {
  id: string;
  display_name: string;
  date: string;
  subject_id: string;
  subject_number: string;
  event_id: string;
  event_name: string;
  asset_count: number;
}

export interface ProcedureFilters {
  trial_id?: string;
  site_id?: string;
  subject_id?: string;
  date_from?: string;
  date_to?: string;
}

export class ProceduresApi extends BaseApi {
  async list(
    pagination?: PaginationParams,
    filters?: ProcedureFilters,
    options?: RequestOptions
  ): Promise<PaginatedResponse<Procedure>> {
    const params = this.buildParams(pagination, filters);
    return this.client.get('/api/procedures', params, options);
  }

  async getById(id: string, options?: RequestOptions): Promise<Procedure> {
    return this.client.get(`/api/procedures/${id}`, undefined, options);
  }
}
