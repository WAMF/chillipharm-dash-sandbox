import type { ApiClient } from '../client';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export abstract class BaseApi {
  constructor(protected client: ApiClient) {}

  protected buildParams<T extends object>(
    pagination?: PaginationParams,
    filters?: T
  ): Record<string, unknown> {
    return {
      ...pagination,
      ...filters,
    };
  }
}
