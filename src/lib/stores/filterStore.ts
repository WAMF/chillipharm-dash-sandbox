import { writable, get } from 'svelte/store';
import type { FilterState, FilterPreset } from '../types';

const STORAGE_KEY = 'chillipharm-filters';
const PRESETS_KEY = 'chillipharm-filter-presets';
const VERSION_KEY = 'chillipharm-version';
const CURRENT_VERSION = '2';

function checkAndClearStaleData(): void {
  if (typeof window === 'undefined') return;
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PRESETS_KEY);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  } catch {
    // Ignore errors
  }
}

checkAndClearStaleData();

const defaultFilterState: FilterState = {
  selectedSites: [],
  selectedCountries: [],
  selectedStudyArms: [],
  selectedProcedures: [],
  dateRange: {
    start: null,
    end: null
  },
  reviewStatus: 'all',
  processedStatus: 'all',
  searchTerm: '',
  sortBy: '',
  sortOrder: 'desc'
};

function loadFromStorage(): FilterState {
  if (typeof window === 'undefined') return defaultFilterState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultFilterState, ...JSON.parse(stored) };
    }
  } catch {
    console.warn('Failed to load filters from localStorage');
  }
  return defaultFilterState;
}

function saveToStorage(state: FilterState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Failed to save filters to localStorage');
  }
}

function createFilterStore() {
  const { subscribe, set, update } = writable<FilterState>(loadFromStorage());

  return {
    subscribe,
    set: (value: FilterState) => {
      saveToStorage(value);
      set(value);
    },
    update: (updater: (state: FilterState) => FilterState) => {
      update(state => {
        const newState = updater(state);
        saveToStorage(newState);
        return newState;
      });
    },
    reset: () => {
      saveToStorage(defaultFilterState);
      set(defaultFilterState);
    },
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      update(state => {
        const newState = { ...state, [key]: value };
        saveToStorage(newState);
        return newState;
      });
    },
    toggleArrayFilter: (key: 'selectedSites' | 'selectedCountries' | 'selectedStudyArms' | 'selectedProcedures', value: string) => {
      update(state => {
        const current = state[key];
        const newArray = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        const newState = { ...state, [key]: newArray };
        saveToStorage(newState);
        return newState;
      });
    },
    clearArrayFilter: (key: 'selectedSites' | 'selectedCountries' | 'selectedStudyArms' | 'selectedProcedures') => {
      update(state => {
        const newState = { ...state, [key]: [] };
        saveToStorage(newState);
        return newState;
      });
    },
    getActiveFilterCount: (): number => {
      const state = get(filterStore);
      let count = 0;
      if (state.selectedSites.length > 0) count++;
      if (state.selectedCountries.length > 0) count++;
      if (state.selectedStudyArms.length > 0) count++;
      if (state.selectedProcedures.length > 0) count++;
      if (state.dateRange.start || state.dateRange.end) count++;
      if (state.reviewStatus !== 'all') count++;
      if (state.processedStatus !== 'all') count++;
      if (state.searchTerm.trim()) count++;
      return count;
    }
  };
}

export const filterStore = createFilterStore();

function loadPresetsFromStorage(): FilterPreset[] {
  if (typeof window === 'undefined') return getDefaultPresets();
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn('Failed to load presets from localStorage');
  }
  return getDefaultPresets();
}

function savePresetsToStorage(presets: FilterPreset[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    console.warn('Failed to save presets to localStorage');
  }
}

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
          end: today.toISOString().split('T')[0]
        }
      }
    },
    {
      id: 'last-30-days',
      name: 'Last 30 Days',
      filters: {
        ...defaultFilterState,
        dateRange: {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        }
      }
    },
    {
      id: 'pending-review',
      name: 'Pending Review',
      filters: {
        ...defaultFilterState,
        reviewStatus: 'pending'
      }
    },
    {
      id: 'reviewed',
      name: 'Reviewed Only',
      filters: {
        ...defaultFilterState,
        reviewStatus: 'reviewed'
      }
    }
  ];
}

function createPresetsStore() {
  const { subscribe, set, update } = writable<FilterPreset[]>(loadPresetsFromStorage());

  return {
    subscribe,
    addPreset: (name: string) => {
      const currentFilters = get(filterStore);
      update(presets => {
        const newPreset: FilterPreset = {
          id: `custom-${Date.now()}`,
          name,
          filters: { ...currentFilters }
        };
        const newPresets = [...presets, newPreset];
        savePresetsToStorage(newPresets);
        return newPresets;
      });
    },
    removePreset: (id: string) => {
      update(presets => {
        const newPresets = presets.filter(p => p.id !== id);
        savePresetsToStorage(newPresets);
        return newPresets;
      });
    },
    applyPreset: (preset: FilterPreset) => {
      filterStore.set(preset.filters);
    },
    resetToDefaults: () => {
      const defaults = getDefaultPresets();
      savePresetsToStorage(defaults);
      set(defaults);
    }
  };
}

export const presetsStore = createPresetsStore();
export { defaultFilterState };
