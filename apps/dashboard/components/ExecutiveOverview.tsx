'use client';

import { useMemo, useState, useEffect } from 'react';
import type { SitesStats, LibrariesStats } from '@cp/api-client';
import { useFilters } from '../contexts/FilterContext';
import { useDashboard } from '../contexts/DashboardContext';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';

export function ExecutiveOverview() {
    const { metrics, timeSeriesData, isLoading, dataLoader } = useDashboard();
    const { filters } = useFilters();

    const [sitesStats, setSitesStats] = useState<SitesStats | null>(null);
    const [librariesStats, setLibrariesStats] = useState<LibrariesStats | null>(
        null
    );
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        async function loadModeStats() {
            if (!dataLoader) return;

            setStatsLoading(true);
            try {
                if (
                    filters.dataViewMode === 'sites' ||
                    filters.dataViewMode === 'all'
                ) {
                    const sites = await dataLoader.fetchSitesStats();
                    setSitesStats(sites);
                }
                if (
                    filters.dataViewMode === 'library' ||
                    filters.dataViewMode === 'all'
                ) {
                    const libraries = await dataLoader.fetchLibrariesStats();
                    setLibrariesStats(libraries);
                }
            } catch (error_) {
                console.error('Failed to load mode stats:', error_);
            } finally {
                setStatsLoading(false);
            }
        }

        loadModeStats();
    }, [dataLoader, filters.dataViewMode]);

    const chartData = useMemo(
        () => ({
            labels: timeSeriesData.map(d => d.date),
            datasets: [
                {
                    label: 'Uploads',
                    data: timeSeriesData.map(d => d.uploads),
                    borderColor: 'rgb(200, 16, 46)',
                    backgroundColor: 'rgba(200, 16, 46, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Reviews',
                    data: timeSeriesData.map(d => d.reviews),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Processed',
                    data: timeSeriesData.map(d => d.processed),
                    borderColor: 'rgb(237, 118, 33)',
                    backgroundColor: 'rgba(237, 118, 33, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        }),
        [timeSeriesData]
    );

    const chartOptions = useMemo(
        () => ({
            plugins: {
                title: {
                    display: true,
                    text: 'Asset Activity Over Time',
                },
                legend: {
                    display: true,
                    position: 'bottom' as const,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        }),
        []
    );

    if (isLoading || statsLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-64"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-sm p-5"
                        >
                            <div className="animate-pulse">
                                <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-neutral-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-neutral-500">
                    No data available. Apply filters or check your connection.
                </p>
            </div>
        );
    }

    const modeLabel =
        filters.dataViewMode === 'sites'
            ? 'Sites'
            : filters.dataViewMode === 'library'
              ? 'Libraries'
              : 'All Data';

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Executive Overview
                </h2>
                <p className="text-neutral-500 text-sm">
                    Key performance indicators and trends - {modeLabel}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Video Assets"
                    value={metrics.totalAssets.toLocaleString()}
                    subtitle={
                        filters.dataViewMode === 'sites'
                            ? 'Site assets'
                            : filters.dataViewMode === 'library'
                              ? 'Library assets'
                              : 'Across all sources'
                    }
                    icon="📹"
                />

                {(filters.dataViewMode === 'sites' ||
                    filters.dataViewMode === 'all') && (
                    <MetricCard
                        title="Active Sites"
                        value={sitesStats?.totalSites ?? metrics.totalSites}
                        subtitle="Clinical trial locations"
                        icon="🏥"
                    />
                )}

                {(filters.dataViewMode === 'library' ||
                    filters.dataViewMode === 'all') && (
                    <MetricCard
                        title="Libraries"
                        value={librariesStats?.totalLibraries ?? 0}
                        subtitle="Asset libraries"
                        icon="📁"
                    />
                )}

                {(filters.dataViewMode === 'sites' ||
                    filters.dataViewMode === 'all') && (
                    <MetricCard
                        title="Total Subjects"
                        value={
                            sitesStats?.totalSubjects ?? metrics.totalSubjects
                        }
                        subtitle="Enrolled participants"
                        icon="👥"
                    />
                )}

                <MetricCard
                    title="Processing Rate"
                    value={`${metrics.processingRate.toFixed(1)}%`}
                    subtitle={`${metrics.processedCount} of ${metrics.totalAssets} processed`}
                    icon="⚡"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Review Completion"
                    value={`${metrics.reviewRate.toFixed(1)}%`}
                    subtitle={`${metrics.reviewedCount} assets reviewed`}
                    icon="✓"
                />
                <MetricCard
                    title="Compliance Score"
                    value={`${metrics.complianceRate.toFixed(1)}%`}
                    subtitle="Overall compliance rating"
                    icon="🛡️"
                />
                <MetricCard
                    title="Active Trials"
                    value={metrics.totalTrials}
                    subtitle="Clinical trials with data"
                    icon="🔬"
                />
            </div>

            {filters.dataViewMode === 'all' && sitesStats && librariesStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                            Sites Breakdown
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Sites</span>
                                <span className="font-medium">
                                    {sitesStats.totalSites}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Subjects
                                </span>
                                <span className="font-medium">
                                    {sitesStats.totalSubjects}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Site Assets
                                </span>
                                <span className="font-medium">
                                    {sitesStats.totalAssets.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Countries
                                </span>
                                <span className="font-medium">
                                    {sitesStats.countriesDistribution?.length ??
                                        0}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                            Libraries Breakdown
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Libraries
                                </span>
                                <span className="font-medium">
                                    {librariesStats.totalLibraries}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Library Assets
                                </span>
                                <span className="font-medium">
                                    {librariesStats.totalAssets.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    Avg per Library
                                </span>
                                <span className="font-medium">
                                    {librariesStats.totalLibraries > 0
                                        ? Math.round(
                                              librariesStats.totalAssets /
                                                  librariesStats.totalLibraries
                                          )
                                        : 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Trials</span>
                                <span className="font-medium">
                                    {librariesStats.trialDistribution?.length ??
                                        0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
                <Chart
                    type="line"
                    data={chartData}
                    options={chartOptions}
                    height="350px"
                />
            </div>
        </div>
    );
}
