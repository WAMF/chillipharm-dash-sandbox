'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FilterPreset, AssetRecord } from '@cp/types';
import { useFilters } from '../contexts/FilterContext';
import { useDashboard } from '../contexts/DashboardContext';

type ArrayFilterKey =
    | 'selectedTrials'
    | 'selectedSites'
    | 'selectedCountries'
    | 'selectedStudyArms'
    | 'selectedProcedures';

export function FilterPanel() {
    const {
        filters,
        presets,
        setFilter,
        toggleArrayFilter,
        clearArrayFilter,
        resetFilters,
        getActiveFilterCount,
        addPreset,
        removePreset,
        applyPreset,
    } = useFilters();

    const { allRecords, filteredRecords, filterOptions } = useDashboard();

    const [expanded, setExpanded] = useState(false);
    const [showPresetModal, setShowPresetModal] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [searchInput, setSearchInput] = useState(filters.searchTerm);
    const [mounted, setMounted] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeFilterCount = mounted ? getActiveFilterCount() : 0;
    const hasActiveFilters = activeFilterCount > 0;

    useEffect(() => {
        setSearchInput(filters.searchTerm);
    }, [filters.searchTerm]);

    const handleSearchInput = useCallback(
        (value: string) => {
            setSearchInput(value);
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                setFilter('searchTerm', value);
            }, 300);
        },
        [setFilter]
    );

    const clearAllFilters = useCallback(() => {
        resetFilters();
        setSearchInput('');
    }, [resetFilters]);

    const handleApplyPreset = useCallback(
        (preset: FilterPreset) => {
            applyPreset(preset);
            setSearchInput(preset.filters.searchTerm);
        },
        [applyPreset]
    );

    const handleSavePreset = useCallback(() => {
        if (newPresetName.trim()) {
            addPreset(newPresetName.trim());
            setNewPresetName('');
            setShowPresetModal(false);
        }
    }, [newPresetName, addPreset]);

    const handleSelectChange = useCallback(
        (key: ArrayFilterKey, value: string) => {
            if (value) {
                toggleArrayFilter(key, value);
            }
        },
        [toggleArrayFilter]
    );

    const handleDateChange = useCallback(
        (field: 'start' | 'end', value: string) => {
            setFilter('dateRange', {
                ...filters.dateRange,
                [field]: value || null,
            });
        },
        [filters.dateRange, setFilter]
    );

    return (
        <>
            <div
                className={`rounded-lg bg-white shadow-sm mb-6 ${!expanded ? 'border-b-0' : ''}`}
            >
                <div
                    className={`flex justify-between items-center px-6 py-4 ${expanded ? 'border-b border-neutral-200' : ''}`}
                >
                    <button
                        className="flex items-center gap-2 bg-transparent border-none text-base font-semibold text-neutral-700 cursor-pointer p-0"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span className="text-xs text-neutral-500">
                            {expanded ? '▼' : '▶'}
                        </span>
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-chilli-red text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500">
                            Showing {filteredRecords.length.toLocaleString()} of{' '}
                            {allRecords.length.toLocaleString()} records
                        </span>
                        {hasActiveFilters && (
                            <button
                                className="bg-transparent border border-neutral-300 text-neutral-600 px-3 py-1.5 rounded text-xs cursor-pointer transition-all hover:bg-neutral-100 hover:border-neutral-400"
                                onClick={clearAllFilters}
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {expanded && (
                    <div className="px-6 py-4 pb-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-100">
                            <div className="flex flex-wrap gap-2">
                                {presets.map(preset => (
                                    <button
                                        key={preset.id}
                                        className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded text-sm text-neutral-700 cursor-pointer transition-all hover:bg-neutral-200"
                                        onClick={() =>
                                            handleApplyPreset(preset)
                                        }
                                    >
                                        {preset.name}
                                        {preset.id.startsWith('custom-') && (
                                            <span
                                                className="text-neutral-500 font-bold ml-1 hover:text-red-500"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    removePreset(preset.id);
                                                }}
                                            >
                                                ×
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="bg-transparent border border-dashed border-neutral-300 text-neutral-600 px-3 py-1.5 rounded text-sm cursor-pointer transition-all hover:border-chilli-red hover:text-chilli-red"
                                onClick={() => setShowPresetModal(true)}
                            >
                                + Save Current
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search assets, sites, subjects..."
                                    value={searchInput}
                                    onChange={e =>
                                        handleSearchInput(e.target.value)
                                    }
                                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                />
                            </div>

                            <MultiSelectFilter
                                label="Trial"
                                options={filterOptions.trials}
                                selected={filters.selectedTrials}
                                onToggle={value =>
                                    toggleArrayFilter('selectedTrials', value)
                                }
                                onSelect={value =>
                                    handleSelectChange('selectedTrials', value)
                                }
                            />

                            <MultiSelectFilter
                                label="Site"
                                options={filterOptions.sites}
                                selected={filters.selectedSites}
                                onToggle={value =>
                                    toggleArrayFilter('selectedSites', value)
                                }
                                onSelect={value =>
                                    handleSelectChange('selectedSites', value)
                                }
                            />

                            <MultiSelectFilter
                                label="Country"
                                options={filterOptions.countries}
                                selected={filters.selectedCountries}
                                onToggle={value =>
                                    toggleArrayFilter(
                                        'selectedCountries',
                                        value
                                    )
                                }
                                onSelect={value =>
                                    handleSelectChange(
                                        'selectedCountries',
                                        value
                                    )
                                }
                            />

                            <MultiSelectFilter
                                label="Study Arm"
                                options={filterOptions.studyArms}
                                selected={filters.selectedStudyArms}
                                onToggle={value =>
                                    toggleArrayFilter(
                                        'selectedStudyArms',
                                        value
                                    )
                                }
                                onSelect={value =>
                                    handleSelectChange(
                                        'selectedStudyArms',
                                        value
                                    )
                                }
                            />

                            <MultiSelectFilter
                                label="Procedure"
                                options={filterOptions.procedures}
                                selected={filters.selectedProcedures}
                                onToggle={value =>
                                    toggleArrayFilter(
                                        'selectedProcedures',
                                        value
                                    )
                                }
                                onSelect={value =>
                                    handleSelectChange(
                                        'selectedProcedures',
                                        value
                                    )
                                }
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                    Upload Date
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={filters.dateRange.start || ''}
                                        onChange={e =>
                                            handleDateChange(
                                                'start',
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                    />
                                    <span className="text-neutral-500 text-xs">
                                        to
                                    </span>
                                    <input
                                        type="date"
                                        value={filters.dateRange.end || ''}
                                        onChange={e =>
                                            handleDateChange(
                                                'end',
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                    Review Status
                                </label>
                                <select
                                    value={filters.reviewStatus}
                                    onChange={e =>
                                        setFilter(
                                            'reviewStatus',
                                            e.target.value as
                                                | 'all'
                                                | 'reviewed'
                                                | 'pending'
                                        )
                                    }
                                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                >
                                    <option value="all">All</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                    Processed
                                </label>
                                <select
                                    value={filters.processedStatus}
                                    onChange={e =>
                                        setFilter(
                                            'processedStatus',
                                            e.target.value as
                                                | 'all'
                                                | 'yes'
                                                | 'no'
                                        )
                                    }
                                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                >
                                    <option value="all">All</option>
                                    <option value="yes">Processed</option>
                                    <option value="no">Not Processed</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                    Sort By
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={filters.sortBy}
                                        onChange={e =>
                                            setFilter(
                                                'sortBy',
                                                e.target.value as
                                                    | keyof AssetRecord
                                                    | ''
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                                    >
                                        <option value="">Default</option>
                                        <option value="uploadDate">
                                            Upload Date
                                        </option>
                                        <option value="siteName">
                                            Site Name
                                        </option>
                                        <option value="assetTitle">
                                            Asset Title
                                        </option>
                                        <option value="subjectNumber">
                                            Subject
                                        </option>
                                        <option value="studyArm">
                                            Study Arm
                                        </option>
                                        <option value="reviewed">
                                            Review Status
                                        </option>
                                    </select>
                                    <button
                                        className="px-3 py-2 border border-neutral-300 rounded-md bg-white cursor-pointer text-base transition-all hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() =>
                                            setFilter(
                                                'sortOrder',
                                                filters.sortOrder === 'asc'
                                                    ? 'desc'
                                                    : 'asc'
                                            )
                                        }
                                        disabled={!filters.sortBy}
                                    >
                                        {filters.sortOrder === 'asc'
                                            ? '↑'
                                            : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                                <span className="text-xs text-neutral-500 font-medium">
                                    Active filters:
                                </span>
                                {filters.searchTerm && (
                                    <FilterPill
                                        label={`Search: "${filters.searchTerm}"`}
                                        onRemove={() => {
                                            setFilter('searchTerm', '');
                                            setSearchInput('');
                                        }}
                                    />
                                )}
                                {filters.selectedTrials.length > 0 && (
                                    <FilterPill
                                        label={`Trials: ${filters.selectedTrials.length}`}
                                        onRemove={() =>
                                            clearArrayFilter('selectedTrials')
                                        }
                                    />
                                )}
                                {filters.selectedSites.length > 0 && (
                                    <FilterPill
                                        label={`Sites: ${filters.selectedSites.length}`}
                                        onRemove={() =>
                                            clearArrayFilter('selectedSites')
                                        }
                                    />
                                )}
                                {filters.selectedCountries.length > 0 && (
                                    <FilterPill
                                        label={`Countries: ${filters.selectedCountries.length}`}
                                        onRemove={() =>
                                            clearArrayFilter(
                                                'selectedCountries'
                                            )
                                        }
                                    />
                                )}
                                {filters.selectedStudyArms.length > 0 && (
                                    <FilterPill
                                        label={`Arms: ${filters.selectedStudyArms.length}`}
                                        onRemove={() =>
                                            clearArrayFilter(
                                                'selectedStudyArms'
                                            )
                                        }
                                    />
                                )}
                                {filters.selectedProcedures.length > 0 && (
                                    <FilterPill
                                        label={`Procedures: ${filters.selectedProcedures.length}`}
                                        onRemove={() =>
                                            clearArrayFilter(
                                                'selectedProcedures'
                                            )
                                        }
                                    />
                                )}
                                {(filters.dateRange.start ||
                                    filters.dateRange.end) && (
                                    <FilterPill
                                        label="Date Range"
                                        onRemove={() =>
                                            setFilter('dateRange', {
                                                start: null,
                                                end: null,
                                            })
                                        }
                                    />
                                )}
                                {filters.reviewStatus !== 'all' && (
                                    <FilterPill
                                        label={
                                            filters.reviewStatus === 'reviewed'
                                                ? 'Reviewed'
                                                : 'Pending'
                                        }
                                        onRemove={() =>
                                            setFilter('reviewStatus', 'all')
                                        }
                                    />
                                )}
                                {filters.processedStatus !== 'all' && (
                                    <FilterPill
                                        label={
                                            filters.processedStatus === 'yes'
                                                ? 'Processed'
                                                : 'Not Processed'
                                        }
                                        onRemove={() =>
                                            setFilter('processedStatus', 'all')
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showPresetModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowPresetModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="m-0 mb-4 text-lg text-neutral-800">
                            Save Filter Preset
                        </h3>
                        <input
                            type="text"
                            placeholder="Preset name..."
                            value={newPresetName}
                            onChange={e => setNewPresetName(e.target.value)}
                            onKeyDown={e =>
                                e.key === 'Enter' && handleSavePreset()
                            }
                            className="w-full px-3 py-3 border border-neutral-300 rounded-md text-sm mb-4 focus:outline-none focus:border-chilli-red"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100"
                                onClick={() => setShowPresetModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-chilli-red text-white border-none hover:bg-chilli-red/90"
                                onClick={handleSavePreset}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    onSelect: (value: string) => void;
}

function MultiSelectFilter({
    label,
    options,
    selected,
    onToggle,
    onSelect,
}: MultiSelectFilterProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                {label}
            </label>
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1 min-h-6">
                    {selected.map(item => (
                        <span
                            key={item}
                            className="flex items-center gap-1 bg-chilli-red text-white px-2 py-0.5 rounded text-xs"
                        >
                            {item}
                            <button
                                className="bg-transparent border-none text-white cursor-pointer p-0 text-sm leading-none"
                                onClick={() => onToggle(item)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <select
                    value=""
                    onChange={e => {
                        onSelect(e.target.value);
                        e.target.value = '';
                    }}
                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 bg-white transition-colors focus:outline-none focus:border-chilli-red"
                >
                    <option value="">Select {label.toLowerCase()}...</option>
                    {options
                        .filter(opt => !selected.includes(opt))
                        .map(opt => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                </select>
            </div>
        </div>
    );
}

interface FilterPillProps {
    label: string;
    onRemove: () => void;
}

function FilterPill({ label, onRemove }: FilterPillProps) {
    return (
        <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded text-xs text-neutral-700">
            {label}
            <button
                className="bg-transparent border-none text-neutral-500 cursor-pointer p-0 text-sm leading-none hover:text-red-500"
                onClick={onRemove}
            >
                ×
            </button>
        </span>
    );
}
