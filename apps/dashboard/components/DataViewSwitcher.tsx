'use client';

import type { DataViewMode } from '@cp/types';
import { DATA_VIEW_MODE_LABELS } from '@cp/types';

interface DataViewSwitcherProps {
    value: DataViewMode;
    onChange: (mode: DataViewMode) => void;
}

const MODES: DataViewMode[] = ['all', 'sites', 'library'];

const MODE_ICONS: Record<DataViewMode, React.ReactNode> = {
    all: (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
        </svg>
    ),
    sites: (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
        </svg>
    ),
    library: (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
        </svg>
    ),
};

export function DataViewSwitcher({ value, onChange }: DataViewSwitcherProps) {
    return (
        <div className="inline-flex rounded-lg bg-neutral-100 p-1">
            {MODES.map(mode => (
                <button
                    key={mode}
                    onClick={() => onChange(mode)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                        ${
                            value === mode
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }
                    `}
                >
                    {MODE_ICONS[mode]}
                    <span>{DATA_VIEW_MODE_LABELS[mode]}</span>
                </button>
            ))}
        </div>
    );
}
