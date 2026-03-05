import type { MockUser } from '../../mock/data';

import { BaseApi } from './base';

export interface UserListResponse {
    users: MockUser[];
}

export class UsersApi extends BaseApi {
    async list(search?: string): Promise<UserListResponse> {
        return this.client.get<UserListResponse>(
            '/api/v1/users',
            search ? { search } : undefined
        );
    }
}
