'use client';

import {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import type { FilterState, FilterPreset } from '@cp/types';

const STORAGE_KEY = 'chillipharm-filters';
const PRESETS_KEY = 'chillipharm-filter-presets';
const VERSION_KEY = 'chillipharm-version';
const CURRENT_VERSION = '5';

const defaultFilterState: FilterState = {
    selectedTrials: [],
    selectedSites: [],
    selectedCountries: [],
    selectedStudyArms: [],
    selectedProcedures: [],
    dateRange: {
        start: null,
        end: null,
    },
    reviewStatus: 'all',
    processedStatus: 'all',
    searchTerm: '',
    sortBy: '',
    sortOrder: 'desc',
};

type FilterAction =
    | { type: 'SET_ALL'; payload: FilterState }
    | {
          type: 'SET_FILTER';
          key: keyof FilterState;
          value: FilterState[keyof FilterState];
      }
    | { type: 'TOGGLE_ARRAY_FILTER'; key: ArrayFilterKey; value: string }
    | { type: 'CLEAR_ARRAY_FILTER'; key: ArrayFilterKey }
    | { type: 'RESET' };

type ArrayFilterKey =
    | 'selectedTrials'
    | 'selectedSites'
    | 'selectedCountries'
    | 'selectedStudyArms'
    | 'selectedProcedures';

function filterReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_ALL':
            return action.payload;
        case 'SET_FILTER':
            return { ...state, [action.key]: action.value };
        case 'TOGGLE_ARRAY_FILTER': {
            const current = state[action.key];
            const newArray = current.includes(action.value)
                ? current.filter(v => v !== action.value)
                : [...current, action.value];
            return { ...state, [action.key]: newArray };
        }
        case 'CLEAR_ARRAY_FILTER':
            return { ...state, [action.key]: [] };
        case 'RESET':
            return defaultFilterState;
        default:
            return state;
    }
}

interface FilterContextValue {
    filters: FilterState;
    presets: FilterPreset[];
    setFilters: (filters: FilterState) => void;
    setFilter: <K extends keyof FilterState>(
        key: K,
        value: FilterState[K]
    ) => void;
    toggleArrayFilter: (key: ArrayFilterKey, value: string) => void;
    clearArrayFilter: (key: ArrayFilterKey) => void;
    resetFilters: () => void;
    getActiveFilterCount: () => number;
    addPreset: (name: string) => void;
    removePreset: (id: string) => void;
    applyPreset: (preset: FilterPreset) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function getDefaultPresets(): FilterPreset[] {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return [
        {
            id: 'last-7-days',
            name: 'Last 7 Days',
            filters: {
                ...defaultFilterState,
                dateRange: {
                    start: sevenDaysAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                },
            },
        },
        {
            id: 'last-30-days',
            name: 'Last 30 Days',
            filters: {
                ...defaultFilterState,
                dateRange: {
                    start: thirtyDaysAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                },
            },
        },
        {
            id: 'pending-review',
            name: 'Pending Review',
            filters: {
                ...defaultFilterState,
                reviewStatus: 'pending',
            },
        },
        {
            id: 'reviewed',
            name: 'Reviewed Only',
            filters: {
                ...defaultFilterState,
                reviewStatus: 'reviewed',
            },
        },
    ];
}

function loadFiltersFromStorage(): FilterState {
    if (typeof window === 'undefined') return defaultFilterState;
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion !== CURRENT_VERSION) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(PRESETS_KEY);
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            return defaultFilterState;
        }
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultFilterState, ...JSON.parse(stored) };
        }
    } catch {
        // Ignore errors
    }
    return defaultFilterState;
}

function saveFiltersToStorage(state: FilterState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore errors
    }
}

function loadPresetsFromStorage(): FilterPreset[] {
    if (typeof window === 'undefined') return getDefaultPresets();
    try {
        const stored = localStorage.getItem(PRESETS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore errors
    }
    return getDefaultPresets();
}

function savePresetsToStorage(presets: FilterPreset[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    } catch {
        // Ignore errors
    }
}

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filters, dispatch] = useReducer(
        filterReducer,
        defaultFilterState,
        loadFiltersFromStorage
    );
    const [presets, setPresets] = useReducer(
        (
            state: FilterPreset[],
            action: {
                type: string;
                payload?: FilterPreset[] | FilterPreset | string;
            }
        ) => {
            switch (action.type) {
                case 'SET_ALL':
                    return action.payload as FilterPreset[];
                case 'ADD':
                    return [...state, action.payload as FilterPreset];
                case 'REMOVE':
                    return state.filter(p => p.id !== action.payload);
                default:
                    return state;
            }
        },
        getDefaultPresets(),
        loadPresetsFromStorage
    );

    useEffect(() => {
        saveFiltersToStorage(filters);
    }, [filters]);

    useEffect(() => {
        savePresetsToStorage(presets);
    }, [presets]);

    const setFilters = useCallback((newFilters: FilterState) => {
        dispatch({ type: 'SET_ALL', payload: newFilters });
    }, []);

    const setFilter = useCallback(
        <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
            dispatch({ type: 'SET_FILTER', key, value });
        },
        []
    );

    const toggleArrayFilter = useCallback(
        (key: ArrayFilterKey, value: string) => {
            dispatch({ type: 'TOGGLE_ARRAY_FILTER', key, value });
        },
        []
    );

    const clearArrayFilter = useCallback((key: ArrayFilterKey) => {
        dispatch({ type: 'CLEAR_ARRAY_FILTER', key });
    }, []);

    const resetFilters = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const getActiveFilterCount = useCallback(() => {
        let count = 0;
        if (filters.selectedTrials.length > 0) count++;
        if (filters.selectedSites.length > 0) count++;
        if (filters.selectedCountries.length > 0) count++;
        if (filters.selectedStudyArms.length > 0) count++;
        if (filters.selectedProcedures.length > 0) count++;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.reviewStatus !== 'all') count++;
        if (filters.processedStatus !== 'all') count++;
        if (filters.searchTerm.trim()) count++;
        return count;
    }, [filters]);

    const addPreset = useCallback(
        (name: string) => {
            const newPreset: FilterPreset = {
                id: `custom-${Date.now()}`,
                name,
                filters: { ...filters },
            };
            setPresets({ type: 'ADD', payload: newPreset });
        },
        [filters]
    );

    const removePreset = useCallback((id: string) => {
        setPresets({ type: 'REMOVE', payload: id });
    }, []);

    const applyPreset = useCallback((preset: FilterPreset) => {
        dispatch({ type: 'SET_ALL', payload: preset.filters });
    }, []);

    return (
        <FilterContext.Provider
            value={{
                filters,
                presets,
                setFilters,
                setFilter,
                toggleArrayFilter,
                clearArrayFilter,
                resetFilters,
                getActiveFilterCount,
                addPreset,
                removePreset,
                applyPreset,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}

export { defaultFilterState };
