export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginationLinks {
    self: string;
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export interface QueryFilter {
    dataViewMode?: 'sites' | 'library' | 'all';
    trials?: string[];
    sites?: string[];
    libraries?: string[];
    countries?: string[];
    studyArms?: string[];
    procedures?: string[];
    dateRange?: { start?: string; end?: string };
    reviewStatus?: 'all' | 'reviewed' | 'pending';
    processedStatus?: 'all' | 'yes' | 'no';
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface TrialInfo {
    id: number;
    name: string;
    assetCount?: number;
    siteCount?: number;
}

export interface SiteInfo {
    id: number;
    name: string;
    country: string;
    assetCount?: number;
}

export interface StatsResponse {
    totalAssets: number;
    totalSites: number;
    totalSubjects: number;
    totalTrials: number;
    reviewedCount: number;
    processedCount: number;
}
