export type DataViewMode = 'sites' | 'library' | 'all';

export const DATA_VIEW_MODE_LABELS: Record<DataViewMode, string> = {
    sites: 'Sites',
    library: 'Library',
    all: 'All Assets',
};

export const DEFAULT_DATA_VIEW_MODE: DataViewMode = 'all';
