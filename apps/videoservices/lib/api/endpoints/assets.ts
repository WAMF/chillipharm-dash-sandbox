import type { AssetFilters, VSAsset } from '@cp/types';

import { BaseApi } from './base';

export interface AssetListResponse {
    assets: VSAsset[];
    total: number;
}

export interface DownloadUrlResponse {
    url: string;
    expires_at: string;
}

export class AssetsApi extends BaseApi {
    async listBySite(
        siteId: string,
        filters?: AssetFilters
    ): Promise<AssetListResponse> {
        return this.client.get<AssetListResponse, AssetFilters>(
            `/api/v1/sites/${siteId}/assets`,
            filters
        );
    }

    async getDownloadUrl(assetId: string): Promise<DownloadUrlResponse> {
        return this.client.get<DownloadUrlResponse>(
            `/api/v1/assets/${assetId}/download-url`
        );
    }
}
