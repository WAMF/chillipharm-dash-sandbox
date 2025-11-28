'use client';

import { useMemo, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';

const TURNAROUND_RANGES: Record<string, { min: number; max: number }> = {
    'Same day': { min: 0, max: 1 },
    '1-3 days': { min: 1, max: 3 },
    '3-7 days': { min: 3, max: 7 },
    '1-2 weeks': { min: 7, max: 14 },
    '2-4 weeks': { min: 14, max: 28 },
    '1+ month': { min: 28, max: Infinity },
};

const TURNAROUND_COLORS = [
    'rgba(16, 185, 129, 0.8)',
    'rgba(52, 211, 153, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(237, 118, 33, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(200, 16, 46, 0.8)',
];

export function ReviewPerformance() {
    const {
        reviewPerformance,
        filteredRecords,
        isLoading,
        setShowAssetList,
        setAssetListTitle,
        setAssetListRecords,
    } = useDashboard();

    const turnaroundChartData = useMemo(() => {
        if (!reviewPerformance) return { labels: [], datasets: [] };
        return {
            labels: reviewPerformance.turnaroundDistribution.map(t => t.range),
            datasets: [
                {
                    label: 'Reviews',
                    data: reviewPerformance.turnaroundDistribution.map(
                        t => t.count
                    ),
                    backgroundColor: TURNAROUND_COLORS,
                },
            ],
        };
    }, [reviewPerformance]);

    const reviewerChartData = useMemo(() => {
        if (!reviewPerformance) return { labels: [], datasets: [] };
        return {
            labels: reviewPerformance.reviewerStats.map(r => r.reviewer),
            datasets: [
                {
                    label: 'Reviews Completed',
                    data: reviewPerformance.reviewerStats.map(
                        r => r.reviewCount
                    ),
                    backgroundColor: 'rgba(200, 16, 46, 0.8)',
                },
            ],
        };
    }, [reviewPerformance]);

    const trendChartData = useMemo(() => {
        if (!reviewPerformance) return { labels: [], datasets: [] };
        return {
            labels: reviewPerformance.reviewTrend.map(t => t.date),
            datasets: [
                {
                    label: 'Avg Turnaround (days)',
                    data: reviewPerformance.reviewTrend.map(
                        t => t.avgTurnaroundDays
                    ),
                    borderColor: 'rgb(200, 16, 46)',
                    backgroundColor: 'rgba(200, 16, 46, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                },
                {
                    label: 'Review Count',
                    data: reviewPerformance.reviewTrend.map(t => t.reviewCount),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1',
                },
            ],
        };
    }, [reviewPerformance]);

    const { totalReviewed, sameDayRate } = useMemo(() => {
        if (!reviewPerformance) return { totalReviewed: 0, sameDayRate: 0 };
        const total = reviewPerformance.turnaroundDistribution.reduce(
            (sum, t) => sum + t.count,
            0
        );
        const sameDayCount =
            reviewPerformance.turnaroundDistribution.find(
                t => t.range === 'Same day'
            )?.count || 0;
        const rate = total > 0 ? (sameDayCount / total) * 100 : 0;
        return { totalReviewed: total, sameDayRate: rate };
    }, [reviewPerformance]);

    const handleReviewerClick = useCallback(
        (reviewerName: string) => {
            const reviewerAssets = filteredRecords.filter(
                r => r.reviewedBy === reviewerName
            );
            setAssetListTitle(`Assets Reviewed by: ${reviewerName}`);
            setAssetListRecords(reviewerAssets);
            setShowAssetList(true);
        },
        [
            filteredRecords,
            setAssetListTitle,
            setAssetListRecords,
            setShowAssetList,
        ]
    );

    const handleTurnaroundClick = useCallback(
        (range: string) => {
            const bucket = TURNAROUND_RANGES[range];
            if (!bucket) return;
            const matchingAssets = filteredRecords.filter(r => {
                if (!r.reviewed || !r.reviewedDate || !r.uploadDate)
                    return false;
                const reviewDate = new Date(r.reviewedDate.replace(' UTC', ''));
                const uploadDate = r.uploadDate;
                const days =
                    (reviewDate.getTime() - uploadDate.getTime()) /
                    (1000 * 60 * 60 * 24);
                return days >= bucket.min && days < bucket.max;
            });
            setAssetListTitle(`Assets with ${range} Turnaround`);
            setAssetListRecords(matchingAssets);
            setShowAssetList(true);
        },
        [
            filteredRecords,
            setAssetListTitle,
            setAssetListRecords,
            setShowAssetList,
        ]
    );

    const handleTurnaroundChartClick = useCallback(
        (data: { label: string; index: number; value: number }) => {
            if (!reviewPerformance) return;
            const bucket = reviewPerformance.turnaroundDistribution[data.index];
            if (bucket) {
                handleTurnaroundClick(bucket.range);
            }
        },
        [reviewPerformance, handleTurnaroundClick]
    );

    const handleReviewerChartClick = useCallback(
        (data: { label: string; index: number; value: number }) => {
            if (!reviewPerformance) return;
            const reviewer = reviewPerformance.reviewerStats[data.index];
            if (reviewer) {
                handleReviewerClick(reviewer.reviewer);
            }
        },
        [reviewPerformance, handleReviewerClick]
    );

    const getPerformanceBadge = useCallback((avgDays: number) => {
        if (avgDays < 1) {
            return {
                label: 'Excellent',
                className: 'bg-green-100 text-green-600',
            };
        }
        if (avgDays < 7) {
            return { label: 'Good', className: 'bg-blue-100 text-blue-600' };
        }
        return {
            label: 'Needs Attention',
            className: 'bg-red-100 text-red-600',
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-80"></div>
                </div>
            </div>
        );
    }

    if (!reviewPerformance) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-neutral-500">
                    No review performance data available.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Review Performance
                </h2>
                <p className="text-neutral-500 text-sm">
                    Turnaround times, reviewer workload, and review trends
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Avg Turnaround"
                    value={`${reviewPerformance.avgTurnaroundDays.toFixed(1)} days`}
                    subtitle="Upload to review"
                />
                <MetricCard
                    title="Same Day Reviews"
                    value={`${sameDayRate.toFixed(1)}%`}
                    subtitle="Reviewed within 24h"
                />
                <MetricCard
                    title="Total Reviewed"
                    value={totalReviewed.toLocaleString()}
                    subtitle="Completed reviews"
                />
                <MetricCard
                    title="Active Reviewers"
                    value={reviewPerformance.reviewerStats.length.toString()}
                    subtitle="Team members"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                        Turnaround Distribution
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                        Time from upload to review completion
                    </p>
                    <Chart
                        type="doughnut"
                        data={turnaroundChartData}
                        height="280px"
                        clickable={true}
                        onBarClick={handleTurnaroundChartClick}
                        options={{ plugins: { legend: { position: 'right' } } }}
                    />
                    <div className="mt-4 flex flex-col gap-2">
                        {reviewPerformance.turnaroundDistribution.map(
                            bucket => (
                                <div
                                    key={bucket.range}
                                    className="grid grid-cols-[100px_1fr_50px] items-center gap-3 cursor-pointer p-1 -mx-1 rounded hover:bg-neutral-100"
                                    onClick={() =>
                                        handleTurnaroundClick(bucket.range)
                                    }
                                    onKeyDown={e =>
                                        e.key === 'Enter' &&
                                        handleTurnaroundClick(bucket.range)
                                    }
                                    tabIndex={0}
                                    role="button"
                                >
                                    <span className="text-xs text-neutral-600">
                                        {bucket.range}
                                    </span>
                                    <div className="h-2 bg-neutral-100 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-chilli-red rounded transition-all duration-300"
                                            style={{
                                                width: `${totalReviewed > 0 ? (bucket.count / totalReviewed) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-neutral-500 text-right">
                                        {bucket.count}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                        Top Reviewers
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                        Review volume by team member
                    </p>
                    <Chart
                        type="bar"
                        data={reviewerChartData}
                        height="280px"
                        clickable={true}
                        onBarClick={handleReviewerChartClick}
                        options={{
                            indexAxis: 'y' as const,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Reviews Completed',
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                    Review Trend Over Time
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                    Monthly turnaround time and review volume
                </p>
                <Chart
                    type="line"
                    data={trendChartData}
                    height="300px"
                    options={{
                        plugins: { legend: { position: 'bottom' } },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: { display: true, text: 'Avg Days' },
                                beginAtZero: true,
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: { display: true, text: 'Review Count' },
                                beginAtZero: true,
                                grid: { drawOnChartArea: false },
                            },
                        },
                    }}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                    Reviewer Performance Details
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50">
                                <th className="text-left py-3 px-3 font-semibold text-neutral-600 border-b border-neutral-200">
                                    Reviewer
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-neutral-600 border-b border-neutral-200">
                                    Reviews
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-neutral-600 border-b border-neutral-200">
                                    Avg Turnaround
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-neutral-600 border-b border-neutral-200">
                                    Performance
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewPerformance.reviewerStats.map(reviewer => {
                                const badge = getPerformanceBadge(
                                    reviewer.avgTurnaroundDays
                                );
                                return (
                                    <tr
                                        key={reviewer.reviewer}
                                        className="cursor-pointer hover:bg-neutral-100"
                                        onClick={() =>
                                            handleReviewerClick(
                                                reviewer.reviewer
                                            )
                                        }
                                        onKeyDown={e =>
                                            e.key === 'Enter' &&
                                            handleReviewerClick(
                                                reviewer.reviewer
                                            )
                                        }
                                        tabIndex={0}
                                        role="button"
                                    >
                                        <td className="py-3 px-3 border-b border-neutral-200 font-medium">
                                            {reviewer.reviewer}
                                        </td>
                                        <td className="py-3 px-3 border-b border-neutral-200">
                                            {reviewer.reviewCount}
                                        </td>
                                        <td className="py-3 px-3 border-b border-neutral-200">
                                            {reviewer.avgTurnaroundDays.toFixed(
                                                1
                                            )}{' '}
                                            days
                                        </td>
                                        <td className="py-3 px-3 border-b border-neutral-200">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
