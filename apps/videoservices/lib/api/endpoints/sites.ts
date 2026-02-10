import type { VSAsset, AssetFilters } from '@cp/types';

import type { Site } from '../../mock/data';
import { BaseApi } from './base';

export interface SitesListResponse {
    sites: Site[];
}

export interface AssetsListResponse {
    assets: VSAsset[];
    total: number;
}

export class SitesApi extends BaseApi {
    async list(): Promise<SitesListResponse> {
        return this.client.get<SitesListResponse>('/api/v1/sites');
    }

    async getById(siteId: string): Promise<Site> {
        return this.client.get<Site>(`/api/v1/sites/${siteId}`);
    }

    async getAssets(siteId: string, filters?: AssetFilters): Promise<AssetsListResponse> {
        return this.client.get<AssetsListResponse, AssetFilters>(
            `/api/v1/sites/${siteId}/assets`,
            filters
        );
    }
}
