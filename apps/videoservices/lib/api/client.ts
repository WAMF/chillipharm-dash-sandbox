import { WorkflowsApi } from './endpoints/workflows';
import { TasksApi } from './endpoints/tasks';
import { SitesApi } from './endpoints/sites';
import { CorrelationsApi } from './endpoints/correlations';
import { AssetsApi } from './endpoints/assets';
import { UsersApi } from './endpoints/users';

export interface ApiClientConfig {
    baseUrl: string;
    getAuthToken?: () => Promise<string | null>;
}

export interface RequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

export class VideoservicesApiClient {
    private config: ApiClientConfig;

    readonly workflows: WorkflowsApi;
    readonly tasks: TasksApi;
    readonly assets: AssetsApi;
    readonly correlations: CorrelationsApi;
    readonly sites: SitesApi;
    readonly users: UsersApi;

    constructor(config: ApiClientConfig) {
        this.config = config;

        this.workflows = new WorkflowsApi(this);
        this.tasks = new TasksApi(this);
        this.assets = new AssetsApi(this);
        this.correlations = new CorrelationsApi(this);
        this.sites = new SitesApi(this);
        this.users = new UsersApi(this);
    }

    async request<T>(
        endpoint: string,
        options: RequestInit & RequestOptions = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> | undefined),
        };

        if (this.config.getAuthToken) {
            const token = await this.config.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.message || response.statusText,
                errorData
            );
        }

        return response.json();
    }

    async requestFormData<T>(
        endpoint: string,
        formData: FormData,
        options: RequestOptions = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> | undefined),
        };

        if (this.config.getAuthToken) {
            const token = await this.config.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers,
            signal: options.signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.message || response.statusText,
                errorData
            );
        }

        return response.json();
    }

    async get<T, P extends object = Record<string, unknown>>(
        endpoint: string,
        params?: P,
        options?: RequestOptions
    ): Promise<T> {
        const searchParams = params ? this.buildQueryString(params) : '';
        const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
        return this.request<T>(url, { method: 'GET', ...options });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });
    }

    async put<T>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options });
    }

    private buildQueryString<T extends object>(params: T): string {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });

        return searchParams.toString();
    }
}

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function createVideoservicesApiClient(
    config: ApiClientConfig
): VideoservicesApiClient {
    return new VideoservicesApiClient(config);
}
