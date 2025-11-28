import { UsersApi } from './endpoints/users';
import { TrialsApi } from './endpoints/trials';
import { SubjectsApi } from './endpoints/subjects';
import { StatsApi } from './endpoints/stats';
import { SitesApi } from './endpoints/sites';
import { ReviewsApi } from './endpoints/reviews';
import { ProceduresApi } from './endpoints/procedures';
import { EventsApi } from './endpoints/events';
import { AssetsApi } from './endpoints/assets';

export interface ApiClientConfig {
  baseUrl: string;
  getAuthToken?: () => Promise<string | null>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiClient {
  private config: ApiClientConfig;

  readonly assets: AssetsApi;
  readonly sites: SitesApi;
  readonly trials: TrialsApi;
  readonly stats: StatsApi;
  readonly reviews: ReviewsApi;
  readonly subjects: SubjectsApi;
  readonly procedures: ProceduresApi;
  readonly events: EventsApi;
  readonly users: UsersApi;

  constructor(config: ApiClientConfig) {
    this.config = config;

    this.assets = new AssetsApi(this);
    this.sites = new SitesApi(this);
    this.trials = new TrialsApi(this);
    this.stats = new StatsApi(this);
    this.reviews = new ReviewsApi(this);
    this.subjects = new SubjectsApi(this);
    this.procedures = new ProceduresApi(this);
    this.events = new EventsApi(this);
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
      throw new ApiError(response.status, errorData.message || response.statusText, errorData);
    }

    return response.json();
  }

  async get<T, P extends object = Record<string, unknown>>(endpoint: string, params?: P, options?: RequestOptions): Promise<T> {
    const searchParams = params ? this.buildQueryString(params) : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.request<T>(url, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
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

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
