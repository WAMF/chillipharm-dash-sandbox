import { auth } from './firebase';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://europe-west2-chillipharm-dashboard.cloudfunctions.net/api'
  : 'http://127.0.0.1:5002/chillipharm-dashboard/europe-west2/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.getIdToken();
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Asset {
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

export interface Trial {
  id: number;
  trialName: string;
  companyName: string;
  createdAt: string;
}

export interface TrialDetail extends Trial {
  stats?: {
    totalAssets: number;
    totalSites: number;
    totalSubjects: number;
  };
}

export interface Site {
  id: number;
  name: string;
  country: string;
  trial: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface Stats {
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

export async function fetchAssets(params?: {
  page?: number;
  limit?: number;
  trial_id?: number;
  site_id?: number;
  processed?: boolean;
  reviewed?: boolean;
  search?: string;
}): Promise<PaginatedResponse<Asset>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.trial_id) searchParams.set('trial_id', String(params.trial_id));
  if (params?.site_id) searchParams.set('site_id', String(params.site_id));
  if (params?.processed !== undefined) searchParams.set('processed', String(params.processed));
  if (params?.reviewed !== undefined) searchParams.set('reviewed', String(params.reviewed));
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const response = await fetchWithAuth(`/api/v1/assets${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchAllAssets(): Promise<Asset[]> {
  const allAssets: Asset[] = [];
  let page = 1;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchAssets({ page, limit });
    allAssets.push(...response.data);

    if (page >= response.meta.totalPages) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allAssets;
}

export async function fetchTrials(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Trial>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const response = await fetchWithAuth(`/api/v1/trials${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchTrial(id: number): Promise<ApiResponse<TrialDetail>> {
  const response = await fetchWithAuth(`/api/v1/trials/${id}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchSites(params?: {
  page?: number;
  limit?: number;
  trial_id?: number;
  search?: string;
}): Promise<PaginatedResponse<Site>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.trial_id) searchParams.set('trial_id', String(params.trial_id));
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const response = await fetchWithAuth(`/api/v1/sites${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchStats(trialId?: number): Promise<ApiResponse<Stats>> {
  const searchParams = new URLSearchParams();
  if (trialId) searchParams.set('trial_id', String(trialId));

  const query = searchParams.toString();
  const response = await fetchWithAuth(`/api/v1/stats${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export interface QueryFilter {
  trials?: string[];
  sites?: string[];
  countries?: string[];
  studyArms?: string[];
  procedures?: string[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
  reviewStatus?: 'all' | 'reviewed' | 'pending';
  processedStatus?: 'all' | 'yes' | 'no';
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function queryAssets(filters: QueryFilter): Promise<PaginatedResponse<Asset>> {
  const response = await fetchWithAuth('/api/v1/assets/query', {
    method: 'POST',
    body: JSON.stringify(filters)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function queryAllAssets(filters: QueryFilter): Promise<Asset[]> {
  const allAssets: Asset[] = [];
  let page = 1;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const response = await queryAssets({ ...filters, page, limit });
    allAssets.push(...response.data);

    if (page >= response.meta.totalPages) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allAssets;
}
