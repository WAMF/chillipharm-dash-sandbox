import type {
    AssetRecord,
    FilterState,
    QueryFilter,
    PaginatedResponse,
} from '@cp/types';
import type { ApiClient } from './client';
import type { SitesStats, LibrariesStats } from './endpoints/stats';

export type { SitesStats, LibrariesStats };

export interface ApiAsset {
    id: number;
    filename: string;
    filesize: number;
    filesizeFormatted: string;
    duration: string | null;
    processed: boolean;
    url: string;
    createdAt: string;
    trial: {
        id: number;
        name: string;
    };
    site: {
        id: number;
        name: string;
        country: string;
        countryCode: string;
    } | null;
    library: {
        id: number;
        name: string;
    } | null;
    uploader: {
        email: string;
        name: string | null;
    } | null;
    studyProcedure: {
        id: number;
        name: string;
        date: string;
        event: string;
        arm: string;
        subjectNumber: string;
        evaluator: string | null;
    } | null;
    review: {
        reviewed: boolean;
        reviewDate: string | null;
        reviewer: string | null;
    };
    comments: string | null;
}

export interface ApiStats {
    assets: {
        total: number;
        processed: number;
        processingRate: number;
        totalSizeBytes: number;
        totalSizeFormatted: string;
    };
    trials: {
        total: number;
    };
    sites: {
        total: number;
    };
    subjects: {
        total: number;
    };
    reviews: {
        reviewed: number;
        total: number;
        reviewRate: number;
    };
    uploadTrend: Array<{
        date: string;
        uploads: number;
    }>;
}


export function transformApiAssetToRecord(asset: ApiAsset): AssetRecord {
    return {
        trialName: asset.trial?.name || '',
        trialId: asset.trial?.id || 0,
        siteName: asset.site?.name || '',
        siteId: asset.site?.id || 0,
        siteCountry: asset.site?.country || '',
        subjectNumber: asset.studyProcedure?.subjectNumber || '',
        studyArm: asset.studyProcedure?.arm || '',
        studyEvent: asset.studyProcedure?.event || '',
        studyProcedure: asset.studyProcedure?.name || '',
        studyProcedureDate: asset.studyProcedure?.date || '',
        evaluator: asset.studyProcedure?.evaluator || '',
        assetId: asset.id,
        assetTitle: asset.filename,
        uploadDate: asset.createdAt ? new Date(asset.createdAt) : new Date(),
        uploadedBy: asset.uploader?.name || asset.uploader?.email || '',
        processed: asset.processed ? 'Yes' : 'No',
        assetDuration: asset.duration || '',
        reviewed: asset.review?.reviewed || false,
        comments: asset.comments || '',
        reviewedBy: asset.review?.reviewer || '',
        reviewedDate: asset.review?.reviewDate || '',
        fileSize: asset.filesizeFormatted || '',
        assetLink: asset.url || '',
        libraryId: asset.library?.id,
        libraryName: asset.library?.name,
    };
}

export function filterStateToQueryFilter(filters: FilterState): QueryFilter {
    const queryFilter: QueryFilter = {};

    if (filters.dataViewMode && filters.dataViewMode !== 'all') {
        queryFilter.dataViewMode = filters.dataViewMode;
    }
    if (filters.selectedTrials.length > 0) {
        queryFilter.trials = filters.selectedTrials;
    }
    if (filters.selectedSites.length > 0) {
        queryFilter.sites = filters.selectedSites;
    }
    if (filters.selectedLibraries.length > 0) {
        queryFilter.libraries = filters.selectedLibraries;
    }
    if (filters.selectedCountries.length > 0) {
        queryFilter.countries = filters.selectedCountries;
    }
    if (filters.selectedStudyArms.length > 0) {
        queryFilter.studyArms = filters.selectedStudyArms;
    }
    if (filters.selectedProcedures.length > 0) {
        queryFilter.procedures = filters.selectedProcedures;
    }
    if (filters.dateRange.start || filters.dateRange.end) {
        queryFilter.startDate = filters.dateRange.start || undefined;
        queryFilter.endDate = filters.dateRange.end || undefined;
    }
    if (filters.reviewStatus !== 'all') {
        queryFilter.reviewStatus = filters.reviewStatus;
    }
    if (filters.processedStatus !== 'all') {
        queryFilter.processedStatus = filters.processedStatus;
    }
    if (filters.searchTerm.trim()) {
        queryFilter.search = filters.searchTerm.trim();
    }
    if (filters.sortBy) {
        queryFilter.sortBy = filters.sortBy;
        queryFilter.sortOrder = filters.sortOrder;
    }

    return queryFilter;
}

export class DataLoader {
    private client: ApiClient;
    private baseUrl: string;
    private getAuthToken: () => Promise<string>;

    constructor(baseUrl: string, getAuthToken: () => Promise<string>) {
        this.baseUrl = baseUrl;
        this.getAuthToken = getAuthToken;
        this.client = null as unknown as ApiClient;
    }

