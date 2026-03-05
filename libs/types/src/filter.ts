import type { AssetRecord } from './asset';

export interface FilterState {
    selectedTrials: string[];
    selectedSites: string[];
    selectedCountries: string[];
    selectedStudyArms: string[];
    selectedProcedures: string[];
    dateRange: {
        start: string | null;
        end: string | null;
    };
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
    selectedTrials: [],
    selectedSites: [],
    selectedCountries: [],
    selectedStudyArms: [],
    selectedProcedures: [],
    dateRange: { start: null, end: null },
    processedStatus: 'all',
    searchTerm: '',
    sortBy: '',
    sortOrder: 'desc',
};
