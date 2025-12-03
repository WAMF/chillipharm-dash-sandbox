'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { LibrariesStats } from '@cp/api-client';
import type { AssetRecord } from '@cp/types';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { Chart } from '../../../../components/Chart';

interface LibraryAsset {
    id: number;
    filename: string;
    filesizeFormatted: string;
    duration: string | null;
    processed: boolean;
    createdAt: string;
    review: {
        reviewed: boolean;
        reviewDate: string | null;
    };
}

const CHART_COLORS = [
    'rgba(200, 16, 46, 0.8)',
    'rgba(237, 118, 33, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(139, 92, 246, 0.8)',
];

export default function BrowseLibrariesPage() {
    const {
        dataLoader,
        isLoading: dashboardLoading,
        setShowAssetList,
        setAssetListTitle,
        setAssetListRecords,
    } = useDashboard();

    const [stats, setStats] = useState<LibrariesStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingLibraryId, setLoadingLibraryId] = useState<number | null>(null);

    useEffect(() => {
        async function loadStats() {
            if (!dataLoader) return;

            setIsLoading(true);
            setError(null);

            try {
                const librariesStats = await dataLoader.fetchLibrariesStats();
                setStats(librariesStats);
            } catch (error_) {
                console.error('Failed to load libraries stats:', error_);
                setError(error_ instanceof Error ? error_.message : 'Failed to load statistics');
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [dataLoader]);

    const chartData = useMemo(() => {
        if (!stats || stats.assetsPerLibrary.length === 0) {
            return { labels: [], datasets: [] };
        }
        const topLibraries = stats.assetsPerLibrary.slice(0, 5);
        return {
            labels: topLibraries.map(l => l.libraryName.substring(0, 20)),
            datasets: [
                {
                    label: 'Assets',
                    data: topLibraries.map(l => l.count),
                    backgroundColor: CHART_COLORS,
                },
            ],
        };
    }, [stats]);

    const handleLibraryClick = useCallback(
        async (libraryId: number, libraryName: string) => {
            if (!dataLoader) return;

            setLoadingLibraryId(libraryId);

            try {
                const response = await dataLoader.fetchLibraryAssets(libraryId, 1, 100);

                const assetRecords: AssetRecord[] = response.data.map((asset: LibraryAsset) => ({
                    assetId: asset.id,
                    assetTitle: asset.filename,
                    trialName: '',
                    trialId: 0,
                    siteName: '',
                    siteId: 0,
                    siteCountry: '',
                    subjectNumber: '',
                    studyArm: '',
                    studyEvent: '',
                    studyProcedure: '',
                    studyProcedureDate: '',
                    uploadDate: new Date(asset.createdAt),
                    uploadedBy: '',
                    assetDuration: asset.duration || '',
                    fileSize: asset.filesizeFormatted,
                    processed: asset.processed ? 'Yes' : 'No',
                    reviewed: asset.review.reviewed,
                    reviewedBy: '',
                    reviewedDate: asset.review.reviewDate || '',
                    evaluator: '',
                    comments: '',
                    assetLink: '',
                    libraryId: libraryId,
                    libraryName: libraryName,
                }));

                setAssetListTitle(`Library: ${libraryName}`);
                setAssetListRecords(assetRecords);
                setShowAssetList(true);
            } catch (error_) {
                console.error('Failed to load library assets:', error_);
            } finally {
                setLoadingLibraryId(null);
            }
        },
        [dataLoader, setAssetListTitle, setAssetListRecords, setShowAssetList]
    );

    const handleChartClick = useCallback(
        (data: { label: string; index: number; value: number }) => {
            if (!stats) return;
            const library = stats.assetsPerLibrary[data.index];
            if (library) {
                handleLibraryClick(library.libraryId, library.libraryName);
            }
        },
        [stats, handleLibraryClick]
    );

    if (dashboardLoading || isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chilli-red" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500">
                    {stats?.totalLibraries ?? 0} libraries · {stats?.totalAssets ?? 0} assets
                </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-sm font-semibold text-neutral-700 mb-1">Top Libraries by Assets</h4>
                <p className="text-xs text-neutral-500 mb-3">Click to view assets</p>
                {stats && stats.assetsPerLibrary.length > 0 ? (
                    <Chart
                        type="bar"
                        data={chartData}
                        height="200px"
                        clickable={true}
                        onBarClick={handleChartClick}
                        options={{
                            indexAxis: 'y' as const,
                            plugins: { legend: { display: false } },
                            scales: { x: { beginAtZero: true } },
                        }}
                    />
                ) : (
                    <div className="p-8 text-center text-neutral-500">No libraries found</div>
                )}
            </div>

            <div id="libraries-explorer" className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h4 className="text-sm font-semibold text-neutral-700">Library Explorer</h4>
                    <p className="text-xs text-neutral-500 mt-1">Click a library to view its assets</p>
                </div>
                <div className="overflow-x-auto">
                    {!stats || stats.assetsPerLibrary.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">No libraries found</div>
                    ) : (
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Library Name
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Assets
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {stats.assetsPerLibrary.map(library => (
                                    <tr
                                        key={library.libraryId}
                                        className="hover:bg-neutral-50 cursor-pointer focus:outline-none focus:bg-neutral-100"
                                        onClick={() => handleLibraryClick(library.libraryId, library.libraryName)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleLibraryClick(library.libraryId, library.libraryName);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            <span className="flex items-center gap-2">
                                                {loadingLibraryId === library.libraryId ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chilli-red" />
                                                ) : (
                                                    <span className="text-chilli-red text-xs">●</span>
                                                )}
                                                {library.libraryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {library.count.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