    private async fetchWithAuth(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const token = await this.getAuthToken();

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        return fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });
    }

    async fetchAssets(params?: {
        page?: number;
        limit?: number;
        trial_id?: number;
        site_id?: number;
        processed?: boolean;
        reviewed?: boolean;
        search?: string;
    }): Promise<PaginatedResponse<ApiAsset>> {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.trial_id)
            searchParams.set('trial_id', String(params.trial_id));
        if (params?.site_id)
            searchParams.set('site_id', String(params.site_id));
        if (params?.processed !== undefined)
            searchParams.set('processed', String(params.processed));
        if (params?.reviewed !== undefined)
            searchParams.set('reviewed', String(params.reviewed));
        if (params?.search) searchParams.set('search', params.search);

        const query = searchParams.toString();
        const response = await this.fetchWithAuth(
            `/api/v1/assets${query ? `?${query}` : ''}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchAllAssets(): Promise<AssetRecord[]> {
        const allAssets: ApiAsset[] = [];
        let page = 1;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
            const response = await this.fetchAssets({ page, limit });
            allAssets.push(...response.data);

            if (page >= response.meta.totalPages) {
                hasMore = false;
            } else {
                page++;
            }
        }

        return allAssets.map(transformApiAssetToRecord);
    }

    async queryAssets(
        filters: QueryFilter
    ): Promise<PaginatedResponse<ApiAsset>> {
        const response = await this.fetchWithAuth('/api/v1/assets/query', {
            method: 'POST',
            body: JSON.stringify(filters),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async queryAllAssets(filters: QueryFilter): Promise<AssetRecord[]> {
        const allAssets: ApiAsset[] = [];
        let page = 1;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
            const response = await this.queryAssets({
                ...filters,
                page,
                limit,
            });
            allAssets.push(...response.data);

            if (page >= response.meta.totalPages) {
                hasMore = false;
            } else {
                page++;
            }
        }

        return allAssets.map(transformApiAssetToRecord);
    }

    async loadData(): Promise<AssetRecord[]> {
        return this.fetchAllAssets();
    }

    async loadFilteredData(filters: FilterState): Promise<AssetRecord[]> {
        const queryFilter = filterStateToQueryFilter(filters);
        return this.queryAllAssets(queryFilter);
    }

    async fetchStats(trialId?: number): Promise<ApiStats> {
        const searchParams = new URLSearchParams();
        if (trialId) searchParams.set('trial_id', String(trialId));

        const query = searchParams.toString();
        const response = await this.fetchWithAuth(
            `/api/v1/stats${query ? `?${query}` : ''}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    }

    async checkHealth(): Promise<{ status: string; timestamp: string }> {
        const response = await fetch(`${this.baseUrl}/api/health`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchSitesStats(trialId?: number): Promise<SitesStats> {
        const searchParams = new URLSearchParams();
        if (trialId) searchParams.set('trial_id', String(trialId));

        const query = searchParams.toString();
        const response = await this.fetchWithAuth(
            `/api/v1/stats/sites${query ? `?${query}` : ''}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    }

    async fetchLibrariesStats(trialId?: number): Promise<LibrariesStats> {
        const searchParams = new URLSearchParams();
        if (trialId) searchParams.set('trial_id', String(trialId));

        const query = searchParams.toString();
        const response = await this.fetchWithAuth(
            `/api/v1/stats/libraries${query ? `?${query}` : ''}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    }

    async fetchSiteSubjects(
        siteId: number,
        page = 1,
        limit = 50
    ): Promise<
        PaginatedResponse<{
            id: number;
            number: string;
            active: boolean;
            arm: { id: number; name: string } | null;
            createdAt: string;
            stats: { eventCount: number; procedureCount: number };
        }>
    > {
        const response = await this.fetchWithAuth(
            `/api/v1/sites/${siteId}/subjects?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchSubjectEvents(
        siteId: number,
        subjectId: number,
        page = 1,
        limit = 50
    ): Promise<
        PaginatedResponse<{
            id: number;
            identifier: string;
            name: string;
            date: string;
            status: number;
            stats: { procedureCount: number; assetCount: number };
        }>
    > {
        const response = await this.fetchWithAuth(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchEventProcedures(
        siteId: number,
        subjectId: number,
        eventId: number,
        page = 1,
        limit = 50
    ): Promise<
        PaginatedResponse<{
            id: number;
            identifier: string;
            name: string;
            date: string;
            status: number;
            locked: boolean;
            evaluator: { name: string } | null;
            stats: { assetCount: number };
        }>
    > {
        const response = await this.fetchWithAuth(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchProcedureAssets(
        siteId: number,
        subjectId: number,
        eventId: number,
        procedureId: number,
        page = 1,
        limit = 50
    ): Promise<
        PaginatedResponse<{
            id: number;
            filename: string;
            filesize: number;
            filesizeFormatted: string;
            duration: string | null;
            url: string;
            processed: boolean;
            createdAt: string;
            review: {
                reviewed: boolean;
                reviewDate: string | null;
                reviewer: string | null;
            };
        }>
    > {
        const response = await this.fetchWithAuth(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures/${procedureId}/assets?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async fetchLibraryAssets(
        libraryId: number,
        page = 1,
        limit = 50
    ): Promise<
        PaginatedResponse<{
            id: number;
            filename: string;
            filesize: number;
            filesizeFormatted: string;
            duration: string | null;
            url: string;
            processed: boolean;
            createdAt: string;
            uploader: { email: string; name: string | null } | null;
            review: {
                reviewed: boolean;
                reviewDate: string | null;
                reviewer: string | null;
            };
        }>
    > {
        const response = await this.fetchWithAuth(
            `/api/v1/libraries/${libraryId}/assets?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }
}

export function createDataLoader(
    baseUrl: string,
    getAuthToken: () => Promise<string>
): DataLoader {
    return new DataLoader(baseUrl, getAuthToken);
}
