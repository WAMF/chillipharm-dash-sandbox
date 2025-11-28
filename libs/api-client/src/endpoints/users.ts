import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
}

export interface UserFilters {
    role?: string;
    search?: string;
}

export class UsersApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: UserFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<User>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/users', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<User> {
        return this.client.get(`/api/users/${id}`, undefined, options);
    }

    async getCurrent(options?: RequestOptions): Promise<User> {
        return this.client.get('/api/users/me', undefined, options);
    }
}
