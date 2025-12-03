'use client';

import { useMemo } from 'react';
import { FilterPanel } from '../../../components/FilterPanel';
import { useDashboard } from '../../../contexts/DashboardContext';
import { getLibraryDistribution } from '@cp/data-processing';

export default function LibrariesPage() {
    const { filteredRecords, isLoading } = useDashboard();

    const libraryData = useMemo(() => {
        return getLibraryDistribution(filteredRecords);
    }, [filteredRecords]);

    const totalAssets = useMemo(() => {
        return libraryData.reduce((sum, lib) => sum + lib.assetCount, 0);
    }, [libraryData]);

    if (isLoading) {
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

    return (
        <div className="space-y-6">
            <FilterPanel />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Libraries
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {libraryData.length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Assets
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {totalAssets.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Avg Assets per Library
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {libraryData.length > 0
                            ? Math.round(totalAssets / libraryData.length)
                            : 0}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-800">
                        Library Overview
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {libraryData.length === 0 ? (
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
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Reviewed
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Processed
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Review Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {libraryData.map(library => (
                                    <tr
                                        key={library.name}
                                        className="hover:bg-neutral-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            {library.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {library.assetCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {library.reviewedCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                                            {library.processedCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <span
                                                className={`${
                                                    library.assetCount > 0
                                                        ? (library.reviewedCount /
                                                              library.assetCount) *
                                                              100 >=
                                                          80
                                                            ? 'text-green-600'
                                                            : (library.reviewedCount /
                                                                    library.assetCount) *
                                                                    100 >=
                                                                50
                                                              ? 'text-yellow-600'
                                                              : 'text-red-600'
                                                        : 'text-neutral-400'
                                                }`}
                                            >
                                                {library.assetCount > 0
                                                    ? `${((library.reviewedCount / library.assetCount) * 100).toFixed(1)}%`
                                                    : 'N/A'}
                                            </span>
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
