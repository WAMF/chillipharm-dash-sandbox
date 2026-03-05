'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    VSAsset,
    AssetFilters,
    AssetSortField,
    SortDirection,
} from '@cp/types';

interface AssetFilterBarProps {
    allAssets: VSAsset[];
    onFiltersChange: (filters: AssetFilters) => void;
}

const SORT_OPTIONS: { value: AssetSortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'file_size', label: 'File Size' },
    { value: 'duration', label: 'Duration' },
];

const DEBOUNCE_DELAY_MS = 300;

function SearchIcon() {
    return (
        <svg
            className="h-5 w-5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    );
}

export function AssetFilterBar({
    allAssets,
    onFiltersChange,
}: AssetFilterBarProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [visitType, setVisitType] = useState('');
    const [assessment, setAssessment] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [visitDateFrom, setVisitDateFrom] = useState('');
    const [visitDateTo, setVisitDateTo] = useState('');
    const [sortBy, setSortBy] = useState<AssetSortField>('created_at');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, DEBOUNCE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const filterOptions = useMemo(() => {
        const visitTypes = new Set<string>();
        const assessments = new Set<string>();
        const subjectIds = new Set<string>();

        allAssets.forEach((asset) => {
            if (typeof asset.metadata?.visit_type === 'string') {
                visitTypes.add(asset.metadata.visit_type);
            }
            if (typeof asset.metadata?.Assessment === 'string') {
                assessments.add(asset.metadata.Assessment);
            }
            if (typeof asset.metadata?.subject_id === 'string') {
                subjectIds.add(asset.metadata.subject_id);
            }
        });

        return {
            visitTypes: Array.from(visitTypes).sort(),
            assessments: Array.from(assessments).sort(),
            subjectIds: Array.from(subjectIds).sort(),
        };
    }, [allAssets]);

    const emitFilters = useCallback(() => {
        onFiltersChange({
            search: debouncedSearch || undefined,
            visit_type: visitType || undefined,
            assessment: assessment || undefined,
            subject_id: subjectId || undefined,
            visit_date_from: visitDateFrom || undefined,
            visit_date_to: visitDateTo || undefined,
            sort_by: sortBy,
            sort_dir: sortDir,
        });
    }, [
        debouncedSearch,
        visitType,
        assessment,
        subjectId,
        visitDateFrom,
        visitDateTo,
        sortBy,
        sortDir,
        onFiltersChange,
    ]);

    useEffect(() => {
        emitFilters();
    }, [emitFilters]);

    const hasFilters =
        search !== '' ||
        visitType !== '' ||
        assessment !== '' ||
        subjectId !== '' ||
        visitDateFrom !== '' ||
        visitDateTo !== '';

    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setVisitType('');
        setAssessment('');
        setSubjectId('');
        setVisitDateFrom('');
        setVisitDateTo('');
    };

    const inputClass =
        'rounded-md border border-neutral-300 py-2 pl-3 pr-8 text-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red';

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full rounded-md border border-neutral-300 py-2 pl-10 pr-3 text-sm placeholder-neutral-400 focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value as AssetSortField)
                        }
                        className={inputClass}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            setSortDir((prev) =>
                                prev === 'asc' ? 'desc' : 'asc'
                            )
                        }
                        className="rounded-md border border-neutral-300 p-2 hover:bg-neutral-50 focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                        title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        <svg
                            className={`h-4 w-4 text-neutral-600 transition-transform ${
                                sortDir === 'asc' ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className={inputClass}
                >
                    <option value="">All Visit Types</option>
                    {filterOptions.visitTypes.map((vt) => (
                        <option key={vt} value={vt}>
                            {vt}
                        </option>
                    ))}
                </select>
                <select
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className={inputClass}
                >
                    <option value="">All Assessments</option>
                    {filterOptions.assessments.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>
                <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className={inputClass}
                >
                    <option value="">All Subjects</option>
                    {filterOptions.subjectIds.map((sid) => (
                        <option key={sid} value={sid}>
                            Subject {sid}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={visitDateFrom}
                    onChange={(e) => setVisitDateFrom(e.target.value)}
                    className={inputClass}
                    title="Visit date from"
                    placeholder="From"
                />
                <input
                    type="date"
                    value={visitDateTo}
                    onChange={(e) => setVisitDateTo(e.target.value)}
                    className={inputClass}
                    title="Visit date to"
                    placeholder="To"
                />
                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
