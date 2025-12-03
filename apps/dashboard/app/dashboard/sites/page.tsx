'use client';

import { useState } from 'react';
import { SitePerformance } from '../../../components/SitePerformance';
import { SiteHierarchyExplorer } from '../../../components/SiteHierarchyExplorer';
import { FilterPanel } from '../../../components/FilterPanel';

type ViewMode = 'analytics' | 'explorer';

export default function SitesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('analytics');

    return (
        <div className="space-y-6">
            <FilterPanel />

            <div className="flex items-center justify-between">
                <div className="inline-flex rounded-lg bg-neutral-100 p-1">
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'analytics'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setViewMode('explorer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'explorer'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        Hierarchy Explorer
                    </button>
                </div>
            </div>

            {viewMode === 'analytics' ? (
                <SitePerformance />
            ) : (
                <SiteHierarchyExplorer />
            )}
        </div>
    );
}
