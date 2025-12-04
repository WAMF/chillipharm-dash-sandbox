'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import type { SitesStats } from '@cp/api-client';
import { useDashboard } from '../contexts/DashboardContext';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

export function ExecutiveOverview() {
    const {
        metrics,
        timeSeriesData,
        isLoading,
        dataLoader,
        filteredRecords,
        setSelectedAsset,
    } = useDashboard();

    const [sitesStats, setSitesStats] = useState<SitesStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const retryStatsLoad = useCallback(() => {
        setStatsError(null);
        setRetryCount(c => c + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadSitesStats() {
            if (!dataLoader) return;

            setStatsLoading(true);
            setStatsError(null);

            try {
                const sites = await dataLoader.fetchSitesStats();
                if (!cancelled) setSitesStats(sites);
            } catch (error_) {
                if (!cancelled) {
                    console.error('Failed to load sites stats:', error_);
                    setStatsError('Failed to load statistics');
                }
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        }

        loadSitesStats();

        return () => {
            cancelled = true;
        };
    }, [dataLoader, retryCount]);

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
                    label: 'Tasks Completed',
                    data: timeSeriesData.map(d => d.tasksCompleted),
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

    const recentActivity = useMemo(() => {
        return [...filteredRecords]
            .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
            .slice(0, 5);
    }, [filteredRecords]);

    const handleActivityClick = useCallback(
        (asset: (typeof filteredRecords)[0]) => {
            setSelectedAsset(asset);
        },
        [setSelectedAsset]
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

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Executive Overview
                </h2>
                <p className="text-neutral-500 text-sm">
                    Key performance indicators and trends - Sites Data
                </p>
            </div>

            {statsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-red-700 text-sm">{statsError}</span>
                    <button
                        onClick={retryStatsLoad}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Video Assets"
                    value={metrics.totalAssets.toLocaleString()}
                    subtitle="Site assets"
                    icon="📹"
                />

                <MetricCard
                    title="Active Sites"
                    value={sitesStats?.totalSites ?? metrics.totalSites}
                    subtitle="Clinical trial locations"
                    icon="🏥"
                />

                <MetricCard
                    title="Total Subjects"
                    value={
                        sitesStats?.totalSubjects ?? metrics.totalSubjects
                    }
                    subtitle="Enrolled participants"
                    icon="👥"
                />

                <MetricCard
                    title="Processing Rate"
                    value={`${metrics.processingRate.toFixed(1)}%`}
                    subtitle={`${metrics.processedCount} of ${metrics.totalAssets} processed`}
                    icon="⚡"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Task Completion"
                    value={`${metrics.taskCompletionRate.toFixed(1)}%`}
                    subtitle={`${metrics.completedTasksCount} of ${metrics.totalTasksCount} tasks`}
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

            <div className="bg-white rounded-lg shadow-sm p-6">
                <Chart
                    type="line"
                    data={chartData}
                    options={chartOptions}
                    height="350px"
                />
            </div>

            {recentActivity.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Recent Upload Activity
                    </h3>
                    <div className="flex flex-col gap-3">
                        {recentActivity.map(activity => (
                            <div
                                key={activity.assetId}
                                className="flex items-center gap-4 p-3 bg-neutral-50 rounded-md border border-neutral-200 cursor-pointer transition-all hover:bg-neutral-100 hover:border-chilli-red"
                                onClick={() => handleActivityClick(activity)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleActivityClick(activity);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-neutral-900 text-sm">
                                        {truncate(activity.assetTitle, 50)}
                                    </div>
                                    <div className="flex gap-4 flex-wrap mt-1 text-xs text-neutral-600">
                                        <span>
                                            <strong>Site:</strong>{' '}
                                            {truncate(activity.siteName, 25)}
                                        </span>
                                        <span>
                                            <strong>Subject:</strong>{' '}
                                            {activity.subjectNumber}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-neutral-500 whitespace-nowrap">
                                    {formatDate(activity.uploadDate)}
                                </div>
                                <div className="whitespace-nowrap">
                                    {activity.processed === 'Yes' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Processed
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                            Processing
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
