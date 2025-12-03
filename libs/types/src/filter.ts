import type { DataViewMode } from './dataView';
import type { AssetRecord } from './asset';

export interface FilterState {
    dataViewMode: DataViewMode;
    selectedTrials: string[];
    selectedSites: string[];
    selectedCountries: string[];
    selectedStudyArms: string[];
    selectedProcedures: string[];
    selectedLibraries: string[];
    dateRange: {
        start: string | null;
        end: string | null;
    };
    reviewStatus: 'all' | 'reviewed' | 'pending';
    processedStatus: 'all' | 'yes' | 'no';
    searchTerm: string;
    sortBy: keyof AssetRecord | '';
    sortOrder: 'asc' | 'desc';
}

export interface FilterPreset {
    id: string;
    name: string;
    filters: FilterState;
}

export interface ExportColumn {
    key: keyof AssetRecord;
    label: string;
    selected: boolean;
}

export const DEFAULT_FILTER_STATE: FilterState = {
    dataViewMode: 'all',
    selectedTrials: [],
    selectedSites: [],
    selectedCountries: [],
    selectedStudyArms: [],
    selectedProcedures: [],
    selectedLibraries: [],
    dateRange: { start: null, end: null },
    reviewStatus: 'all',
    processedStatus: 'all',
    searchTerm: '',
    sortBy: '',
    sortOrder: 'desc',
};
