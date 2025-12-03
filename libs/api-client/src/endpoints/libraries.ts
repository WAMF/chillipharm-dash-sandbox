import type { Library, PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface LibraryFilters {
    trial_id?: string;
    search?: string;
}

export interface LibraryAsset {
    id: number;
    filename: string;
    filesize: number;
    filesizeFormatted: string;
    duration: string | null;
    url: string;
    processed: boolean;
    createdAt: string;
    uploader: {
        email: string;
        name: string | null;
    } | null;
    review: {
        reviewed: boolean;
        reviewDate: string | null;
        reviewer: string | null;
    };
}

export class LibrariesApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: LibraryFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<Library>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/v1/libraries', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<Library> {
        return this.client.get(`/api/v1/libraries/${id}`, undefined, options);
    }

    async getAssets(
        libraryId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<LibraryAsset>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/libraries/${libraryId}/assets`,
            params,
            options
        );
    }
}
