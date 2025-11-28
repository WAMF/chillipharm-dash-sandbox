import type { ApiClient, RequestOptions } from '../client';
import type { PaginatedResponse } from '@cp/types';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export abstract class BaseApi {
  constructor(protected client: ApiClient) {}

  protected buildParams(
    pagination?: PaginationParams,
    filters?: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...pagination,
      ...filters,
    };
  }
}
