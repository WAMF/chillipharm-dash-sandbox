import type { AssetCorrelation, CorrelationFilters } from '@cp/types';

import { BaseApi } from './base';

export interface CorrelationListResponse {
    correlations: AssetCorrelation[];
    total: number;
}

export class CorrelationsApi extends BaseApi {
    async query(filters?: CorrelationFilters): Promise<CorrelationListResponse> {
        return this.client.get<CorrelationListResponse, CorrelationFilters>(
            '/api/v1/correlations',
            filters
        );
    }

    async getByJobId(jobId: string): Promise<AssetCorrelation[]> {
        return this.client.get<AssetCorrelation[]>(
            `/api/v1/correlations/job/${jobId}`
        );
    }
}
