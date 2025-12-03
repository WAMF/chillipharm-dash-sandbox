'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LibrariesStats } from '@cp/api-client';
import { useDashboard } from '../../../contexts/DashboardContext';
import { FilterPanel } from '../../../components/FilterPanel';

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

export default function LibrariesPage() {
    const { dataLoader, isLoading: dashboardLoading } = useDashboard();

    const [stats, setStats] = useState<LibrariesStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLibrary, setSelectedLibrary] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(false);

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
                setError(
                    error_ instanceof Error
                        ? error_.message
                        : 'Failed to load statistics'
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [dataLoader]);

    const handleLibraryClick = useCallback(
        async (libraryId: number, libraryName: string) => {
            if (!dataLoader) return;

            if (
                selectedLibrary?.id === libraryId &&
                libraryAssets.length > 0
            ) {
                setSelectedLibrary(null);
                setLibraryAssets([]);
                return;
            }

            setSelectedLibrary({ id: libraryId, name: libraryName });
            setAssetsLoading(true);

            try {
                const response = await dataLoader.fetchLibraryAssets(
                    libraryId,
                    1,
                    100
                );
                setLibraryAssets(response.data);
            } catch (error_) {
                console.error('Failed to load library assets:', error_);
            } finally {
                setAssetsLoading(false);
            }
        },
        [dataLoader, selectedLibrary, libraryAssets.length]
    );

    if (dashboardLoading || isLoading) {
        return (
            <div className="space-y-6">
                <FilterPanel />
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chilli-red" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <FilterPanel />
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FilterPanel />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Libraries
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {stats?.totalLibraries ?? 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Assets
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {(stats?.totalAssets ?? 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Avg Assets per Library
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {stats && stats.totalLibraries > 0
                            ? Math.round(
                                  stats.totalAssets / stats.totalLibraries
                              )
                            : 0}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-800">
                        Library Overview
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Click a library to view its assets
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {!stats || stats.assetsPerLibrary.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No library assets found. Libraries contain assets
                            that are not associated with a site.
                        </div>
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
                                    <>
                                        <tr
                                            key={library.libraryId}
                                            className={`hover:bg-neutral-50 cursor-pointer ${
                                                selectedLibrary?.id ===
                                                library.libraryId
                                                    ? 'bg-chilli-red/5'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleLibraryClick(
                                                    library.libraryId,
                                                    library.libraryName
                                                )
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className={`transition-transform ${
                                                            selectedLibrary?.id ===
                                                            library.libraryId
                                                                ? 'rotate-90'
                                                                : ''
                                                        }`}
                                                    >
                                                        ▶
                                                    </span>
                                                    {library.libraryName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                                {library.count.toLocaleString()}
                                            </td>
                                        </tr>
                                        {selectedLibrary?.id ===
                                            library.libraryId && (
                                            <tr key={`${library.libraryId}-assets`}>
                                                <td
                                                    colSpan={2}
                                                    className="px-0 py-0"
                                                >
                                                    <div className="bg-neutral-50 border-t border-b border-neutral-200">
                                                        {assetsLoading ? (
                                                            <div className="p-4 text-center">
                                                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-chilli-red" />
                                                            </div>
                                                        ) : libraryAssets.length ===
                                                          0 ? (
                                                            <div className="p-4 text-center text-neutral-500 text-sm">
                                                                No assets in
                                                                this library
                                                            </div>
                                                        ) : (
                                                            <table className="min-w-full">
                                                                <thead>
                                                                    <tr className="text-xs text-neutral-500">
                                                                        <th className="px-6 py-2 text-left font-medium">
                                                                            Filename
                                                                        </th>
                                                                        <th className="px-6 py-2 text-right font-medium">
                                                                            Size
                                                                        </th>
                                                                        <th className="px-6 py-2 text-right font-medium">
                                                                            Duration
                                                                        </th>
                                                                        <th className="px-6 py-2 text-center font-medium">
                                                                            Processed
                                                                        </th>
                                                                        <th className="px-6 py-2 text-center font-medium">
                                                                            Reviewed
                                                                        </th>
                                                                        <th className="px-6 py-2 text-right font-medium">
                                                                            Uploaded
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {libraryAssets.map(
                                                                        asset => (
                                                                            <tr
                                                                                key={
                                                                                    asset.id
                                                                                }
                                                                                className="border-t border-neutral-200 text-sm"
                                                                            >
                                                                                <td className="px-6 py-2 text-neutral-800">
                                                                                    {
                                                                                        asset.filename
                                                                                    }
                                                                                </td>
                                                                                <td className="px-6 py-2 text-right text-neutral-600">
                                                                                    {
                                                                                        asset.filesizeFormatted
                                                                                    }
                                                                                </td>
                                                                                <td className="px-6 py-2 text-right text-neutral-600">
                                                                                    {asset.duration ||
                                                                                        '-'}
                                                                                </td>
                                                                                <td className="px-6 py-2 text-center">
                                                                                    <span
                                                                                        className={
                                                                                            asset.processed
                                                                                                ? 'text-green-600'
                                                                                                : 'text-neutral-400'
                                                                                        }
                                                                                    >
                                                                                        {asset.processed
                                                                                            ? '✓'
                                                                                            : '○'}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-2 text-center">
                                                                                    <span
                                                                                        className={
                                                                                            asset
                                                                                                .review
                                                                                                .reviewed
                                                                                                ? 'text-green-600'
                                                                                                : 'text-neutral-400'
                                                                                        }
                                                                                    >
                                                                                        {asset
                                                                                            .review
                                                                                            .reviewed
                                                                                            ? '✓'
                                                                                            : '○'}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-2 text-right text-neutral-500 text-xs">
                                                                                    {new Date(
                                                                                        asset.createdAt
                                                                                    ).toLocaleDateString()}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {stats && stats.trialDistribution.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-800">
                            Distribution by Trial
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Trial Name
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Libraries
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Assets
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {stats.trialDistribution.map(trial => (
                                    <tr
                                        key={trial.trialId}
                                        className="hover:bg-neutral-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            {trial.trialName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {trial.libraryCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {trial.assetCount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
