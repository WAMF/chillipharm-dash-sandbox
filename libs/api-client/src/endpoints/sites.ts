import type { PaginatedResponse } from '@cp/types';
import { BaseApi, PaginationParams } from './base';
import type { RequestOptions } from '../client';

export interface Site {
    id: string;
    name: string;
    country_code: string;
    country_name: string;
    trial_id: string;
    trial_name: string;
    asset_count: number;
    subject_count: number;
}

export interface SiteSubject {
    id: number;
    number: string;
    active: boolean;
    arm: { id: number; name: string } | null;
    createdAt: string;
    stats: { eventCount: number; procedureCount: number };
}

export interface SubjectEvent {
    id: number;
    identifier: string;
    name: string;
    date: string;
    status: number;
    stats: { procedureCount: number; assetCount: number };
}

export interface EventProcedure {
    id: number;
    identifier: string;
    name: string;
    date: string;
    status: number;
    locked: boolean;
    evaluator: { name: string } | null;
    stats: { assetCount: number };
}

export interface ProcedureAsset {
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
}

export interface SiteAsset {
    id: number;
    filename: string;
    filesize: number;
    filesizeFormatted: string;
    duration: string | null;
    url: string;
    processed: boolean;
    createdAt: string;
    studyProcedure: {
        id: number;
        name: string;
        event: string;
        subjectNumber: string;
    } | null;
    review: {
        reviewed: boolean;
        reviewDate: string | null;
    };
}

export interface SiteFilters {
    trial_id?: string;
    country_code?: string;
    search?: string;
}

export class SitesApi extends BaseApi {
    async list(
        pagination?: PaginationParams,
        filters?: SiteFilters,
        options?: RequestOptions
    ): Promise<PaginatedResponse<Site>> {
        const params = this.buildParams(pagination, filters);
        return this.client.get('/api/sites', params, options);
    }

    async getById(id: string, options?: RequestOptions): Promise<Site> {
        return this.client.get(`/api/sites/${id}`, undefined, options);
    }

    async getMetrics(
        options?: RequestOptions
    ): Promise<{ total: number; byCountry: Record<string, number> }> {
        return this.client.get('/api/sites/metrics', undefined, options);
    }

    async getSubjects(
        siteId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<SiteSubject>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/sites/${siteId}/subjects`,
            params,
            options
        );
    }

    async getSubjectEvents(
        siteId: string | number,
        subjectId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<SubjectEvent>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events`,
            params,
            options
        );
    }

    async getEventProcedures(
        siteId: string | number,
        subjectId: string | number,
        eventId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<EventProcedure>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures`,
            params,
            options
        );
    }

    async getProcedureAssets(
        siteId: string | number,
        subjectId: string | number,
        eventId: string | number,
        procedureId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<ProcedureAsset>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures/${procedureId}/assets`,
            params,
            options
        );
    }

    async getSiteAssets(
        siteId: string | number,
        pagination?: PaginationParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<SiteAsset>> {
        const params = this.buildParams(pagination);
        return this.client.get(
            `/api/v1/sites/${siteId}/assets`,
            params,
            options
        );
    }
}
