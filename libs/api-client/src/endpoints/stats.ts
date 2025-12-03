import type { DashboardMetrics } from '@cp/types';
import { BaseApi } from './base';
import type { RequestOptions } from '../client';

export interface TimeSeriesDataPoint {
    date: string;
    count: number;
}

export interface StatsFilters {
    trial_id?: string;
    site_id?: string;
    date_from?: string;
    date_to?: string;
}

export interface SiteDistributionItem {
    siteId: number;
    siteName: string;
    count: number;
}

export interface CountryDistributionItem {
    country: string;
    siteCount: number;
    assetCount: number;
}

export interface SitesStats {
    totalSites: number;
    totalSubjects: number;
    totalAssets: number;
    assetsPerSite: SiteDistributionItem[];
    subjectsPerSite: SiteDistributionItem[];
    countriesDistribution: CountryDistributionItem[];
}

export interface LibraryDistributionItem {
    libraryId: number;
    libraryName: string;
    count: number;
}

export interface TrialDistributionItem {
    trialId: number;
    trialName: string;
    libraryCount: number;
    assetCount: number;
}

export interface LibrariesStats {
    totalLibraries: number;
    totalAssets: number;
    assetsPerLibrary: LibraryDistributionItem[];
    trialDistribution: TrialDistributionItem[];
}

export class StatsApi extends BaseApi {
    async getDashboard(
        filters?: StatsFilters,
        options?: RequestOptions
    ): Promise<DashboardMetrics> {
        return this.client.get('/api/stats', filters, options);
    }

    async getAssetTimeline(
        filters?: StatsFilters,
        options?: RequestOptions
    ): Promise<TimeSeriesDataPoint[]> {
        return this.client.get('/api/stats/assets-timeline', filters, options);
    }

    async getReviewTimeline(
        filters?: StatsFilters,
        options?: RequestOptions
    ): Promise<TimeSeriesDataPoint[]> {
        return this.client.get('/api/stats/reviews-timeline', filters, options);
    }

    async getSitesStats(
        filters?: { trial_id?: string },
        options?: RequestOptions
    ): Promise<SitesStats> {
        const response = await this.client.get<{ data: SitesStats }>(
            '/api/v1/stats/sites',
            filters,
            options
        );
        return response.data;
    }

    async getLibrariesStats(
        filters?: { trial_id?: string },
        options?: RequestOptions
    ): Promise<LibrariesStats> {
        const response = await this.client.get<{ data: LibrariesStats }>(
            '/api/v1/stats/libraries',
            filters,
            options
        );
        return response.data;
    }
}
